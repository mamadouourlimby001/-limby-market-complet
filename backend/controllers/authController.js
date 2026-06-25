const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validation basique du format téléphone guinéen (+224XXXXXXXXX ou 0XXXXXXXXX)
const isValidTelephone = (tel) => /^(\+224|00224|0)\d{8,9}$/.test(tel.trim());

// Construit l'objet user à retourner dans les réponses (sans mot de passe)
const safeUser = (user) => ({
  _id: user._id,
  nom: user.nom,
  telephone: user.telephone,
  role: user.role,
  credits: user.credits,
  isVerified: user.isVerified,
  loyaltyCount: user.loyaltyCount,
  creditExpiry: user.creditExpiry,
  createdAt: user.createdAt
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nom, telephone, motDePasse } = req.body;

    if (!nom || typeof nom !== 'string' || nom.trim().length < 2 || nom.trim().length > 100) {
      return res.status(400).json({ message: 'Le nom doit contenir entre 2 et 100 caractères.' });
    }
    if (!telephone || !isValidTelephone(telephone)) {
      return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
    }
    if (!motDePasse || motDePasse.length < 6 || motDePasse.length > 128) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir entre 6 et 128 caractères.' });
    }

    const existingUser = await User.findOne({ telephone: telephone.trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    const user = await User.create({
      nom: nom.trim(),
      telephone: telephone.trim(),
      motDePasse: hashedPassword,
      role: 'acheteur'
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: safeUser(user) });
  } catch (error) {
    console.error('register error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { telephone, motDePasse } = req.body;

    if (!telephone || !motDePasse) {
      return res.status(400).json({ message: 'Numéro de téléphone et mot de passe requis.' });
    }
    if (typeof telephone !== 'string' || telephone.length > 20) {
      return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
    }
    if (typeof motDePasse !== 'string' || motDePasse.length > 128) {
      return res.status(400).json({ message: 'Mot de passe invalide.' });
    }

    const user = await User.findOne({ telephone: telephone.trim() });
    if (!user) {
      return res.status(400).json({ message: 'Numéro de téléphone ou mot de passe incorrect.' });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Numéro de téléphone ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error('login error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-motDePasse -securityQuestions');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(user);
  } catch (error) {
    console.error('getMe error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/auth/security-questions
const setSecurityQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length !== 1) {
      return res.status(400).json({ message: '1 question est requise.' });
    }
    const q = questions[0];
    if (!q.question || typeof q.question !== 'string' || q.question.length > 200) {
      return res.status(400).json({ message: 'Question invalide.' });
    }
    if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length < 1 || q.answer.length > 200) {
      return res.status(400).json({ message: 'Réponse invalide.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedAnswer = await bcrypt.hash(q.answer.toLowerCase().trim(), salt);

    await User.findByIdAndUpdate(req.user._id, {
      securityQuestions: [{ question: q.question.trim(), answer: hashedAnswer }]
    });

    res.json({ message: 'Question de sécurité mise à jour.' });
  } catch (error) {
    console.error('setSecurityQuestions error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/verify-security-questions
const verifySecurityQuestions = async (req, res) => {
  try {
    const { telephone, answers } = req.body;

    if (!telephone || typeof telephone !== 'string' || telephone.length > 20) {
      return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
    }
    if (!answers || !Array.isArray(answers) || answers.length !== 1) {
      return res.status(400).json({ message: '1 réponse est requise.' });
    }
    if (typeof answers[0] !== 'string' || answers[0].length > 200) {
      return res.status(400).json({ message: 'Réponse invalide.' });
    }

    const user = await User.findOne({ telephone: telephone.trim() });
    if (!user || !user.securityQuestions || user.securityQuestions.length === 0) {
      // Message générique pour éviter l'énumération de comptes
      return res.status(400).json({ message: 'Impossible de vérifier. Vérifiez vos informations.' });
    }

    const isMatch = await bcrypt.compare(answers[0].toLowerCase().trim(), user.securityQuestions[0].answer);
    if (!isMatch) {
      return res.status(400).json({ message: 'Réponse incorrecte.' });
    }

    // Token à usage unique de courte durée pour la réinitialisation
    const token = jwt.sign({ id: user._id, purpose: 'reset-password' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ message: 'Question vérifiée.', token });
  } catch (error) {
    console.error('verifySecurityQuestions error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/auth/get-security-questions/:telephone
const getSecurityQuestions = async (req, res) => {
  try {
    const telephone = req.params.telephone;
    if (!telephone || telephone.length > 20) {
      return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
    }

    const user = await User.findOne({ telephone: telephone.trim() });
    // Toujours retourner la même structure pour éviter l'énumération de comptes
    if (!user || !user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({ message: 'Aucune question de sécurité configurée pour ce numéro.' });
    }

    const questions = user.securityQuestions.map(q => q.question);
    res.json({ questions });
  } catch (error) {
    console.error('getSecurityQuestions error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/reset-password (nécessite token purpose: reset-password)
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir entre 6 et 128 caractères.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user._id, {
      motDePasse: hashedPassword,
      passwordChangedAt: new Date()
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error('resetPassword error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/update-password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir entre 6 et 128 caractères.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const isMatch = await bcrypt.compare(oldPassword, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user._id, {
      motDePasse: hashedPassword,
      passwordChangedAt: new Date()
    });

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    console.error('updatePassword error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { register, login, getMe, setSecurityQuestions, verifySecurityQuestions, getSecurityQuestions, resetPassword, updatePassword };
