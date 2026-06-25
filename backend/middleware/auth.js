const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-motDePasse');
    if (!user) {
      return res.status(401).json({ message: 'Token invalide.' });
    }

    // Invalider les tokens émis avant un changement de mot de passe
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000; // iat en secondes → ms
      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-motDePasse');
      if (user) {
        // Vérifier la validité du token par rapport au changement de mot de passe
        if (!user.passwordChangedAt || user.passwordChangedAt.getTime() <= decoded.iat * 1000) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = auth;
module.exports.optional = authOptional;
