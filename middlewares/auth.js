// backend/middlewares/auth.js
export function checkApiKey(req, res, next) {
    const key = req.headers['x-api-key'] || req.query.api_key;
    if (!key || key !== process.env.API_KEY) {
      return res.status(401).json({ success: false, error: 'Unauthorized: invalid API key' });
    }
    next();
  }
  