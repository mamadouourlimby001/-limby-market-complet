const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const adminSeed = require('./seed/adminSeed');

dotenv.config();
connectDB();

const app = express();

// ===== SÉCURITÉ : En-têtes HTTP =====
// CSP désactivé pour permettre le chargement des images Cloudinary et des ressources externes
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ===== SÉCURITÉ : CORS restreint aux origines autorisées =====
const ALLOWED_ORIGINS = [
  'https://limby.site',
  'https://www.limby.site',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile natif, Postman, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Origine non autorisée par CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ===== SÉCURITÉ : Rate limiting global =====
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes. Réessayez dans 15 minutes.' },
  skip: (req) => req.path === '/api/admin/track-page-visit', // Ne pas limiter le tracking
});
app.use('/api/', globalLimiter);

// ===== CORPS DES REQUÊTES =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== ROUTES API =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/boutiques', require('./routes/boutiques'));
app.use('/api/services', require('./routes/services'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/boutique-messages', require('./routes/boutiqueMessages'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => {
  res.json({ message: 'API Limby Market' });
});

// ===== FRONTEND STATIQUE =====
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) res.status(404).json({ message: 'Page introuvable.' });
      });
    } else {
      res.status(404).json({ message: 'Route API introuvable.' });
    }
  });
}

// ===== SEED =====
adminSeed();

// ===== CRON : Expiration des crédits =====
const User = require('./models/User');
const Boutique = require('./models/Boutique');
const Notification = require('./models/Notification');
const ActionHistory = require('./models/ActionHistory');

cron.schedule('0 0 * * *', async () => {
  try {
    const expiredUsers = await User.find({ creditExpiry: { $lt: new Date() }, credits: { $gt: 0 } });
    for (const user of expiredUsers) {
      const oldCredits = user.credits;
      user.credits = 0;
      await user.save();
      await Notification.create({ destinataire: user._id, message: `Vos ${oldCredits} crédits ont expiré. Rechargez votre compte.`, type: 'general' });
      await ActionHistory.create({ utilisateur: user._id, action: 'credits_expires', details: { creditsExpires: oldCredits } });
    }
  } catch (error) {
    console.error('Cron erreur expiration crédits:', error.message);
  }
});

// ===== CRON : Expiration des boutiques =====
cron.schedule('0 0 * * *', async () => {
  try {
    const expiredBoutiques = await Boutique.find({ isActive: true, dateExpiration: { $lt: new Date() } });
    for (const boutique of expiredBoutiques) {
      boutique.isActive = false;
      await boutique.save();
      await Notification.create({ destinataire: boutique.proprietaire, message: `Votre boutique "${boutique.nom}" a été désactivée. Veuillez renouveler votre abonnement (10000 GNF).`, type: 'abonnement_renouveler' });
      await ActionHistory.create({ utilisateur: boutique.proprietaire, action: 'boutique_expiree', details: { boutiqueId: boutique._id, nom: boutique.nom } });
    }
  } catch (error) {
    console.error('Cron erreur expiration boutiques:', error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
