const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * SÉCURITÉ : Les mots de passe sont lus depuis les variables d'environnement.
 * Configurez ces variables sur Railway avant le premier déploiement :
 *   ADMIN1_PASSWORD, ADMIN2_PASSWORD, ADMIN3_PASSWORD,
 *   ADMIN4_PASSWORD, ADMIN5_PASSWORD, ADMIN6_PASSWORD
 * Si une variable est absente, le compte correspondant n'est pas créé.
 * Les comptes déjà existants en base de données ne sont pas modifiés.
 */
const adminSeed = async () => {
  const admins = [
    { nom: 'Diallo Mamadou Oury',        telephone: '+224629043181', role: 'admin_supreme', envKey: 'ADMIN1_PASSWORD' },
    { nom: 'Diallo Alpha Oumar',          telephone: '+224620768276', role: 'admin_simple',  envKey: 'ADMIN2_PASSWORD' },
    { nom: 'Barry Fatoumata Binta',       telephone: '+224625223418', role: 'admin_simple',  envKey: 'ADMIN3_PASSWORD' },
    { nom: 'Mamadou Barry',               telephone: '+224622233510', role: 'admin_simple',  envKey: 'ADMIN4_PASSWORD' },
    { nom: 'Sow Mamadou Djan',            telephone: '+224624788478', role: 'admin_simple',  envKey: 'ADMIN5_PASSWORD' },
    { nom: 'Thierno Mamadou Diko Diallo', telephone: '+224623291585', role: 'admin_simple',  envKey: 'ADMIN6_PASSWORD' },
  ];

  try {
    for (const admin of admins) {
      const password = process.env[admin.envKey];
      if (!password) {
        // Les comptes déjà créés en DB fonctionnent même sans cette variable
        continue;
      }

      const existingUser = await User.findOne({ telephone: admin.telephone });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ nom: admin.nom, telephone: admin.telephone, motDePasse: hashedPassword, role: admin.role });
        console.log(`✅ Admin créé: ${admin.nom} (${admin.role})`);
      }
    }
    console.log('✅ Seed administrateurs terminé');
  } catch (error) {
    console.error('❌ Erreur seed administrateurs:', error.message);
  }
};

module.exports = adminSeed;
