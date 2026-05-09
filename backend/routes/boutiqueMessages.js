const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendMessageToBoutique,
  getUserBoutiqueMessages,
  getBoutiqueMessages,
  replyToMessage,
  markAsRead,
  deleteMessage
} = require('../controllers/boutiqueMessageController');

/**
 * Routes de messagerie boutique
 * Messagerie entre utilisateurs et propriétaires de boutiques
 * Séparée de la messagerie admin
 */

// Utilisateur envoie un message à une boutique
router.post('/send-to-boutique', auth, sendMessageToBoutique);

// Utilisateur récupère ses messages de boutiques
router.get('/user-boutique-messages', auth, getUserBoutiqueMessages);

// Propriétaire de boutique récupère ses messages reçus
router.get('/boutique-inbox', auth, getBoutiqueMessages);

// Répondre à un message
router.post('/:messageId/boutique-reply', auth, replyToMessage);

// Marquer comme lu
router.put('/:messageId/boutique-read', auth, markAsRead);

// Supprimer un message
router.delete('/:messageId/boutique-delete', auth, deleteMessage);

module.exports = router;
