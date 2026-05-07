const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Seed des comptes administrateurs
 * Crée automatiquement les comptes admins au premier lancement
 * Ne crée pas les comptes s'ils existent déjà (vérification par téléphone)
 */
const adminSeed = async () => {
  const admins = [
    {
      nom: 'Diallo Mamadou Oury',
      telephone: '+224629043181',
      motDePasse: 'Karakossi01',
      role: 'admin_supreme'
    },
    {
      nom: 'Diallo Alpha Oumar',
      telephone: '+224620768276',
      motDePasse: 'AlphaAma12',
      role: 'admin_simple'
    },
    {
      nom: 'Barry Fatoumata Binta',
      telephone: '+224625223418',
      motDePasse: 'BarryFatima01',
      role: 'admin_simple'
    },
    {
      nom: 'Mamadou Barry',
      telephone: '+224622233510',
      motDePasse: 'BarryMam067',
      role: 'admin_simple'
    },
    {
      nom: 'Sow Mamadou Djan',
      telephone: '+224624788478',
      motDePasse: 'SowDjan283@',
      role: 'admin_simple'
    },
    {
      nom: 'Thierno Mamadou Diko Diallo',
      telephone: '+224623291585',
      motDePasse: 'ThiernoDiko693@',
      role: 'admin_simple'
    }
  ];

  try {
    for (const admin of admins) {
      const existingUser = await User.findOne({ telephone: admin.telephone });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.motDePasse, salt);
        
        await User.create({
          nom: admin.nom,
          telephone: admin.telephone,
          motDePasse: hashedPassword,
          role: admin.role
        });
        
        console.log(`✅ Admin créé: ${admin.nom} (${admin.role})`);
      } else {
        console.log(`ℹ️  Admin existant: ${admin.nom}`);
      }
    }
    console.log('✅ Seed administrateurs terminé');
  } catch (error) {
    console.error('❌ Erreur lors du seed administrateurs:', error.message);
  }
};

module.exports = adminSeed;
