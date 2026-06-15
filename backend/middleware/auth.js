const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification JWT
 * Extrait le token du header Authorization Bearer
 * Attache l'utilisateur décodé à req.user
 * Retourne 401 si le token est absent ou invalide
 */
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
      return res.status(401).json({ message: 'Token invalide. Utilisateur introuvable.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

/**
 * Middleware d'authentification optionnel
 * N'attache l'utilisateur que s'il existe
 * Continue même si pas d'authentification
 */
const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-motDePasse');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignorer les erreurs et continuer
    next();
  }
};

module.exports = auth;
module.exports.optional = authOptional;
