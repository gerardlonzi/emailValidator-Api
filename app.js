import express from 'express';
import path from 'path';
import { CONFIG } from './config/env.js';
import validatorRoutes from './routes/validatorRoutes.js';

const app = express();
app.set('view engine', 'ejs');
app.set('views', CONFIG.VIEWS_DIR);
app.use(express.static(CONFIG.PUBLIC_DIR));
app.use(express.urlencoded({ extended: true }));

app.use('/', validatorRoutes);
app.use('/results', express.static(CONFIG.RESULTS_DIR));

app.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running at http://localhost:${CONFIG.PORT}`);
});
