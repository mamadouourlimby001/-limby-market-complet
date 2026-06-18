export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://limby01-production.up.railway.app/api';

export const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dylqtseje';

export const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'limby_unsigned';

export const PRODUCT_CATEGORIES = [
  'Électronique',
  'Téléphones',
  'Vêtements',
  'Chaussures',
  'Mobilier',
  'Électroménager',
  'Voitures',
  'Motos',
  'Agriculture',
  'Sport',
  'Beauté',
  'Jeux',
  'Livres',
  'Autre',
];

export const PRODUCT_CONDITIONS = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'bon_etat', label: 'Bon état' },
  { value: 'occasion', label: 'Occasion' },
  { value: 'use', label: 'Usé' },
];

export const LOCATION_CATEGORIES = [
  { value: 'Location', label: 'Location' },
  { value: 'Colocation', label: 'Colocation' },
  { value: 'Vente_immobilière', label: 'Vente immobilière' },
];

export const VILLES_GUINEE = [
  'Conakry',
  'Kindia',
  'Labé',
  'Kankan',
  'Mamou',
  'Boké',
  'Nzérékoré',
  'Faranah',
  'Siguiri',
  'Coyah',
  'Dubréka',
  'Fria',
  'Télimélé',
  'Pita',
  'Dalaba',
  'Kouroussa',
  'Dinguiraye',
  'Kissidougou',
  'Guéckédou',
  'Macenta',
];

export const BOUTIQUE_CATEGORIES = [
  'Mode & Vêtements',
  'Électronique',
  'Alimentaire',
  'Beauté & Cosmétique',
  'Maison & Décoration',
  'Sport & Loisirs',
  'Santé & Pharmacie',
  'Services',
  'Agriculture',
  'Autre',
];

export const CREDIT_PACKAGES = [
  { montant: 1000, credits: 1, label: '1 crédit — 1 000 GNF' },
  { montant: 5000, credits: 5, label: '5 crédits — 5 000 GNF' },
  { montant: 10000, credits: 10, label: '10 crédits — 10 000 GNF' },
];

export const SECURITY_QUESTIONS = [
  'Quel est le prénom de votre mère ?',
  'Quel est le nom de votre école primaire ?',
  'Quel est le nom de votre animal de compagnie ?',
  'Dans quelle ville êtes-vous né(e) ?',
  'Quel est votre plat préféré ?',
  'Quel est le prénom de votre meilleur(e) ami(e) d\'enfance ?',
];
