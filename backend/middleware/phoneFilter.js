/**
 * Middleware phoneFilter
 * Inspecte le champ description des requêtes avant enregistrement
 * Détecte les numéros de téléphone guinéens et rejette la requête
 * Patterns détectés : +224, 06x, 07x, séquences de 8+ chiffres
 */
const phoneFilter = (req, res, next) => {
  const { description } = req.body;
  
  if (!description) {
    return next();
  }

  // Regex pour détecter les numéros de téléphone guinéens
  // Détecte : +224xxxxxxxx, 06xxxxxxxx, 07xxxxxxxx, ou toute séquence de 8 chiffres consécutifs
  const phoneRegex = /(\+224\s?\d{2,3}\s?\d{2,3}\s?\d{2,3}\s?\d{0,3})|(0[67]\s?\d{2,3}\s?\d{2,3}\s?\d{2,3})|\d{8,}/g;
  
  if (phoneRegex.test(description)) {
    return res.status(400).json({ 
      message: 'Les numéros de téléphone ne sont pas autorisés dans la description.' 
    });
  }

  next();
};

module.exports = phoneFilter;
