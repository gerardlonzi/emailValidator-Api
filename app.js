import express from 'express';
import path from 'path';
import session from 'express-session';
import { CONFIG } from './config/env.js';
import validatorRoutes from './routes/validatorRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import cors from 'cors';
import "./utils/cleanupCron.js"

const app = express();
app.set('view engine', 'ejs');
app.set('views', CONFIG.VIEWS_DIR);
app.use(express.static(CONFIG.PUBLIC_DIR));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: CONFIG.DETAIL_SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } 
}));
app.use(cors());
app.use('/', validatorRoutes);
app.use('/api', apiRoutes);
app.use('/results', express.static(CONFIG.RESULTS_DIR));

app.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running at http://localhost:${CONFIG.PORT}`);
});
