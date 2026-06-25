const CreditRequest = require('../models/CreditRequest');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const ContactUnlock = require('../models/ContactUnlock');
const Notification = require('../models/Notification');
const User = require('../models/User');

// POST /api/credits/request - Demande d'achat de crédits
const requestCredits = async (req, res) => {
  try {
    const { nomCompte, telephoneDepot, montant, telephoneCompte } = req.body;

    if (!nomCompte || typeof nomCompte !== 'string' || nomCompte.trim().length > 100) {
      return res.status(400).json({ message: 'Nom de compte invalide.' });
    }
    if (!montant || isNaN(Number(montant)) || Number(montant) <= 0 || Number(montant) > 10000000) {
      return res.status(400).json({ message: 'Montant invalide.' });
    }

    const creditRequest = await CreditRequest.create({ nomCompte: nomCompte.trim(), telephoneDepot, montant: Number(montant), telephoneCompte });
    // Notifier tous les admins
    const admins = await User.find({ role: { $in: ['admin_simple', 'admin_supreme'] } });
    for (const admin of admins) {
      await Notification.create({
        destinataire: admin._id,
        message: `Nouvelle demande de crédits de ${nomCompte} - ${montant} GNF`,
        type: 'general'
      });
    }
    res.status(201).json({ message: 'Votre demande a été envoyée. Elle sera traitée sous peu.', creditRequest });
  } catch (error) {
    console.error('credit error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/credits/my-history - Historique des crédits de l'utilisateur
const getMyHistory = async (req, res) => {
  try {
    const unlocks = await ContactUnlock.find({ utilisateur: req.user._id }).sort({ createdAt: -1 });
    const requests = await CreditRequest.find({ telephoneCompte: req.user.telephone }).sort({ createdAt: -1 });
    res.json({ unlocks, requests });
  } catch (error) {
    console.error('credit error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/credits/subscription-request - Demande de renouvellement abonnement boutique
const subscriptionRequest = async (req, res) => {
  try {
    const { nomBoutique, telephoneDepot, montant, boutiqueId } = req.body;
    const subRequest = await SubscriptionRequest.create({
      nomBoutique, telephoneDepot, montant, boutique: boutiqueId, demandeur: req.user._id
    });
    const admins = await User.find({ role: { $in: ['admin_simple', 'admin_supreme'] } });
    for (const admin of admins) {
      await Notification.create({
        destinataire: admin._id,
        message: `Nouvelle demande de renouvellement boutique "${nomBoutique}" - ${montant} GNF`,
        type: 'general'
      });
    }
    res.status(201).json({ message: 'Votre demande de renouvellement a été envoyée.', subRequest });
  } catch (error) {
    console.error('credit error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { requestCredits, getMyHistory, subscriptionRequest };
