import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { fileToBase64 } from '../utils/cloudinaryUpload';

const categories = ['Électronique', 'Vêtements', 'Meubles', 'Véhicules', 'Téléphones', 'Informatique', 'Électroménager', 'Sport', 'Autres'];
const villes = ['Conakry', 'Kindia', 'Boké', 'Mamou', 'Labé', 'Faranah', 'Kankan', 'Nzérékoré'];
const etats = [{ v: 'neuf', l: 'Neuf' }, { v: 'occasion', l: 'Occasion' }, { v: 'bon_etat', l: 'Bon état' }, { v: 'use', l: 'Usagé' }];

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: '', categorie: '', sousCategorie: '', ville: '', quartier: '', prix: '', description: '', etat: '', contact: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoto = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) { setError('Maximum 3 photos'); return; }
    
    try {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        setPhotos(prev => [...prev, base64]);
      }
    } catch (err) {
      setError('Erreur lors du traitement de la photo');
    }
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Les images en base64 seront converties en URLs Cloudinary côté serveur
      await api.post('/products', { ...form, prix: Number(form.prix), photos });
      navigate('/occasion');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">Publier un produit</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="alert alert-info">⚠️ Les numéros de téléphone ne sont pas autorisés dans la description.</div>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Titre</label><input className="form-control" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} required /></div>
        <div className="form-group"><label>Catégorie</label>
          <select className="form-control" value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})} required>
            <option value="">Sélectionner</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select></div>
        <div className="form-group"><label>Sous-catégorie (optionnel)</label><input className="form-control" value={form.sousCategorie} onChange={e => setForm({...form, sousCategorie: e.target.value})} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="form-group" style={{ flex: 1 }}><label>Ville</label>
            <select className="form-control" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} required>
              <option value="">Sélectionner</option>{villes.map(v => <option key={v} value={v}>{v}</option>)}
            </select></div>
          <div className="form-group" style={{ flex: 1 }}><label>Quartier</label><input className="form-control" value={form.quartier} onChange={e => setForm({...form, quartier: e.target.value})} required /></div>
        </div>
        <div className="form-group"><label>Prix (GNF)</label><input type="number" className="form-control" value={form.prix} onChange={e => setForm({...form, prix: e.target.value})} required /></div>
        <div className="form-group"><label>État</label>
          <select className="form-control" value={form.etat} onChange={e => setForm({...form, etat: e.target.value})} required>
            <option value="">Sélectionner</option>{etats.map(e => <option key={e.v} value={e.v}>{e.l}</option>)}
          </select></div>
        <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
        <div className="form-group"><label>Contact (votre numéro, caché aux acheteurs)</label><input type="tel" className="form-control" placeholder="+224..." value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required /></div>
        <div className="form-group">
          <label>Photos (max 3)</label>
          <div className="photo-upload">
            {photos.map((p, i) => (
              <div key={i} className="photo-upload-item"><img src={p} alt="" /><button type="button" className="remove-photo" onClick={() => removePhoto(i)}>×</button></div>
            ))}
            {photos.length < 3 && (
              <label className="photo-upload-item" style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 20, color: '#9ca3af' }}>+</span>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Publication...' : 'Publier'}</button>
      </form>
    </div>
  );
};

export default AddProduct;
