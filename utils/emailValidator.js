// backend/utils/emailValidator.js
import validator from 'validator';
import dns from 'dns';
import { SMTPClient } from 'smtp-client';
import crypto from 'crypto';
import disposableDomains from 'disposable-email-domains/index.json' with { type: 'json' };
import { CONFIG } from '../config/env.js';

function randomLocalPart() { return 'r' + crypto.randomBytes(6).toString('hex'); }

export async function hasMx(domain) {
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    if (err && ['ENOTFOUND','ETIMEOUT','ECONNREFUSED'].includes(err.code)) {
      const e = new Error('network_error'); e.code = err.code; throw e;
    }
    return false;
  }
}

export async function checkSmtpRecipient(email, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? CONFIG.SMTP_TIMEOUT_MS;
  const fromAddress = opts.fromAddress ?? CONFIG.MAIL_FROM;
  const domain = email.split('@')[1];
  if (!domain) return { ok: false, text: 'invalid_domain' };

  let mxRecords;
  try { mxRecords = await dns.promises.resolveMx(domain); }
  catch (err) { return { ok: false, text: 'no_mx', raw: String(err) }; }
  if (!mxRecords || mxRecords.length === 0) return { ok: false, text: 'no_mx' };
  mxRecords.sort((a,b) => a.priority - b.priority);

  for (const mx of mxRecords) {
    const host = mx.exchange;
    const client = new SMTPClient({ host, port: 25, timeout: timeoutMs });
    try {
      await client.connect();
      await client.greet({ hostname: 'localhost' });
      await client.mail({ from: fromAddress });
      const rcpt = await client.rcpt({ to: email });
      await client.quit();
      return { ok: true, code: 250, text: 'accepted', mx: host, raw: rcpt };
    } catch (err) {
      await client.quit().catch(()=>{});
      const raw = String(err && err.message ? err.message : err);
      if (/ENOTFOUND|ECONNREFUSED|timeout/i.test(raw)) return { ok:false, text:'network_error', raw };
      if (/5\d{2}/.test(raw) && /(550|5\.1\.1|user unknown|not found)/i.test(raw)) return { ok:false, text:'rejected', mx:host, raw };
      if (/4\d{2}/.test(raw) || /temporar|greylist|try again/i.test(raw)) return { ok:false, text:'temporary', mx:host, raw };
    }
  }
  return { ok:false, text:'all_mx_failed' };
}

function guessType(domain) {
  const webmails = ['gmail.com','yahoo.com','outlook.com','hotmail.com','live.com','icloud.com'];
  return webmails.includes(domain) ? 'webmail' : 'custom';
}

function computeScore(result) {
  // simple heuristic: base 50 then add/subtract
  let score = 50;
  if (result.format === 'valid') score += 30;
  if (result.emailStatus === 'valid') score += 20;
  if (result.format === 'risky') score -= 20;
  if (result.emailStatus === 'invalid') score -= 40;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return score;
}

export async function validateOne(email) {
  const out = { email, format: 'unknown', type: 'unknown', serverType: 'unknown', emailStatus: 'unknown', score: 0, subStatus: '' };
  try {
    if (!validator.isEmail(email)) {
      out.format = 'invalid'; out.emailStatus = 'invalid'; out.subStatus = 'invalid_syntax'; out.score = computeScore(out); return out;
    }
    const domain = email.split('@')[1].toLowerCase();
    out.type = guessType(domain);

    if (Array.isArray(disposableDomains) && disposableDomains.includes(domain)) {
      out.format = 'risky'; out.emailStatus = 'risky'; out.subStatus = 'disposable'; out.score = computeScore(out); return out;
    }

    let mxOk;
    try { mxOk = await hasMx(domain); }
    catch (e) { out.format='unknown'; out.subStatus='network_error'; out.emailStatus='unknown'; out.score=computeScore(out); return out; }

    if (!mxOk) { out.format='invalid'; out.subStatus='no_mx'; out.emailStatus='invalid'; out.score=computeScore(out); return out; }

    const smtpRes = await checkSmtpRecipient(email);
    if (smtpRes.text === 'network_error') { out.format='unknown'; out.subStatus='network_error'; out.emailStatus='unknown'; out.score=computeScore(out); return out; }

    if (smtpRes.ok && smtpRes.code === 250) {
      // detect catch-all (quick)
      const fake = `${randomLocalPart()}@${domain}`;
      const fakeRes = await checkSmtpRecipient(fake, { timeoutMs: 4000 });
      if (fakeRes && fakeRes.ok && fakeRes.code === 250) {
        out.format='risky'; out.subStatus='catch_all'; out.emailStatus='risky'; out.serverType='smtp_accepted'; out.score=computeScore(out); return out;
      }
      out.format='valid'; out.serverType='smtp_accepted'; out.emailStatus='valid'; out.subStatus='smtp_accepted'; out.score=computeScore(out); return out;
    }

    if (smtpRes.text === 'rejected' || smtpRes.code === 550) {
      out.format='invalid'; out.serverType='rejected'; out.emailStatus='invalid'; out.subStatus='smtp_rejected'; out.score=computeScore(out); return out;
    }

    out.format='unknown'; out.serverType=smtpRes.text || 'unknown'; out.emailStatus='unknown'; out.subStatus=smtpRes.text || 'smtp_check_failed'; out.score=computeScore(out);
    return out;
  } catch (err) {
    out.format='unknown'; out.subStatus='error'; out.emailStatus='unknown'; out.serverType='error'; out.score=computeScore(out);
    return out;
  }
}
