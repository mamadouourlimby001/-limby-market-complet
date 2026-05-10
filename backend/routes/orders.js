const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getBoutiqueOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
} = require('../controllers/orderController');

/**
 * Routes des commandes
 * POST /api/orders - créer une commande
 * GET /api/orders/my-orders - mes commandes (acheteur)
 * GET /api/orders/boutique-orders - commandes de la boutique (vendeur)
 * PUT /api/orders/:id/status - mettre à jour le statut
 * DELETE /api/orders/:id - annuler une commande
 */

router.post('/', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/boutique-orders', auth, getBoutiqueOrders);
router.put('/:id/status', auth, updateOrderStatus);
router.delete('/:id/delete-permanently', auth, deleteOrder);
router.delete('/:id', auth, cancelOrder);

module.exports = router;
