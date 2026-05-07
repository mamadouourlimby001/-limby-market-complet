/**
 * Middleware isSupremeAdmin
 * Vérifie que l'utilisateur connecté a strictement le rôle admin_supreme
 * Seul l'administrateur suprême peut nommer/révoquer des administrateurs simples
 * Retourne 403 sinon
 */
const isSupremeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin_supreme') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Droits administrateur suprême requis.' });
  }
};

module.exports = isSupremeAdmin;
