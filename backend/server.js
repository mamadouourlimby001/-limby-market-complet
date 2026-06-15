const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const adminSeed = require('./seed/adminSeed');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/boutiques', require('./routes/boutiques'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/boutique-messages', require('./routes/boutiqueMessages'));
app.use('/api/orders', require('./routes/orders'));

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Limby Market 🇬🇳' });
});

// ===== SERVIR LE FRONTEND STATIQUEMENT =====
const frontendBuildPath = path.join(__dirname, '../frontend/dist');

console.log('Frontend build path:', frontendBuildPath);
console.log('Frontend exists:', fs.existsSync(frontendBuildPath));

// Servir les fichiers statiques du frontend
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  
  // Réécriture SPA : toutes les routes non-API vers index.html
  app.get('*', (req, res) => {
    console.log(`Requête non-routée: ${req.path}`);
    // Ne pas rediriger les routes API
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(frontendBuildPath, 'index.html');
      console.log(`Envoi de ${indexPath}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Erreur sendFile:', err);
          res.status(404).json({ message: 'Fichier non trouvé' });
        }
      });
    } else {
      res.status(404).json({ message: 'Route API non trouvée' });
    }
  });
} else {
  console.warn('⚠️ Frontend build not found at', frontendBuildPath);
}

// Seed des admins au démarrage
adminSeed();

// ===== TÂCHES CRON =====

const User = require('./models/User');
const Boutique = require('./models/Boutique');
const Notification = require('./models/Notification');
const ActionHistory = require('./models/ActionHistory');

// Tâche 1: Expiration des crédits - tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('⏰ Cron: Vérification expiration des crédits...');
    const expiredUsers = await User.find({
      creditExpiry: { $lt: new Date() },
      credits: { $gt: 0 }
    });
    for (const user of expiredUsers) {
      const oldCredits = user.credits;
      user.credits = 0;
      await user.save();
      await Notification.create({
        destinataire: user._id,
        message: `Vos ${oldCredits} crédits ont expiré. Rechargez votre compte.`,
        type: 'general'
      });
      await ActionHistory.create({
        utilisateur: user._id,
        action: 'credits_expires',
        details: { creditsExpires: oldCredits }
      });
      console.log(`  Credits expirés pour ${user.nom}: ${oldCredits} crédits`);
    }
  } catch (error) {
    console.error('❌ Cron erreur expiration crédits:', error.message);
  }
});

// Tâche 2: Expiration des boutiques - tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('⏰ Cron: Vérification expiration des boutiques...');
    const expiredBoutiques = await Boutique.find({
      isActive: true,
      dateExpiration: { $lt: new Date() }
    });
    for (const boutique of expiredBoutiques) {
      boutique.isActive = false;
      await boutique.save();
      await Notification.create({
        destinataire: boutique.proprietaire,
        message: `Votre boutique "${boutique.nom}" a été désactivée. Veuillez renouveler votre abonnement (10000 GNF).`,
        type: 'abonnement_renouveler'
      });
      await ActionHistory.create({
        utilisateur: boutique.proprietaire,
        action: 'boutique_expiree',
        details: { boutiqueId: boutique._id, nom: boutique.nom }
      });
      console.log(`  Boutique expirée: ${boutique.nom}`);
    }
  } catch (error) {
    console.error('❌ Cron erreur expiration boutiques:', error.message);
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur Limby Market démarré sur le port ${PORT}`);
});
