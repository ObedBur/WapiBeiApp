import jwt from 'jsonwebtoken';

export default function adminAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.split(' ')[1];
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload && (payload.role === 'admin' || payload.role === 'vendeur')) {
          req.user = payload;
          return next();
        }
      } catch (e) {
        // invalid token -> fallthrough to password check
      }
    }

    // fallback: ADMIN_PASSWORD header
    if (adminPass && req.headers['x-admin-password'] === adminPass) {
      req.user = { role: 'admin', system: true };
      return next();
    }

    return res.status(401).json({ message: 'Accès admin requis' });
  } catch (err) {
    console.error('adminAuth error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}


