const mongoose = require('mongoose');

/**
 * Connexion à la base de données MongoDB
 * Utilise la variable d'environnement MONGO_URI
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    console.warn('⚠️  En mode développement, le serveur continue sans MongoDB...');
    // N'appeler process.exit(1) que en production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
