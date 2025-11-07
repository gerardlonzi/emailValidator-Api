 // backend/utils/cleanupCron.js
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/env.js';

const FOLDERS = [CONFIG.UPLOADS_DIR, CONFIG.RESULTS_DIR];
const MAX_AGE_MS = CONFIG.FILE_LIFETIME_MIN * 60 * 1000;

cron.schedule('0 */1 * * *', () => { // every hour
  const now = Date.now();
  FOLDERS.forEach(folder => {
    fs.readdir(folder, (err, files) => {
      if (err) return;
      files.forEach(f => {
        const fp = path.join(folder, f);
        fs.stat(fp, (err, stats) => {
          if (!err && now - stats.mtimeMs > MAX_AGE_MS) {
            fs.unlink(fp, err => { if (!err) console.log('Deleted old file', fp); });
          }
        });
      });
    });
  });
});
