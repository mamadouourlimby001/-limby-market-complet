const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, getBuyerOrders, getSellerOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');

// POST /api/orders - Créer une commande (acheteur)
router.post('/', auth, createOrder);

// GET /api/orders/my-orders - Récupérer mes commandes (acheteur)
router.get('/my-orders', auth, getBuyerOrders);

// GET /api/orders/my-boutique-orders - Récupérer les commandes de ma boutique (vendeur)
router.get('/my-boutique-orders', auth, getSellerOrders);

// PATCH /api/orders/:id/status - Mettre à jour le statut (vendeur)
router.patch('/:id/status', auth, updateOrderStatus);

// DELETE /api/orders/:id - Annuler la commande (acheteur)
router.delete('/:id', auth, cancelOrder);

module.exports = router;
