import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import { parseCsvFile, saveCsv } from '../utils/csvUtils.js';
import { validateOne } from '../utils/emailValidator.js';
import { CONFIG } from '../config/env.js';

export async function handleValidation(req, res) {
  const manualEmails = (req.body.manualEmails || '').split(/\r?\n|,/).map(e => e.trim()).filter(Boolean);
  const file = req.file;
  const fileEmails = file ? await parseCsvFile(file.path) : [];
  const allEmails = Array.from(new Set([...manualEmails, ...fileEmails]));

  if (!allEmails.length) {
    return res.render('result', { results: [], message: 'Aucune adresse trouvée.', csvPath: null });
  }

  const limit = pLimit(CONFIG.CONCURRENCY_LIMIT);
  const results = await Promise.all(allEmails.map(email => limit(() => validateOne(email))));

  const validEmails = results.filter(r => r.status === 'valid').map(r => ({ email: r.email }));

  if (file) fs.unlinkSync(file.path);
  const timestamp = Date.now();

  const resultPath = path.join(CONFIG.RESULTS_DIR, `result-${timestamp}.csv`);
  await saveCsv(results, resultPath);

  const validPath = path.join(CONFIG.RESULTS_DIR, `valid-${timestamp}.csv`);
  if (validEmails.length) await saveCsv(validEmails, validPath);

  res.render('result', {
    results,
    message: null,
    csvPath: `/results/result-${timestamp}.csv`,
    validCsvPath: validEmails.length ? `/results/valid-${timestamp}.csv` : null,
  });
}
