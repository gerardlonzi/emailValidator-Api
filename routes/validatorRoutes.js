import express from 'express';
import multer from 'multer';
import { handleValidation } from '../controllers/validatorController.js';
import { CONFIG } from '../config/env.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: CONFIG.UPLOADS_DIR });

router.post('/validate', upload.single('emailFile'), handleValidation);
router.get('/', (req, res) => res.render('index', { message: null }));
router.get('/validate', (req, res) => {
  const data = req.session.validationData;

  res.render('result', {
    results: data?.results || null,
    message: data?.message || null ,
    csvPath: data?.csvPath && fs.existsSync(path.join(CONFIG.RESULTS_DIR, path.basename(data.csvPath))) ? data.csvPath : null,
    validCsvPath: data?.validCsvPath && fs.existsSync(path.join(CONFIG.RESULTS_DIR, path.basename(data.validCsvPath))) ? data.validCsvPath : null,
    filesMissing: {
      csv: data?.csvPath ? !fs.existsSync(path.join(CONFIG.RESULTS_DIR, path.basename(data.csvPath))) : false,
      validCsv: data?.validCsvPath ? !fs.existsSync(path.join(CONFIG.RESULTS_DIR, path.basename(data.validCsvPath))) : false
    }
  });
});

export default router;
