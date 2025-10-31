import fs from 'fs';
import csv from 'fast-csv';

export function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const emails = [];
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: false }))
      .on('data', (row) => {
        const raw = Array.isArray(row) ? row[0] : Object.values(row)[0];
        if (raw) emails.push(String(raw).trim());
      })
      .on('end', () => resolve(emails))
      .on('error', reject);
  });
}

export async function saveCsv(results, outputPath) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(outputPath);
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(ws).on('finish', resolve).on('error', reject);
    results.forEach(r => csvStream.write(r));
    csvStream.end();
  });
}
