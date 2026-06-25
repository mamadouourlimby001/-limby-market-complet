const Order = require('../models/Order');
const BoutiqueProduct = require('../models/BoutiqueProduct');
const Boutique = require('../models/Boutique');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Contrôleur des commandes
 * Gère la création, lecture et gestion des commandes
 */

// POST /api/orders - Créer une commande
const createOrder = async (req, res) => {
  try {
    const { productId, quantite, noteAcheteur } = req.body;
    const buyerId = req.user._id;

    // Vérifier que le produit existe
    const product = await BoutiqueProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Récupérer la boutique
    const boutique = await Boutique.findById(product.boutique);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    // Créer la commande
    const prixTotal = product.prix * (quantite || 1);
    const order = await Order.create({
      product: productId,
      boutique: product.boutique,
      buyer: buyerId,
      quantite: quantite || 1,
      prixTotal,
      noteAcheteur: noteAcheteur || ''
    });

    // Incrémenter le compteur de commandes totales
    await Boutique.findByIdAndUpdate(
      product.boutique,
      { $inc: { totalOrders: 1 } }
    );

    // Notifier le vendeur
    await Notification.create({
      destinataire: boutique.proprietaire,
      message: `Nouvelle commande: ${product.titre}`,
      type: 'general'
    });

    await order.populate([
      { path: 'product' },
      { path: 'boutique' },
      { path: 'buyer', select: 'nom telephone' }
    ]);

    res.status(201).json({
      message: 'Commande créée avec succès',
      order
    });
  } catch (error) {
    console.error(error);
    console.error('order error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/orders/my-orders - Récupérer les commandes de l'acheteur
const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const orders = await Order.find({ buyer: buyerId })
      .populate('product')
      .populate('boutique', 'nom logo')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    console.error('order error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/orders/boutique-orders - Récupérer les commandes du vendeur
const getBoutiqueOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer la boutique de l'utilisateur
    const boutique = await Boutique.findOne({ proprietaire: userId });
    if (!boutique) {
      return res.status(404).json({ message: 'Aucune boutique trouvée' });
    }

    const orders = await Order.find({ boutique: boutique._id })
      .populate('product')
      .populate('buyer', 'nom telephone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    console.error('order error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/orders/:id/status - Mettre à jour le statut d'une commande
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, noteVendeur } = req.body;
    const userId = req.user._id;

    // Vérifier que le statut est valide
    if (!['en_attente', 'confirmée', 'livrée', 'annulée'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur est propriétaire de la boutique
    const boutique = await Boutique.findById(order.boutique);
    if (boutique.proprietaire.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Sauvegarder l'ancien statut
    const oldStatus = order.status;

    // Mettre à jour le statut
    order.status = status;
    if (noteVendeur) {
      order.noteVendeur = noteVendeur;
    }
    await order.save();

    // Mettre à jour les stats de la boutique selon les changements de statut
    const updateObj = {};

    // Logique pour les transitions de statut
    const wasConfirmed = oldStatus === 'confirmée';
    const isnowConfirmed = status === 'confirmée';
    const wasAnnulled = oldStatus === 'annulée';
    const isNowAnnulled = status === 'annulée';

    // Gestion du changement de confirmée
    if (wasConfirmed && !isnowConfirmed) {
      // Passage de confirmée à autre état (en attente, livrée ou annulée)
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc.totalConfirmed = -1;
      updateObj.$inc.totalRevenue = -order.prixTotal;
    } else if (!wasConfirmed && isnowConfirmed) {
      // Passage d'autre état à confirmée
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc.totalConfirmed = 1;
      updateObj.$inc.totalRevenue = order.prixTotal;
    }

    // Gestion du changement d'annulée
    if (wasAnnulled && !isNowAnnulled) {
      // Passage de annulée à autre état
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc.totalCancelled = -1;
    } else if (!wasAnnulled && isNowAnnulled) {
      // Passage d'autre état à annulée
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc.totalCancelled = 1;
    }

    // Appliquer les modifications
    if (Object.keys(updateObj).length > 0) {
      await Boutique.findByIdAndUpdate(order.boutique, updateObj);
    }

    // Notifier l'acheteur
    await Notification.create({
      destinataire: order.buyer,
      message: `Statut de votre commande: ${status}`,
      type: 'general'
    });

    await order.populate([
      { path: 'product' },
      { path: 'boutique' },
      { path: 'buyer', select: 'nom telephone' }
    ]);

    res.json({
      message: 'Statut de commande mis à jour',
      order
    });
  } catch (error) {
    console.error(error);
    console.error('order error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/orders/:id - Annuler une commande
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que c'est le propriétaire
    if (order.buyer.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const oldStatus = order.status;
    order.status = 'annulée';
    await order.save();

    // Mettre à jour les stats de la boutique
    const updateObj = { $inc: {} };

    // Si la commande était confirmée, on doit décrémenter totalConfirmed et totalRevenue
    if (oldStatus === 'confirmée') {
      updateObj.$inc.totalConfirmed = -1;
      updateObj.$inc.totalRevenue = -order.prixTotal;
    }

    // Si la commande n'était pas déjà annulée, on incrémente totalCancelled
    if (oldStatus !== 'annulée') {
      updateObj.$inc.totalCancelled = 1;
    }

    await Boutique.findByIdAndUpdate(order.boutique, updateObj);

    res.json({ message: 'Commande annulée' });
  } catch (error) {
    console.error(error);
    console.error('order error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/orders/:id/delete-permanently - Supprimer définitivement une commande
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que c'est l'acheteur ou le vendeur
    const isBuyer = order.buyer.toString() === userId.toString();
    const boutique = await Boutique.findById(order.boutique);
    const isVendor = boutique && boutique.proprietaire.toString() === userId.toString();

    if (!isBuyer && !isVendor) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Mettre à jour les stats de la boutique avant suppression
    const updateObj = { $inc: { totalOrders: -1 } };

    if (order.status === 'confirmée') {
      updateObj.$inc.totalConfirmed = -1;
      updateObj.$inc.totalRevenue = -order.prixTotal;
    } else if (order.status === 'annulée') {
      updateObj.$inc.totalCancelled = -1;
    }

    await Boutique.findByIdAndUpdate(order.boutique, updateObj);
    await Order.findByIdAndDelete(id);

    res.json({ message: 'Commande supprimée' });
  } catch (error) {
    console.error(error);
    console.error('order error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getBoutiqueOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
};
