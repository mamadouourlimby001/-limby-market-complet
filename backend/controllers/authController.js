const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Contrôleur d'authentification
 * Gère l'inscription, la connexion et la récupération du profil
 */

// POST /api/auth/register - Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { nom, telephone, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ telephone });
    if (existingUser) {
      return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé.' });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    // Création de l'utilisateur avec rôle acheteur par défaut
    const user = await User.create({
      nom,
      telephone,
      motDePasse: hashedPassword,
      role: 'acheteur'
    });

    // Génération du token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        telephone: user.telephone,
        role: user.role,
        credits: user.credits,
        isVerified: user.isVerified,
        loyaltyCount: user.loyaltyCount,
        creditExpiry: user.creditExpiry,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/auth/login - Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const { telephone, motDePasse } = req.body;

    // Chercher l'utilisateur par téléphone
    const user = await User.findOne({ telephone });
    if (!user) {
      return res.status(400).json({ message: 'Numéro de téléphone ou mot de passe incorrect.' });
    }

    // Comparer le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Numéro de téléphone ou mot de passe incorrect.' });
    }

    // Génération du token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        telephone: user.telephone,
        role: user.role,
        credits: user.credits,
        isVerified: user.isVerified,
        loyaltyCount: user.loyaltyCount,
        creditExpiry: user.creditExpiry,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/auth/me - Récupérer le profil de l'utilisateur connecté
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-motDePasse');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/auth/security-questions - Ajouter/Modifier question de sécurité
const setSecurityQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || questions.length !== 1) {
      return res.status(400).json({ message: '1 question est requise.' });
    }

    const securityQuestions = await Promise.all(
      questions.map(async (q) => {
        const salt = await bcrypt.genSalt(10);
        const hashedAnswer = await bcrypt.hash(q.answer.toLowerCase().trim(), salt);
        return { question: q.question, answer: hashedAnswer };
      })
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { securityQuestions },
      { new: true }
    ).select('-motDePasse');

    res.json({ message: 'Question de sécurité mise à jour.', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/auth/verify-security-questions - Vérifier la réponse à la question de sécurité
const verifySecurityQuestions = async (req, res) => {
  try {
    const { telephone, answers } = req.body;
    const user = await User.findOne({ telephone });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({ message: 'Question de sécurité non configurée.' });
    }

    if (!answers || answers.length !== 1) {
      return res.status(400).json({ message: '1 réponse est requise.' });
    }

    const isMatch = await bcrypt.compare(
      answers[0].toLowerCase().trim(),
      user.securityQuestions[0].answer
    );
    if (!isMatch) {
      return res.status(400).json({ message: 'Réponse incorrecte.' });
    }

    const token = jwt.sign({ id: user._id, purpose: 'reset-password' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ message: 'Question vérifiée.', token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/auth/get-security-questions/:telephone - Récupérer les questions de sécurité
const getSecurityQuestions = async (req, res) => {
  try {
    const { telephone } = req.params;
    const user = await User.findOne({ telephone });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({ message: 'Questions de sécurité non configurées.' });
    }

    const questions = user.securityQuestions.map(q => q.question);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/auth/reset-password - Réinitialiser mot de passe après vérification
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user._id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(
      userId,
      { motDePasse: hashedPassword },
      { new: true }
    ).select('-motDePasse');

    res.json({ message: 'Mot de passe réinitialisé.', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/auth/update-password - Modifier mot de passe avec ancien mot de passe
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { motDePasse: hashedPassword },
      { new: true }
    ).select('-motDePasse');

    res.json({ message: 'Mot de passe modifié.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { register, login, getMe, setSecurityQuestions, verifySecurityQuestions, getSecurityQuestions, resetPassword, updatePassword };
