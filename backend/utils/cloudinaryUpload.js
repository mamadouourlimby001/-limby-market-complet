const cloudinary = require('../config/cloudinary');

/**
 * Fonction pour uploader une image en base64 vers Cloudinary
 * @param {string} base64Image - L'image en format base64
 * @param {string} folder - Le dossier dans Cloudinary (optionnel)
 * @returns {Promise<string>} - L'URL sécurisée de l'image
 */
const uploadImageToCloudinary = async (base64Image, folder = 'limby') => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      quality: 'auto',
      fetch_format: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    throw new Error('Erreur lors de l\'upload de l\'image vers le cloud');
  }
};

/**
 * Fonction pour uploader plusieurs images en base64
 * @param {array} base64Images - Tableau d'images en format base64
 * @param {string} folder - Le dossier dans Cloudinary (optionnel)
 * @returns {Promise<array>} - Tableau d'URLs sécurisées
 */
const uploadImagesToCloudinary = async (base64Images, folder = 'limby') => {
  try {
    if (!Array.isArray(base64Images)) {
      return [];
    }
    
    const uploadPromises = base64Images.map(image => 
      uploadImageToCloudinary(image, folder)
    );
    
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    throw error;
  }
};

/**
 * Fonction pour extraire le public_id d'une URL Cloudinary
 * @param {string} url - L'URL Cloudinary
 * @returns {string} - Le public_id
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Les URLs Cloudinary ont le format : https://res.cloudinary.com/cloud_name/image/upload/[version]/path/to/public_id.ext
  // On extrait la partie après /upload/ sans l'extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

/**
 * Fonction pour supprimer une image de Cloudinary
 * @param {string} imageUrl - L'URL de l'image à supprimer
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) {
      return false;
    }
    
    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.warn('Impossible d\'extraire le public_id de l\'URL:', imageUrl);
      return false;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image Cloudinary:', error);
    return false;
  }
};

/**
 * Fonction pour supprimer plusieurs images de Cloudinary
 * @param {array} imageUrls - Tableau d'URLs Cloudinary à supprimer
 * @returns {Promise<array>} - Tableau de boolean indiquant le succès de chaque suppression
 */
const deleteImagesFromCloudinary = async (imageUrls) => {
  try {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return [];
    }
    
    const deletePromises = imageUrls.map(url => deleteImageFromCloudinary(url));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Erreur lors de la suppression multiple d\'images:', error);
    throw error;
  }
};

module.exports = {
  uploadImageToCloudinary,
  uploadImagesToCloudinary,
  deleteImageFromCloudinary,
  deleteImagesFromCloudinary
};
