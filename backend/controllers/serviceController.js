const Service = require('../models/Service');
const ServicePost = require('../models/ServicePost');
const ServiceSubscriptionRequest = require('../models/ServiceSubscriptionRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

// GET /api/services - Tous les services actifs (gratuit), filtrable par métier
const getServices = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.metier) filter.metier = req.query.metier;
    const services = await Service.find(filter)
      .populate('proprietaire', 'nom telephone isVerified').sort({ dateCreation: -1 });
    res.json(services);
  } catch (error) {
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/services/:id - Détail d'un service + ses publications
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('proprietaire', 'nom telephone isVerified');
    if (!service) return res.status(404).json({ message: 'Service introuvable.' });
    const posts = await ServicePost.find({ service: service._id }).sort({ createdAt: -1 });
    res.json({ service, posts });
  } catch (error) {
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/services - Créer un profil de service
const createService = async (req, res) => {
  try {
    const { nom, metier, description, photo, telephone, ville, quartier } = req.body;

    if (!nom || typeof nom !== 'string' || nom.trim().length < 2 || nom.trim().length > 100) {
      return res.status(400).json({ message: 'Le nom doit contenir entre 2 et 100 caractères.' });
    }
    if (!metier || typeof metier !== 'string' || metier.trim().length < 2) {
      return res.status(400).json({ message: 'Le métier est requis.' });
    }
    if (description && typeof description === 'string' && description.length > 2000) {
      return res.status(400).json({ message: 'La description ne peut pas dépasser 2000 caractères.' });
    }
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }

    // Profil créé inactif - nécessite paiement et approbation admin
    const service = await Service.create({
      nom, metier, description, photo, proprietaire: req.user._id, telephone, ville, quartier,
      isActive: false, dateExpiration: null
    });
    if (!['admin_simple', 'admin_supreme'].includes(req.user.role)) {
      await User.findByIdAndUpdate(req.user._id, { role: 'vendeur_service' });
    }
    res.status(201).json(service);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Un service avec ce nom existe déjà.' });
    }
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/services/my-service - Service de l'utilisateur connecté + ses publications
const getMyService = async (req, res) => {
  try {
    const myService = await Service.findOne({ proprietaire: req.user._id })
      .populate('proprietaire', 'nom telephone isVerified');
    if (!myService) return res.status(404).json({ message: 'Aucun service trouvé.' });
    const posts = await ServicePost.find({ service: myService._id }).sort({ createdAt: -1 });
    res.json({ service: myService, posts });
  } catch (error) {
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/services/:id - Mettre à jour un service existant
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service introuvable.' });

    if (service.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire.' });
    }

    const { nom, metier, description, photo, telephone, ville, quartier } = req.body;

    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }

    if (nom) service.nom = nom;
    if (metier) service.metier = metier;
    if (description) service.description = description;
    if (photo) service.photo = photo;
    if (telephone) service.telephone = telephone;
    if (ville) service.ville = ville;
    if (quartier) service.quartier = quartier;

    await service.save();

    res.json({ message: 'Service mis à jour avec succès.', service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Un service avec ce nom existe déjà.' });
    }
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/services/:id/posts - Ajouter une publication (preuve de compétence) au profil
const addServicePost = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service introuvable.' });
    if (service.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire.' });
    }
    if (!service.isActive) {
      return res.status(400).json({ message: 'Profil inactif. Renouvelez votre abonnement.' });
    }
    const { titre, description, prix, photos } = req.body;

    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }
    if (!prix || isNaN(Number(prix)) || Number(prix) <= 0) {
      return res.status(400).json({ message: 'Un prix de la main d\'œuvre valide est requis.' });
    }

    let photoUrls = [];
    if (photos && Array.isArray(photos)) {
      if (photos.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 photos autorisées.' });
      }
      const base64Photos = photos.filter(p => p && typeof p === 'string' && p.startsWith('data:'));
      if (base64Photos.length > 0) {
        photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/services');
      }
      const existingUrls = photos.filter(p => p && typeof p === 'string' && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }

    const post = await ServicePost.create({
      service: service._id, titre, description, prix: Number(prix), photos: photoUrls
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/services/:id/posts/:postId - Supprimer une publication
const deleteServicePost = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service introuvable.' });
    const isOwner = service.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    const post = await ServicePost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Publication introuvable.' });

    if (post.photos && Array.isArray(post.photos) && post.photos.length > 0) {
      await deleteImagesFromCloudinary(post.photos);
    }

    await ServicePost.findByIdAndDelete(req.params.postId);

    res.json({ message: 'Publication supprimée avec succès.' });
  } catch (error) {
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/services/subscription-request - Demande de renouvellement abonnement service
const createServiceSubscriptionRequest = async (req, res) => {
  try {
    const { nomService, telephoneDepot, montant, serviceId } = req.body;
    const subRequest = await ServiceSubscriptionRequest.create({
      nomService, telephoneDepot, montant, service: serviceId, demandeur: req.user._id
    });
    const admins = await User.find({ role: { $in: ['admin_simple', 'admin_supreme'] } });
    for (const admin of admins) {
      await Notification.create({
        destinataire: admin._id,
        message: `Nouvelle demande de renouvellement service "${nomService}" - ${montant} GNF`,
        type: 'general'
      });
    }
    res.status(201).json({ message: 'Votre demande de renouvellement a été envoyée.', subRequest });
  } catch (error) {
    console.error('service error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getServices, getService, createService, getMyService, updateService, addServicePost, deleteServicePost, createServiceSubscriptionRequest };
