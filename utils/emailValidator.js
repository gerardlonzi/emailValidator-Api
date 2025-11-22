// backend/utils/emailValidator.js
import validator from 'validator';
import dns from 'dns';
import { SMTPClient } from 'smtp-client';
import crypto from 'crypto';
import disposableDomains from 'disposable-email-domains/index.json' assert { type: 'json' };
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
  const domain = email.split('@')[1]; // Correction : utiliser l'index 1 pour le domaine
  if (!domain) return { ok: false, text: 'invalid_domain', subStatus: '5.0.1 - Syntaxe invalide' };

  let mxRecords;
  try { mxRecords = await dns.promises.resolveMx(domain); }
  catch (err) { return { ok: false, text: 'no_mx', subStatus: '5.4.4 - Pas d\'enregistrement DNS MX', raw: String(err) }; }
  if (!mxRecords || mxRecords.length === 0) return { ok: false, text: 'no_mx', subStatus: '5.4.4 - Pas d\'enregistrement DNS MX' };
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
      // Code et signification
      return { ok: true, code: 250, text: 'accepted', mx: host, subStatus: '2.0.0 - Message accepté', raw: rcpt };
    } catch (err) {
      await client.quit().catch(()=>{});
      const raw = String(err && err.message ? err.message : err);
      // Codes et significations pour les erreurs
      if (/ENOTFOUND|ECONNREFUSED|timeout/i.test(raw)) return { ok:false, text:'network_error', subStatus: '4.4.1 - Erreur réseau/Timeout', raw };
      if (/5\d{2}/.test(raw) && /(550|5\.1\.1|user unknown|not found)/i.test(raw)) return { ok:false, text:'rejected', mx:host, subStatus: '5.1.1 - Utilisateur inconnu', raw };
      if (/4\d{2}/.test(raw) || /temporar|greylist|try again/i.test(raw)) return { ok:false, text:'temporary', mx:host, subStatus: '4.2.1 - Service temporairement indisponible', raw };
      if (/5\d{2}/.test(raw)) return { ok:false, text:'rejected_generic', mx:host, subStatus: '5.0.0 - Erreur générique (5xx)', raw };
    }
  }
  return { ok:false, text:'all_mx_failed', subStatus: '4.4.1 - Aucun serveur MX n\'a répondu' };
}

function guessType(domain) {
  const webmails = ['gmail.com','yahoo.com','outlook.com','hotmail.com','live.com','icloud.com','laposte.fr','free.fr','orange.fr'];
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
      out.format = 'invalid'; out.emailStatus = 'invalid'; out.subStatus = '5.0.1 - Syntaxe invalide'; out.score = computeScore(out); return out;
    }
    // Correction : utiliser l'index 1 pour le domaine et toLowerCase()
    const domain = email.split('@')[1].toLowerCase(); 
    out.type = guessType(domain);

    if (Array.isArray(disposableDomains) && disposableDomains.includes(domain)) {
      out.format = 'risky'; out.emailStatus = 'risky'; out.subStatus = 'Domaine jetable (disposable)'; out.score = computeScore(out); return out;
    }

    let mxOk;
    try { mxOk = await hasMx(domain); }
    catch (e) { 
        out.format='unknown'; 
        out.subStatus='4.4.1 - Erreur réseau/Timeout'; 
        out.emailStatus='unknown'; 
        out.score=computeScore(out); 
        return out; 
    }

    if (!mxOk) { 
        out.format='invalid'; 
        out.subStatus='5.4.4 - Pas d\'enregistrement DNS MX'; 
        out.emailStatus='invalid'; 
        out.score=computeScore(out); 
        return out; 
    }

    const smtpRes = await checkSmtpRecipient(email);
    if (smtpRes.text === 'network_error') { 
        out.format='unknown'; 
        out.subStatus=smtpRes.subStatus; // '4.4.1 - Erreur réseau/Timeout'
        out.emailStatus='unknown'; 
        out.score=computeScore(out); 
        return out; 
    }

    if (smtpRes.ok && smtpRes.code === 250) {
      // detect catch-all (quick)
      const fake = `${randomLocalPart()}@${domain}`;
      const fakeRes = await checkSmtpRecipient(fake, { timeoutMs: 4000 });
      if (fakeRes && fakeRes.ok && fakeRes.code === 250) {
        out.format='risky'; out.subStatus='Piège à spam (catch-all)'; out.emailStatus='risky'; out.serverType=smtpRes.mx; out.score=computeScore(out); return out;
      }
      out.format='valid'; 
      out.serverType=smtpRes.mx; // Utilise le nom d'hôte MX réel ici
      out.emailStatus='valid'; 
      out.subStatus='2.0.0 - Message accepté'; 
      out.score=computeScore(out); 
      return out;
    }

    if (smtpRes.text === 'rejected' || smtpRes.code === 550) {
      out.format='invalid'; 
      out.serverType=smtpRes.mx; // Utilise le nom d'hôte MX réel ici
      out.emailStatus='invalid'; 
      out.subStatus=smtpRes.subStatus || '5.1.1 - Utilisateur inconnu'; 
      out.score=computeScore(out); 
      return out;
    }
    
    // Pour toutes les autres issues inconnues ou temporaires
    out.format='unknown'; 
    out.serverType=smtpRes.mx || 'unknown'; 
    out.emailStatus='unknown'; 
    out.subStatus=smtpRes.subStatus || '4.0.0 - Erreur temporaire générique';
    out.score=computeScore(out);
    return out;

  } catch (err) {
    out.format='unknown'; 
    out.subStatus='5.0.0 - Erreur interne/exception'; 
    out.emailStatus='unknown'; 
    out.serverType='error'; 
    out.score=computeScore(out);
    return out;
  }
}
