const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  sendMessageToAdmins,
  getUserMessages,
  markAsRead,
  replyToMessage,
  deleteMessage,
  sendMessageToUser,
  sendBroadcastMessage,
  getAdminMessages,
  getAllUsers
} = require('../controllers/messageController');

/**
 * Routes de messagerie
 * Utilisateurs : envoyer aux admins, consulter les réponses
 * Admins : envoyer à un utilisateur ou à tous, consulter les messages
 */

// Routes pour les utilisateurs
router.post('/send-to-admins', auth, sendMessageToAdmins);
router.get('/my-messages', auth, getUserMessages);
router.put('/:messageId/read', auth, markAsRead);
router.post('/:parentId/reply', auth, replyToMessage);
router.delete('/:messageId', auth, deleteMessage);

// Routes pour les administrateurs
router.post('/admin/send-to-user', auth, isAdmin, sendMessageToUser);
router.post('/admin/broadcast', auth, isAdmin, sendBroadcastMessage);
router.get('/admin/messages', auth, isAdmin, getAdminMessages);
router.get('/admin/users', auth, isAdmin, getAllUsers);

module.exports = router;
