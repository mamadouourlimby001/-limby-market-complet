const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Contrôleur des messages
 * Gère l'envoi, la réception et la suppression des messages
 */

// Utilisateur envoie un message aux administrateurs
const sendMessageToAdmins = async (req, res) => {
  try {
    const { contenu } = req.body;
    const userId = req.user._id;

    if (!contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Trouver tous les administrateurs
    const admins = await User.find({
      role: { $in: ['admin_simple', 'admin_supreme'] }
    });

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Aucun administrateur trouvé' });
    }

    // Créer le message
    const message = new Message({
      sender: userId,
      senderType: 'user',
      recipients: admins.map(a => a._id),
      contenu,
      isGroupMessage: false,
      messageType: 'initial',
      readBy: admins.map(a => ({ user: a._id, readAt: null }))
    });

    await message.save();
    await message.populate('sender', 'nom telephone');

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// Récupérer les messages reçus par l'utilisateur
const getUserMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer les messages de groupe et les réponses personnelles
    const messages = await Message.find({
      recipients: userId,
      deletedBy: { $ne: userId }
    })
      .populate('sender', 'nom telephone role')
      .populate('parentMessage')
      .sort({ createdAt: -1 });

    // Compter les non-lus
    const unreadCount = messages.filter(m => {
      const readInfo = m.readBy?.find(r => r.user.toString() === userId.toString());
      return !readInfo || !readInfo.readAt;
    }).length;

    res.json({
      data: messages,
      unreadCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// Marquer un message comme lu
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Marquer comme lu
    const readIndex = message.readBy.findIndex(r => r.user.toString() === userId.toString());
    if (readIndex !== -1) {
      message.readBy[readIndex].readAt = Date.now();
      await message.save();
    }

    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

// Répondre à un message
const replyToMessage = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { contenu } = req.body;
    const userId = req.user._id;

    if (!contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Vérifier que le message parent existe
    const parentMessage = await Message.findById(parentId).populate('sender');
    if (!parentMessage) {
      return res.status(404).json({ message: 'Message parent non trouvé' });
    }

    // Déterminer le type d'expéditeur et les destinataires
    const user = await User.findById(userId);
    const isAdmin = user.role === 'admin_simple' || user.role === 'admin_supreme';
    
    let recipients;
    if (isAdmin) {
      // Si admin répond, envoyer au sender du message parent
      recipients = [parentMessage.sender._id];
    } else {
      // Si utilisateur répond, envoyer à tous les admins
      const admins = await User.find({
        role: { $in: ['admin_simple', 'admin_supreme'] }
      });
      recipients = admins.map(a => a._id);
    }

    // Créer la réponse
    const reply = new Message({
      sender: userId,
      senderType: isAdmin ? 'admin' : 'user',
      recipients,
      contenu,
      parentMessage: parentId,
      messageType: 'reply',
      readBy: recipients.map(r => ({ user: r, readAt: null }))
    });

    await reply.save();
    await reply.populate('sender', 'nom telephone');

    res.status(201).json({
      message: 'Réponse envoyée avec succès',
      data: reply
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la réponse' });
  }
};

// Supprimer un message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Hard delete - supprimer complètement de la base de données
    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};

// ADMIN : Envoyer un message à un utilisateur spécifique
const sendMessageToUser = async (req, res) => {
  try {
    const { userId, contenu } = req.body;
    const adminId = req.user._id;

    if (!userId || !contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: 'L\'ID utilisateur et le contenu sont requis' });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Créer le message
    const message = new Message({
      sender: adminId,
      senderType: 'admin',
      recipients: [userId],
      contenu,
      isGroupMessage: false,
      messageType: 'initial',
      readBy: [{ user: userId, readAt: null }]
    });

    await message.save();
    await message.populate('sender', 'nom telephone role');

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// ADMIN : Envoyer un message à tous les utilisateurs
const sendBroadcastMessage = async (req, res) => {
  try {
    const { contenu } = req.body;
    const adminId = req.user._id;

    if (!contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Récupérer tous les utilisateurs (sauf les admins)
    const users = await User.find({
      role: { $nin: ['admin_simple', 'admin_supreme'] }
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé' });
    }

    // Créer le message de groupe
    const message = new Message({
      sender: adminId,
      senderType: 'admin',
      recipients: users.map(u => u._id),
      contenu,
      isGroupMessage: true,
      messageType: 'initial',
      readBy: users.map(u => ({ user: u._id, readAt: null }))
    });

    await message.save();
    await message.populate('sender', 'nom telephone role');

    res.status(201).json({
      message: 'Message envoyé à tous les utilisateurs avec succès',
      data: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// ADMIN : Récupérer les messages reçus
const getAdminMessages = async (req, res) => {
  try {
    const adminId = req.user._id;

    // Récupérer tous les messages envoyés par les utilisateurs à cet admin
    const messages = await Message.find({
      recipients: adminId,
      deletedBy: { $ne: adminId }
    })
      .populate('sender', 'nom telephone')
      .populate('parentMessage')
      .sort({ createdAt: -1 });

    // Compter les non-lus
    const unreadCount = messages.filter(m => {
      const readInfo = m.readBy?.find(r => r.user.toString() === adminId.toString());
      return !readInfo || !readInfo.readAt;
    }).length;

    res.json({
      data: messages,
      unreadCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// Récupérer tous les utilisateurs (pour la sélection par admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $nin: ['admin_simple', 'admin_supreme'] }
    }).select('_id nom telephone createdAt');

    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

module.exports = {
  sendMessageToAdmins,
  getUserMessages,
  markAsRead,
  replyToMessage,
  deleteMessage,
  sendMessageToUser,
  sendBroadcastMessage,
  getAdminMessages,
  getAllUsers
};
