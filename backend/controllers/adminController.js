const User = require('../models/User');
const Product = require('../models/Product');
const Location = require('../models/Location');
const Announcement = require('../models/Announcement');
const Boutique = require('../models/Boutique');
const BoutiqueProduct = require('../models/BoutiqueProduct');
const CreditRequest = require('../models/CreditRequest');
const SubscriptionRequest = require('../models/SubscriptionRequest');
const ContactUnlock = require('../models/ContactUnlock');
const Report = require('../models/Report');
const ActionHistory = require('../models/ActionHistory');
const Notification = require('../models/Notification');

// GET /api/admin/credit-requests
const getCreditRequests = async (req, res) => {
  try {
    const requests = await CreditRequest.find({ statut: 'en_attente' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/credit-requests/:id/approve
const approveCreditRequest = async (req, res) => {
  try {
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande introuvable.' });
    if (request.statut !== 'en_attente') return res.status(400).json({ message: 'Demande déjà traitée.' });

    // Calcul des crédits selon packs
    let credits = 0;
    const montant = request.montant;
    if (montant >= 2000) { credits = Math.floor(montant / 2000) * 12; const reste = montant % 2000; if (reste >= 1000) { credits += 6; } else { credits += Math.floor(reste / 200); } }
    else if (montant >= 1000) { credits = 6 + Math.floor((montant - 1000) / 200); }
    else { credits = Math.floor(montant / 200); }

    // Trouver l'utilisateur par téléphone
    const user = await User.findOne({ telephone: request.telephoneCompte });
    if (!user) return res.status(404).json({ message: 'Utilisateur avec ce numéro introuvable.' });

    user.credits += credits;
    user.creditExpiry = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 mois
    await user.save();

    request.statut = 'approuvé';
    request.traitePar = req.user._id;
    await request.save();

    await ActionHistory.create({ utilisateur: req.user._id, action: 'credit_approuve', details: { creditRequestId: request._id, credits, montant, telephoneCompte: request.telephoneCompte } });
    await Notification.create({ destinataire: user._id, message: `${credits} crédits ajoutés à votre compte ! Montant: ${montant} GNF`, type: 'credit_achat' });

    res.json({ message: `${credits} crédits attribués à ${user.nom}.`, credits });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/credit-requests/:id/reject
const rejectCreditRequest = async (req, res) => {
  try {
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande introuvable.' });
    request.statut = 'rejeté';
    request.traitePar = req.user._id;
    await request.save();
    res.json({ message: 'Demande rejetée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/subscription-requests
const getSubscriptionRequests = async (req, res) => {
  try {
    const requests = await SubscriptionRequest.find({ statut: 'en_attente' }).populate('boutique').populate('demandeur', 'nom telephone').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/subscription-requests/:id/approve
const approveSubscriptionRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande introuvable.' });
    const boutique = await Boutique.findById(request.boutique);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    boutique.isActive = true;
    boutique.dateExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await boutique.save();
    request.statut = 'approuvé';
    request.traitePar = req.user._id;
    await request.save();
    await Notification.create({ destinataire: request.demandeur, message: `Votre boutique "${boutique.nom}" a été renouvelée pour 30 jours !`, type: 'abonnement_renouveler' });
    res.json({ message: 'Abonnement renouvelé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/subscription-requests/:id/reject
const rejectSubscriptionRequest = async (req, res) => {
  try {
    const request = await SubscriptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande introuvable.' });
    request.statut = 'rejeté';
    request.traitePar = req.user._id;
    await request.save();
    res.json({ message: 'Demande de renouvellement rejetée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ statut: 'en_attente' }).populate('signalePar', 'nom telephone').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/reports/:id/handle
const handleReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Signalement introuvable.' });
    const { action } = req.body; // 'supprimer' ou 'ignorer'
    if (action === 'supprimer') {
      const models = { product: Product, location: Location, announcement: Announcement, boutique: Boutique };
      const Model = models[report.typeContenu];
      if (Model) {
        const item = await Model.findById(report.contenuId);
        if (item) {
          if (report.typeContenu === 'boutique') { item.isActive = false; }
          else { item.statut = 'supprimé'; }
          await item.save();
        }
      }
    }
    report.statut = 'traité';
    await report.save();
    res.json({ message: `Signalement traité (${action}).` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await Product.updateMany({ vendeur: user._id }, { statut: 'supprimé' });
    await Location.updateMany({ proprietaire: user._id }, { statut: 'supprimé' });
    await Announcement.updateMany({ auteur: user._id }, { statut: 'supprimé' });
    await Boutique.updateMany({ proprietaire: user._id }, { isActive: false });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur et ses publications supprimés.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/users/:id/add-credits
const addCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    user.credits += Number(credits);
    user.creditExpiry = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    await user.save();
    await ActionHistory.create({ utilisateur: req.user._id, action: 'credits_ajoutes_manuellement', details: { userId: user._id, credits } });
    await Notification.create({ destinataire: user._id, message: `${credits} crédits ajoutés à votre compte par un administrateur.`, type: 'credit_achat' });
    res.json({ message: `${credits} crédits ajoutés à ${user.nom}.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/users/:id/remove-credits
const removeCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    
    const creditsToRemove = Number(credits);
    if (creditsToRemove <= 0) return res.status(400).json({ message: 'Le nombre de crédits doit être positif.' });
    
    if (user.credits < creditsToRemove) {
      return res.status(400).json({ message: `Impossible de retirer ${creditsToRemove} crédits. L'utilisateur n'en a que ${user.credits}.` });
    }
    
    user.credits -= creditsToRemove;
    await user.save();
    await ActionHistory.create({ utilisateur: req.user._id, action: 'credits_retires_manuellement', details: { userId: user._id, credits: creditsToRemove } });
    await Notification.create({ destinataire: user._id, message: `${creditsToRemove} crédits ont été retirés de votre compte par un administrateur.`, type: 'credit_retiré' });
    res.json({ message: `${creditsToRemove} crédits retirés de ${user.nom}.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/users/:id/set-verified
const setVerified = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified }, { new: true }).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: `Badge vérifié ${isVerified ? 'attribué' : 'retiré'}.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/boutiques/:id/set-active
const setBoutiqueActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    res.json({ message: `Boutique ${isActive ? 'activée' : 'désactivée'}.`, boutique });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/boutiques/:id/set-verified
const setBoutiqueVerified = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const boutique = await Boutique.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    res.json({ message: `Badge boutique ${isVerified ? 'attribué' : 'retiré'}.`, boutique });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/boutiques/:id/renew
const renewBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    boutique.isActive = true;
    boutique.dateExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await boutique.save();
    await Notification.create({ destinataire: boutique.proprietaire, message: `Votre boutique "${boutique.nom}" a été renouvelée pour 30 jours.`, type: 'abonnement_renouveler' });
    res.json({ message: 'Boutique renouvelée pour 30 jours.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/admins/add (supreme admin only)
const addAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role: 'admin_simple' }, { new: true }).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: `${user.nom} est maintenant administrateur.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/admin/admins/:id (supreme admin only)
const removeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'acheteur' }, { new: true }).select('-motDePasse');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: `${user.nom} n'est plus administrateur.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ statut: 'actif' });
    const totalLocations = await Location.countDocuments({ statut: 'actif' });
    const totalAnnouncements = await Announcement.countDocuments({ statut: 'actif' });
    const totalBoutiques = await Boutique.countDocuments({ isActive: true });
    const totalUnlocks = await ContactUnlock.countDocuments();
    
    const approvedCreditRequests = await CreditRequest.find({ statut: 'approuvé' });
    const creditRevenue = approvedCreditRequests.reduce((sum, r) => sum + r.montant, 0);
    
    const approvedSubscriptionRequests = await SubscriptionRequest.find({ statut: 'approuvé' });
    const subscriptionRevenue = approvedSubscriptionRequests.reduce((sum, r) => sum + r.montant, 0);
    
    const totalRevenue = creditRevenue + subscriptionRevenue;
    const totalCreditsVendus = approvedCreditRequests.length;
    
    const recentTransactions = await CreditRequest.find().sort({ createdAt: -1 }).limit(10);
    res.json({
      totalUsers, totalProducts, totalLocations, totalAnnouncements, totalBoutiques,
      totalCreditsVendus, totalUnlocks, totalRevenue, recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  getCreditRequests, approveCreditRequest, rejectCreditRequest,
  getSubscriptionRequests, approveSubscriptionRequest, rejectSubscriptionRequest,
  getReports, handleReport, getUsers, deleteUser, addCredits, removeCredits, setVerified,
  setBoutiqueActive, setBoutiqueVerified, renewBoutique,
  addAdmin, removeAdmin, getDashboardStats
};
