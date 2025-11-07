// backend/controllers/resultsController.js
import { verifyDetailToken } from '../utils/detailToken.js';
import { validateOne } from '../utils/emailValidator.js';

export async function getDetail(req, res) {
  const email = String(req.query.email || '').toLowerCase();
  const token = String(req.query.token || '');

  if (!email || !token) return res.status(400).json({ success: false, error: 'Missing params' });
  if (!verifyDetailToken(email, token)) return res.status(403).json({ success:false, error:'Invalid token' });

  try {
    // Option: re-run validateOne to provide fresh detail (costly). We'll run it for now.
    const detail = await validateOne(email);
    return res.json({ success: true, detail });
  } catch (err) {
    return res.status(500).json({ success:false, error:'Server error' });
  }
}
