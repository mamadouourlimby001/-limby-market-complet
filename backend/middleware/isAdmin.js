/**
 * Middleware isAdmin
 * Vérifie que l'utilisateur connecté a le rôle admin_simple ou admin_supreme
 * Retourne 403 si l'utilisateur n'est pas administrateur
 */
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin_simple' || req.user.role === 'admin_supreme')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
  }
};

module.exports = isAdmin;
