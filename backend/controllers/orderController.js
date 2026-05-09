const Order = require('../models/Order');
const BoutiqueProduct = require('../models/BoutiqueProduct');
const Boutique = require('../models/Boutique');
const User = require('../models/User');

// POST /api/orders - Créer une commande
const createOrder = async (req, res) => {
  try {
    const { boutiqueId, productId, quantite } = req.body;

    if (!quantite || quantite < 1) {
      return res.status(400).json({ message: 'La quantité doit être au minimum 1.' });
    }

    // Vérifier que le produit existe
    const product = await BoutiqueProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique introuvable.' });
    }

    // Vérifier que le produit appartient à la boutique
    if (product.boutique.toString() !== boutiqueId) {
      return res.status(400).json({ message: 'Ce produit n\'appartient pas à cette boutique.' });
    }

    // Vérifier que l'acheteur n'est pas le vendeur
    if (req.user._id.toString() === boutique.proprietaire.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas commander auprès de votre propre boutique.' });
    }

    // Calculer le prix total
    const prixTotal = product.prix * quantite;

    // Créer la commande
    const order = await Order.create({
      acheteur: req.user._id,
      boutique: boutiqueId,
      produit: productId,
      quantite,
      prixUnitaire: product.prix,
      prixTotal
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/orders/my-orders - Récupérer les commandes de l'acheteur
const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ acheteur: req.user._id })
      .populate('boutique', 'nom logo proprietaire')
      .populate('produit', 'titre photos prix')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/orders/my-boutique-orders - Récupérer les commandes pour la boutique du vendeur
const getSellerOrders = async (req, res) => {
  try {
    // Récupérer la boutique du vendeur
    const boutique = await Boutique.findOne({ proprietaire: req.user._id });
    if (!boutique) {
      return res.status(404).json({ message: 'Vous n\'avez pas de boutique.' });
    }

    // Récupérer les commandes pour cette boutique
    const orders = await Order.find({ boutique: boutique._id })
      .populate('acheteur', 'nom telephone email')
      .populate('produit', 'titre photos prix')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PATCH /api/orders/:id/status - Mettre à jour le statut de la commande
const updateOrderStatus = async (req, res) => {
  try {
    const { statut } = req.body;

    if (!['en_attente', 'confirmé', 'expédié', 'livré', 'annulé'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    // Récupérer la commande
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    // Vérifier que l'utilisateur est le vendeur
    const boutique = await Boutique.findById(order.boutique);
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire de cette boutique.' });
    }

    // Mettre à jour le statut
    order.statut = statut;
    order.updatedAt = new Date();
    await order.save();

    // Créer une notification pour l'acheteur
    const Notification = require('../models/Notification');
    const messages = {
      confirmé: `Votre commande a été confirmée par la boutique ${boutique.nom}`,
      expédié: `Votre commande a été expédiée par la boutique ${boutique.nom}`,
      livré: `Votre commande a été livrée par la boutique ${boutique.nom}`,
      annulé: `Votre commande a été annulée par la boutique ${boutique.nom}`
    };

    await Notification.create({
      utilisateur: order.acheteur,
      type: 'commande',
      message: messages[statut],
      reference: order._id
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/orders/:id - Annuler une commande
const cancelOrder = async (req, res) => {
  try {
    // Récupérer la commande
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    // Vérifier que l'utilisateur est l'acheteur
    if (order.acheteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Cette commande n\'est pas la vôtre.' });
    }

    // Vérifier que la commande n'est pas déjà livrée ou annulée
    if (['livré', 'annulé'].includes(order.statut)) {
      return res.status(400).json({ message: `Impossible d'annuler une commande ${order.statut}.` });
    }

    // Annuler la commande
    order.statut = 'annulé';
    order.updatedAt = new Date();
    await order.save();

    // Créer une notification pour le vendeur
    const Notification = require('../models/Notification');
    const boutique = await Boutique.findById(order.boutique);
    await Notification.create({
      utilisateur: boutique.proprietaire,
      type: 'commande',
      message: `Une commande a été annulée par l'acheteur`,
      reference: order._id
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { createOrder, getBuyerOrders, getSellerOrders, updateOrderStatus, cancelOrder };
