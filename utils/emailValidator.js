import validator from 'validator';
import dns from 'dns';
import { SMTPClient } from 'smtp-client';
import crypto from 'crypto';
import disposableDomains from 'disposable-email-domains/index.json' with { type: 'json' };
import { CONFIG } from '../config/env.js';

function randomLocalPart() {
  return 'r' + crypto.randomBytes(6).toString('hex');
}

export async function hasMx(domain) {
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    if (['ENOTFOUND', 'ETIMEOUT', 'ECONNREFUSED'].includes(err.code)) {
      const e = new Error('network_error');
      e.code = err.code;
      throw e;
    }
    return false;
  }
}

export async function checkSmtpRecipient(email, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? CONFIG.SMTP_TIMEOUT_MS;
  const fromAddress = opts.fromAddress ?? CONFIG.MAIL_FROM;
  const domain = email.split('@')[1];
  if (!domain) return { ok: false, text: 'invalid_domain' };

  const mxRecords = await dns.promises.resolveMx(domain);
  if (!mxRecords.length) return { ok: false, text: 'no_mx' };

  mxRecords.sort((a, b) => a.priority - b.priority);

  for (const mx of mxRecords) {
    const client = new SMTPClient({ host: mx.exchange, port: 25, timeout: timeoutMs });
    try {
      await client.connect();
      await client.greet({ hostname: 'localhost' });
      await client.mail({ from: fromAddress });
      const rcpt = await client.rcpt({ to: email });
      await client.quit();
      return { ok: true, text: 'accepted', mx: mx.exchange, raw: rcpt };
    } catch (err) {
      await client.quit().catch(() => {});
      if (/5\d{2}/.test(err.message)) return { ok: false, text: 'rejected', mx: mx.exchange };
    }
  }
  return { ok: false, text: 'all_mx_failed' };
}

export async function validateOne(email) {
  const out = { email, status: 'unknown', subStatus: '' };
  try {
    if (!validator.isEmail(email)) return { ...out, status: 'invalid', subStatus: 'syntax_error' };

    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(domain)) return { ...out, status: 'risky', subStatus: 'disposable' };

    const mxOk = await hasMx(domain);
    if (!mxOk) return { ...out, status: 'invalid', subStatus: 'no_mx' };

    const smtpRes = await checkSmtpRecipient(email);
    if (smtpRes.ok) return { ...out, status: 'valid', subStatus: 'smtp_accepted' };
    return { ...out, status: 'invalid', subStatus: smtpRes.text };
  } catch (e) {
    return { ...out, status: 'unknown', subStatus: e.message || 'error' };
  }
}
