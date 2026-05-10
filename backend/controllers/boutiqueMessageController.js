const BoutiqueMessage = require('../models/BoutiqueMessage');
const Boutique = require('../models/Boutique');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Contrôleur de la messagerie boutique
 * Gère les messages entre utilisateurs et propriétaires de boutiques
 */

// POST - Utilisateur envoie un message à une boutique
const sendMessageToBoutique = async (req, res) => {
  try {
    const { boutiqueId, contenu } = req.body;
    const userId = req.user._id;

    if (!contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    if (!boutiqueId) {
      return res.status(400).json({ message: 'ID de boutique requis' });
    }

    // Vérifier que la boutique existe
    const boutique = await Boutique.findById(boutiqueId);
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    // Créer le message
    const message = new BoutiqueMessage({
      boutique: boutiqueId,
      sender: userId,
      senderType: 'acheteur',
      recipient: boutique.proprietaire,
      contenu,
      messageType: 'initial'
    });

    await message.save();
    await message.populate([
      { path: 'sender', select: 'nom telephone' },
      { path: 'boutique', select: 'nom' }
    ]);

    // Notifier le propriétaire de la boutique
    const senderUser = await User.findById(userId).select('nom');
    await Notification.create({
      destinataire: boutique.proprietaire,
      message: `Nouveau message de ${senderUser?.nom} sur "${boutique.nom}"`,
      type: 'message'
    });

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// GET - Récupérer les messages qu'un utilisateur a reçus de boutiques
const getUserBoutiqueMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer les messages initiaux et leurs répliques
    const messages = await BoutiqueMessage.find({
      $or: [
        { recipient: userId },
        { sender: userId }
      ],
      deletedBy: { $ne: userId },
      messageType: 'initial'
    })
      .populate('sender', 'nom telephone')
      .populate('boutique', 'nom logo')
      .sort({ createdAt: -1 });

    // Pour chaque message, récupérer les répliques
    const messagesWithReplies = await Promise.all(
      messages.map(async (msg) => {
        const replies = await BoutiqueMessage.find({
          parentMessage: msg._id,
          deletedBy: { $ne: userId }
        })
          .populate('sender', 'nom telephone')
          .sort({ createdAt: 1 });

        return {
          ...msg.toObject(),
          replies
        };
      })
    );

    // Compter les non-lus
    const unreadCount = messages.filter(m => !m.readBy).length;

    res.json({
      data: messagesWithReplies,
      unreadCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// GET - Propriétaire de boutique récupère ses messages reçus
const getBoutiqueMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer la boutique de l'utilisateur
    const boutique = await Boutique.findOne({ proprietaire: userId });
    if (!boutique) {
      return res.status(404).json({ message: 'Aucune boutique trouvée' });
    }

    // Récupérer les messages initiaux
    const messages = await BoutiqueMessage.find({
      boutique: boutique._id,
      deletedBy: { $ne: userId },
      messageType: 'initial'
    })
      .populate('sender', 'nom telephone')
      .sort({ createdAt: -1 });

    // Pour chaque message, récupérer les répliques
    const messagesWithReplies = await Promise.all(
      messages.map(async (msg) => {
        const replies = await BoutiqueMessage.find({
          parentMessage: msg._id,
          deletedBy: { $ne: userId }
        })
          .populate('sender', 'nom telephone')
          .sort({ createdAt: 1 });

        return {
          ...msg.toObject(),
          replies
        };
      })
    );

    // Compter les non-lus
    const unreadCount = messages.filter(m => !m.readBy).length;

    res.json({
      data: messagesWithReplies,
      unreadCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// POST - Répondre à un message
const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { contenu } = req.body;
    const userId = req.user._id;

    if (!contenu || contenu.trim().length === 0) {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Récupérer le message parent
    const parentMessage = await BoutiqueMessage.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Déterminer le type d'expéditeur et le destinataire
    let senderType, recipient;
    if (parentMessage.senderType === 'acheteur') {
      // Si le parent vient d'un acheteur, le propriétaire répond
      senderType = 'boutique';
      recipient = parentMessage.sender;
    } else {
      // Si le parent vient du propriétaire, l'acheteur répond
      senderType = 'acheteur';
      recipient = parentMessage.recipient;
    }

    // Créer la réponse
    const reply = new BoutiqueMessage({
      boutique: parentMessage.boutique,
      sender: userId,
      senderType,
      recipient,
      contenu,
      parentMessage: messageId,
      messageType: 'reply'
    });

    await reply.save();

    // Ajouter à replies du message parent
    parentMessage.replies.push(reply._id);
    await parentMessage.save();

    await reply.populate([
      { path: 'sender', select: 'nom telephone' }
    ]);

    // Notifier le destinataire
    const senderName = await User.findById(userId).select('nom');
    await Notification.create({
      destinataire: recipient,
      message: `${senderName?.nom} a répondu à votre message`,
      type: 'message'
    });

    res.status(201).json({
      message: 'Réponse envoyée avec succès',
      data: reply
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la réponse' });
  }
};

// PUT - Marquer un message comme lu
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await BoutiqueMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que c'est le destinataire
    if (message.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Marquer comme lu
    message.readBy = true;
    message.readAt = Date.now();
    await message.save();

    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du marquage du message' });
  }
};

// DELETE - Supprimer (soft delete) un message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await BoutiqueMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que c'est l'expéditeur ou le destinataire
    if (message.sender.toString() !== userId.toString() && message.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Soft delete
    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
      await message.save();
    }

    res.json({ message: 'Message supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression du message' });
  }
};

module.exports = {
  sendMessageToBoutique,
  getUserBoutiqueMessages,
  getBoutiqueMessages,
  replyToMessage,
  markAsRead,
  deleteMessage
};
