import express from 'express';
import multer from 'multer';
import { handleValidation } from '../controllers/validatorController.js';
import { CONFIG } from '../config/env.js';

const router = express.Router();
const upload = multer({ dest: CONFIG.UPLOADS_DIR });

router.get('/', (req, res) => res.render('index', { message: null }));
router.post('/validate', upload.single('emailFile'), handleValidation);
router.get('/validate', (req,res)=>{
    res.render('result', {
        message: null,
        csvPath: null,
        validCsvPath: null,
        results:  null
      });
});

export default router;
