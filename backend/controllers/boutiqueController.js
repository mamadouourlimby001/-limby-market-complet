const Boutique = require('../models/Boutique');
const BoutiqueProduct = require('../models/BoutiqueProduct');
const BoutiqueVisit = require('../models/BoutiqueVisit');
const User = require('../models/User');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

// GET /api/boutiques - Toutes les boutiques actives (gratuit)
const getBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ isActive: true })
      .populate('proprietaire', 'nom telephone isVerified').sort({ dateCreation: -1 });
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/boutiques/:id - Détail boutique + ses produits
const getBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('proprietaire', 'nom telephone isVerified');
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    const products = await BoutiqueProduct.find({ boutique: boutique._id, statut: 'actif' })
      .sort({ ordre: 1, createdAt: -1 });
    res.json({ boutique, products });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/boutiques - Créer une boutique
const createBoutique = async (req, res) => {
  try {
    const { nom, description, logo, telephone, categorie, ville, quartier } = req.body;
    
    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }
    
    // Boutique créée inactive - nécessite paiement et approbation admin
    const boutique = await Boutique.create({
      nom, description, logo, proprietaire: req.user._id, telephone, categorie, ville, quartier,
      isActive: false, dateExpiration: null
    });
    // Changer le rôle de l'utilisateur en vendeur_boutique
    await User.findByIdAndUpdate(req.user._id, { role: 'vendeur_boutique' });
    res.status(201).json(boutique);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Une boutique avec ce nom existe déjà.' });
    }
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/boutiques/:id/products - Ajouter un produit à la boutique
const addBoutiqueProduct = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire.' });
    }
    if (!boutique.isActive) {
      return res.status(400).json({ message: 'Boutique inactive. Renouvelez votre abonnement.' });
    }
    const { titre, description, prix, photos, categorie, section } = req.body;

    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }

    // Uploader les images vers Cloudinary si elles sont en base64
    let photoUrls = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const base64Photos = photos.filter(p => p && p.startsWith('data:'));
      if (base64Photos.length > 0) {
        photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/boutiques');
      }
      // Les photos qui ne sont pas en base64 sont déjà des URLs
      const existingUrls = photos.filter(p => p && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }

    const product = await BoutiqueProduct.create({
      boutique: boutique._id, titre, description, prix, photos: photoUrls, categorie,
      section: section || null
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/boutiques/:id/products/:productId
const deleteBoutiqueProduct = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    const isOwner = boutique.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    const product = await BoutiqueProduct.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    
    // Supprimer les images de Cloudinary
    if (product.photos && Array.isArray(product.photos) && product.photos.length > 0) {
      await deleteImagesFromCloudinary(product.photos);
    }
    
    // Hard delete - supprimer complètement de la base de données
    await BoutiqueProduct.findByIdAndDelete(req.params.productId);
    
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/boutiques/my-boutique - Boutique de l'utilisateur connecté + ses produits
const getMyBoutique = async (req, res) => {
  try {
    const myBoutique = await Boutique.findOne({ proprietaire: req.user._id })
      .populate('proprietaire', 'nom telephone isVerified');
    if (!myBoutique) return res.status(404).json({ message: 'Aucune boutique trouvée.' });
    const products = await BoutiqueProduct.find({ boutique: myBoutique._id, statut: 'actif' })
      .sort({ ordre: 1, createdAt: -1 });
    res.json({ boutique: myBoutique, products });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/boutiques/:id/organisation - Sauvegarder sections et ordre des produits
const updateOrganisation = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    const { sections, produits } = req.body;
    await Boutique.findByIdAndUpdate(req.params.id, { $set: { sections: sections || [] } });
    if (produits && Array.isArray(produits)) {
      await Promise.all(
        produits.map(p => BoutiqueProduct.findByIdAndUpdate(
          p._id,
          { $set: { section: p.section || null, ordre: p.ordre || 0 } }
        ))
      );
    }
    res.json({ message: 'Organisation sauvegardée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/boutiques/:id/products/:productId/disponibilite - Mettre à jour la disponibilité
const toggleProductDisponibilite = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    
    const isOwner = boutique.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    
    const product = await BoutiqueProduct.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    
    product.disponible = !product.disponible;
    await product.save();
    
    res.json({ message: 'Disponibilité mise à jour.', product });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/boutiques/:id - Mettre à jour une boutique existante
const updateBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    
    // Vérifier que l'utilisateur est le propriétaire
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire.' });
    }
    
    const { nom, description, logo, telephone, categorie, ville, quartier } = req.body;
    
    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }
    
    // Mettre à jour les champs
    if (nom) boutique.nom = nom;
    if (description) boutique.description = description;
    if (logo) boutique.logo = logo;
    if (telephone) boutique.telephone = telephone;
    if (categorie) boutique.categorie = categorie;
    if (ville) boutique.ville = ville;
    if (quartier) boutique.quartier = quartier;
    
    await boutique.save();
    
    res.json({ message: 'Boutique mise à jour avec succès.', boutique });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Une boutique avec ce nom existe déjà.' });
    }
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/boutiques/:id/visit - Enregistrer une visite de boutique
const recordBoutiqueVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { pays, region, ville } = req.body;

    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });

    // Enregistrer la visite
    await BoutiqueVisit.create({
      boutique: id,
      utilisateur: req.user ? req.user._id : null,
      pays,
      region,
      ville,
      dateDebut: new Date()
    });

    res.status(201).json({ message: 'Visite enregistrée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la visite', error: error.message });
  }
};

// GET /api/boutiques/:id/visits - Obtenir les bilans de visites de la boutique
const getBoutiqueVisits = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    
    // Vérifier que l'utilisateur est le propriétaire
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Récupérer les visites des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const visits = await BoutiqueVisit.find({
      boutique: id,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ dateDebut: -1 });

    // Grouper par jour
    const groupedByDate = {};
    visits.forEach(visit => {
      const dateStr = visit.dateDebut.toLocaleDateString('fr-GN');
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = [];
      }
      groupedByDate[dateStr].push(visit);
    });

    // Créer les bilans
    const bilans = Object.entries(groupedByDate).map(([date, dayVisits]) => {
      const totalVisites = dayVisits.length;
      const visitantsUniques = new Set();
      
      dayVisits.forEach(v => {
        if (v.utilisateur) visitantsUniques.add(v.utilisateur.toString());
        if (v.visitorId) visitantsUniques.add(v.visitorId);
      });

      // Compter par région
      const regionMap = new Map();
      dayVisits.forEach(v => {
        const region = v.region || 'Non disponible';
        regionMap.set(region, (regionMap.get(region) || 0) + 1);
      });

      // Compter par ville
      const villeMap = new Map();
      dayVisits.forEach(v => {
        const ville = v.ville || 'Non disponible';
        const region = v.region || 'Non disponible';
        const key = `${ville}|${region}`;
        const existing = villeMap.get(key);
        villeMap.set(key, {
          nom: ville,
          region: region,
          visites: (existing?.visites || 0) + 1
        });
      });

      return {
        date,
        dateDebut: dayVisits[0].dateDebut.toLocaleString('fr-GN'),
        dateFin: new Date(dayVisits[0].dateDebut.getTime() + 86400000).toLocaleString('fr-GN'),
        totalVisites,
        visitantsUniques: visitantsUniques.size,
        parRegion: Array.from(regionMap.entries())
          .map(([nom, visites]) => ({ nom, visites }))
          .sort((a, b) => b.visites - a.visites),
        parVille: Array.from(villeMap.values())
          .sort((a, b) => b.visites - a.visites)
      };
    });

    res.json({ bilans: bilans.sort((a, b) => new Date(b.date) - new Date(a.date)) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des visites', error: error.message });
  }
};

// POST /api/boutiques/:id/visits/delete - Supprimer un bilan de visite par date
const deleteBoutiqueVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    
    // Vérifier que l'utilisateur est le propriétaire
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Parser la date
    const [day, month, year] = date.split('/');
    const dateDebut = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dateFin = new Date(year, month - 1, parseInt(day) + 1, 0, 0, 0, 0);

    // Supprimer les visites
    const result = await BoutiqueVisit.deleteMany({
      boutique: id,
      dateDebut: { $gte: dateDebut, $lt: dateFin }
    });

    res.json({ message: 'Bilan supprimé', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

module.exports = { getBoutiques, getBoutique, createBoutique, addBoutiqueProduct, deleteBoutiqueProduct, getMyBoutique, toggleProductDisponibilite, updateBoutique, recordBoutiqueVisit, getBoutiqueVisits, deleteBoutiqueVisit, updateOrganisation };
