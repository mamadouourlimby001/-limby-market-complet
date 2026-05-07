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

module.exports = { register, login, getMe };
