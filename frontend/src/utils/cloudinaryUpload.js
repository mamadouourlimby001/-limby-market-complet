/**
 * Utilitaire Cloudinary pour le frontend
 * Gère l'upload d'images vers Cloudinary
 */

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'limby_upload');
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'limby');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'limby'}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors du upload');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erreur Cloudinary:', error);
    throw error;
  }
};

/**
 * Convertir un fichier en base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
