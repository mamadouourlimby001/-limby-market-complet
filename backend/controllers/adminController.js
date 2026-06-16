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
const Visit = require('../models/Visit');
const bcrypt = require('bcryptjs');

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
    if (montant >= 10000) { credits = Math.floor(montant / 10000) * 10; const reste = montant % 10000; if (reste >= 5000) { credits += 5; } else { credits += Math.floor(reste / 1000); } }
    else if (montant >= 5000) { credits = 5 + Math.floor((montant - 5000) / 1000); }
    else { credits = Math.floor(montant / 1000); }

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
    
    if (!request.boutique) return res.status(400).json({ message: 'Boutique non associée.' });

    // Mettre à jour la boutique directement
    await Boutique.findByIdAndUpdate(request.boutique, {
      isActive: true,
      dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Mettre à jour la demande directement
    await SubscriptionRequest.findByIdAndUpdate(req.params.id, {
      statut: 'approuvé',
      traitePar: req.user._id
    });

    res.json({ message: 'Abonnement renouvelé.' });

    // Notifier le demandeur (non-bloquant, ignore les erreurs)
    try {
      if (request.demandeur) {
        const boutique = await Boutique.findById(request.boutique).select('nom');
        await Notification.create({
          destinataire: request.demandeur,
          message: `Votre boutique "${boutique.nom}" a été renouvelée pour 30 jours !`,
          type: 'abonnement_renouveler'
        });
      }
    } catch (notifErr) {
      // Ignorer les erreurs de notification
    }
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

// GET /api/admin/boutiques - Récupérer toutes les boutiques
const getAllBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find()
      .populate('proprietaire', 'nom telephone')
      .sort({ createdAt: -1 });
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/admin/boutiques/:id - Supprimer une boutique
const deleteBoutique = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supprimer les produits
    await BoutiqueProduct.deleteMany({ boutique: id });
    
    // Supprimer la boutique
    const boutique = await Boutique.findByIdAndDelete(id);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }
    
    await ActionHistory.create({
      utilisateur: req.user._id,
      action: 'boutique_supprimee',
      details: { boutiqueId: id, nom: boutique.nom }
    });
    
    res.json({ message: 'Boutique supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/admin/boutiques/:id/activate - Activer une boutique pour 30 jours
const activateBoutique = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    const boutique = await Boutique.findByIdAndUpdate(
      id,
      {
        isActive: true,
        dateExpiration: expirationDate
      },
      { new: true }
    ).populate('proprietaire', 'nom telephone');
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }
    
    await ActionHistory.create({
      utilisateur: req.user._id,
      action: 'boutique_activee',
      details: { boutiqueId: id, nom: boutique.nom }
    });
    
    res.json({ message: 'Boutique activée pour 30 jours', boutique });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/admin/boutiques/:id/deactivate - Désactiver une boutique
const deactivateBoutique = async (req, res) => {
  try {
    const { id } = req.params;
    
    const boutique = await Boutique.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('proprietaire', 'nom telephone');
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }
    
    await ActionHistory.create({
      utilisateur: req.user._id,
      action: 'boutique_desactivee',
      details: { boutiqueId: id, nom: boutique.nom }
    });
    
    res.json({ message: 'Boutique désactivée', boutique });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/admin/boutiques/:id/certify - Certifier une boutique
const certifyBoutique = async (req, res) => {
  try {
    const { id } = req.params;
    
    const boutique = await Boutique.findByIdAndUpdate(
      id,
      { isCertified: true },
      { new: true }
    ).populate('proprietaire', 'nom telephone');
    
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }
    
    await ActionHistory.create({
      utilisateur: req.user._id,
      action: 'boutique_certifiee',
      details: { boutiqueId: id, nom: boutique.nom }
    });
    
    res.json({ message: 'Boutique certifiée', boutique });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/boutiques/:id/stats - Récupérer les stats d'une boutique
const getBoutiqueDetailStats = async (req, res) => {
  try {
    const { id } = req.params;

    const boutique = await Boutique.findById(id);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    res.json({
      totalOrders: boutique.totalOrders,
      totalConfirmed: boutique.totalConfirmed,
      totalCancelled: boutique.totalCancelled,
      totalRevenue: boutique.totalRevenue,
      lastResetDate: boutique.lastResetDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des stats' });
  }
};

// POST /api/admin/reset-stats - Réinitialiser les stats du tableau de bord
const resetDashboardStats = async (req, res) => {
  try {
    // Réinitialiser les contacts débloqués
    await ContactUnlock.deleteMany({});
    
    // Réinitialiser les crédits et revenus (marquer comme traités)
    await CreditRequest.updateMany(
      { statut: 'approuvé' },
      { statut: 'reinitialise' }
    );
    
    await SubscriptionRequest.updateMany(
      { statut: 'approuvé' },
      { statut: 'reinitialise' }
    );
    
    await ActionHistory.create({
      utilisateur: req.user._id,
      action: 'stats_reinitializees',
      details: { timestamp: new Date() }
    });
    
    res.json({ message: 'Statistiques réinitialisées' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/users-security - Récupérer tous les utilisateurs avec leurs questions de sécurité
const getUsersWithSecurityQuestions = async (req, res) => {
  try {
    const users = await User.find().select('nom telephone role credits isVerified createdAt securityQuestions').sort({ createdAt: -1 });
    const usersData = users.map(user => ({
      _id: user._id,
      nom: user.nom,
      telephone: user.telephone,
      role: user.role,
      credits: user.credits,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      securityQuestion: user.securityQuestions && user.securityQuestions.length > 0 ? user.securityQuestions[0].question : 'Non configurée'
    }));
    res.json(usersData);
  } catch (error) {
    console.error('Erreur getUsersWithSecurityQuestions:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/admin/users/:id/reset-password - Réinitialiser le mot de passe d'un utilisateur
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.motDePasse = hashedPassword;
    await user.save();

    // Enregistrer l'action dans l'historique (non-bloquant)
    try {
      await ActionHistory.create({
        utilisateur: req.user._id,
        action: 'mot_de_passe_reinitialise_admin',
        details: { userId: user._id, nom: user.nom }
      });
    } catch (histErr) {
      console.error('Erreur lors de la création de ActionHistory:', histErr);
    }

    // Envoyer notification (non-bloquant)
    try {
      await Notification.create({
        destinataire: user._id,
        message: 'Votre mot de passe a été réinitialisé par un administrateur.',
        type: 'securite'
      });
    } catch (notifErr) {
      console.error('Erreur lors de la création de Notification:', notifErr);
    }

    res.json({ message: `Mot de passe de ${user.nom} réinitialisé avec succès.` });
  } catch (error) {
    console.error('Erreur resetUserPassword:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/visites - Récupérer toutes les visites des 24 dernières heures
const getVisites = async (req, res) => {
  try {
    const vingtQuatreHeures = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Récupérer tous les IDs des admins
    const admins = await User.find({ role: { $in: ['admin', 'superAdmin'] } }).select('_id');
    const adminIds = admins.map(a => a._id.toString());
    
    const visites = await Visit.find({
      createdAt: { $gte: vingtQuatreHeures },
      $or: [
        { utilisateur: { $nin: admins.map(a => a._id) } },
        { utilisateur: null }
      ]
    }).sort({ createdAt: -1 });

    const visitesFormatees = visites.map(visite => ({
      _id: visite._id,
      utilisateur: visite.utilisateur,
      visitorId: visite.visitorId,
      nom: visite.nom || 'Visiteur anonyme',
      telephone: visite.telephone || visite.visitorId || 'Non enregistré',
      pays: visite.pays || 'Non disponible',
      region: visite.region || 'Non disponible',
      ville: visite.ville || 'Non disponible',
      nombrePages: visite.pagesVisitees.length,
      dureeTotale: visite.dureeTotale || 0,
      dateDebut: visite.dateDebut,
      dateFin: visite.dateFin
    }));

    res.json({
      total: visitesFormatees.length,
      visites: visitesFormatees
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// Fonction pour obtenir les infos géographiques (pays, région, ville)
const getGeoInfo = async (ip) => {
  try {
    // Utiliser une API gratuite pour la géolocalisation
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
      pays: data.country_name || null,
      region: data.region || null,
      ville: data.city || null
    };
  } catch (error) {
    console.error('Erreur géolocalisation:', error);
    return { pays: null, region: null, ville: null };
  }
};

// POST /api/admin/track-page-visit - Enregistrer une visite de page
const trackPageVisit = async (req, res) => {
  try {
    const { page, visitorId } = req.body;
    console.log('trackPageVisit reçu:', { page, visitorId, hasUser: !!req.user, userId: req.user?._id });
    
    if (!page) {
      return res.status(400).json({ message: 'Page requise.' });
    }

    const now = new Date();
    let visit = null;
    
    // Récupérer l'IP du client
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const geoInfo = await getGeoInfo(clientIp.split(',')[0]);

    if (req.user && req.user._id) {
      // Utilisateur authentifié
      const userId = req.user._id;
      console.log('Enregistrement visite authentifiée pour:', userId);

      // Chercher une visite ouverte pour cet utilisateur
      visit = await Visit.findOne({
        utilisateur: userId,
        dateFin: null
      });

      if (visit) {
        // Ajouter la page à la visite existante
        visit.pagesVisitees.push({
          page: page,
          tempsDebut: now
        });
        visit.nombrePages = visit.pagesVisitees.length;
        await visit.save();
      } else {
        // Créer une nouvelle visite
        visit = await Visit.create({
          utilisateur: userId,
          nom: req.user.nom,
          telephone: req.user.telephone,
          pays: geoInfo.pays,
          region: geoInfo.region,
          ville: geoInfo.ville,
          pagesVisitees: [{
            page: page,
            tempsDebut: now
          }],
          dateDebut: now,
          nombrePages: 1
        });
      }
    } else if (visitorId) {
      // Visiteur anonyme
      console.log('Enregistrement visite anonyme pour:', visitorId);
      
      visit = await Visit.findOne({
        visitorId: visitorId,
        dateFin: null
      });

      if (visit) {
        // Ajouter la page à la visite existante
        visit.pagesVisitees.push({
          page: page,
          tempsDebut: now
        });
        visit.nombrePages = visit.pagesVisitees.length;
        await visit.save();
      } else {
        // Créer une nouvelle visite anonyme
        visit = await Visit.create({
          visitorId: visitorId,
          nom: 'Visiteur anonyme',
          pays: geoInfo.pays,
          region: geoInfo.region,
          ville: geoInfo.ville,
          pagesVisitees: [{
            page: page,
            tempsDebut: now
          }],
          dateDebut: now,
          nombrePages: 1
        });
      }
    } else {
      console.log('Ni utilisateur ni visitorId fourni');
    }

    console.log('Visite créée/mise à jour:', visit?._id);
    res.json({ message: 'Visite enregistrée', visitId: visit?._id });
  } catch (error) {
    console.error('Erreur trackPageVisit:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/visites/:id - Récupérer les détails d'une visite
const getVisiteDetails = async (req, res) => {
  try {
    const visite = await Visit.findById(req.params.id);
    if (!visite) return res.status(404).json({ message: 'Visite introuvable.' });

    res.json({
      _id: visite._id,
      nom: visite.nom || 'Visiteur anonyme',
      telephone: visite.telephone || visite.visitorId || 'Non enregistré',
      pays: visite.pays || 'Non disponible',
      region: visite.region || 'Non disponible',
      ville: visite.ville || 'Non disponible',
      dateDebut: visite.dateDebut,
      dateFin: visite.dateFin,
      dureeTotale: visite.dureeTotale,
      pagesVisitees: visite.pagesVisitees.map(page => ({
        page: page.page,
        tempsDebut: page.tempsDebut,
        tempsFin: page.tempsFin,
        duree: page.duree
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/admin/visites/:id - Supprimer une visite
const deleteVisite = async (req, res) => {
  try {
    const visite = await Visit.findByIdAndDelete(req.params.id);
    if (!visite) return res.status(404).json({ message: 'Visite introuvable.' });
    
    res.json({ message: 'Visite supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/admin/traffic-summary - Récupérer le bilan du trafic par 24h
const getTrafficSummary = async (req, res) => {
  try {
    const septJours = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Récupérer tous les IDs des admins
    const admins = await User.find({ role: { $in: ['admin_simple', 'admin_supreme'] } }).select('_id');
    const adminIds = admins.map(a => a._id.toString());
    
    // Récupérer les visites des 7 derniers jours (non-admins)
    const visites = await Visit.find({
      createdAt: { $gte: septJours },
      $or: [
        { utilisateur: { $nin: admins.map(a => a._id) } },
        { utilisateur: null }
      ]
    }).sort({ createdAt: -1 });

    // Regrouper par jour
    const bilanParJour = {};
    
    visites.forEach(visite => {
      const date = new Date(visite.dateDebut);
      const jour = date.toLocaleDateString('fr-GN');
      const dateDebut = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateFin = new Date(dateDebut.getTime() + 24 * 60 * 60 * 1000 - 1);
      
      if (!bilanParJour[jour]) {
        bilanParJour[jour] = {
          date: jour,
          dateDebut: dateDebut.toLocaleDateString('fr-GN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          dateFin: dateFin.toLocaleDateString('fr-GN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          totalConnexions: 0,
          utilisateurs: new Set(),
          parRegion: {},
          parVille: {}
        };
      }
      
      bilanParJour[jour].totalConnexions++;
      if (visite.utilisateur) {
        bilanParJour[jour].utilisateurs.add(visite.utilisateur.toString());
      } else if (visite.visitorId) {
        bilanParJour[jour].utilisateurs.add(visite.visitorId);
      }
      
      // Comptabiliser par région
      const region = visite.region || 'Non disponible';
      if (!bilanParJour[jour].parRegion[region]) {
        bilanParJour[jour].parRegion[region] = 0;
      }
      bilanParJour[jour].parRegion[region]++;
      
      // Comptabiliser par ville
      const ville = visite.ville || 'Non disponible';
      const regionVille = region;
      const keyVille = `${ville}__${regionVille}`;
      if (!bilanParJour[jour].parVille[keyVille]) {
        bilanParJour[jour].parVille[keyVille] = {
          nom: ville,
          region: regionVille,
          connexions: 0
        };
      }
      bilanParJour[jour].parVille[keyVille].connexions++;
    });

    // Transformer les données en format lisible
    const bilans = Object.values(bilanParJour).map(bilan => ({
      date: bilan.date,
      dateDebut: bilan.dateDebut,
      dateFin: bilan.dateFin,
      totalConnexions: bilan.totalConnexions,
      utilisateursUniques: bilan.utilisateurs.size,
      parRegion: Object.entries(bilan.parRegion)
        .map(([nom, connexions]) => ({ nom, connexions }))
        .sort((a, b) => b.connexions - a.connexions),
      parVille: Object.values(bilan.parVille)
        .sort((a, b) => b.connexions - a.connexions)
    }));

    // Trier par date décroissante (les plus récents en premier)
    bilans.sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));

    res.json({ bilans });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = {
  getCreditRequests, approveCreditRequest, rejectCreditRequest,
  getSubscriptionRequests, approveSubscriptionRequest, rejectSubscriptionRequest,
  getReports, handleReport, getUsers, deleteUser, addCredits, removeCredits, setVerified,
  setBoutiqueActive, setBoutiqueVerified, renewBoutique,
  addAdmin, removeAdmin, getDashboardStats,
  getAllBoutiques, deleteBoutique, activateBoutique, deactivateBoutique, certifyBoutique, resetDashboardStats,
  getBoutiqueDetailStats, getUsersWithSecurityQuestions, resetUserPassword,
  getVisites, getVisiteDetails, trackPageVisit, deleteVisite, getTrafficSummary
};
