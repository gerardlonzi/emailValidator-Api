
import express from 'express';
import { validateEmails } from '../controllers/validatorController.js';
import { apiAuth } from '../middlewares/apiAuth.js';

const router = express.Router();

router.post('/validate', apiAuth, async (req, res) => {
  const { emails } = req.body; // attend un tableau ["a@b.com", "c@d.com"]

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Invalid payload: expected non-empty array of emails.' });
  }

  try {
    const results = await validateEmails(emails);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

export default router;
