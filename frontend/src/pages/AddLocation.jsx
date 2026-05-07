import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { fileToBase64 } from '../utils/cloudinaryUpload';

const villes = ['Conakry', 'Kindia', 'Boké', 'Mamou', 'Labé', 'Faranah', 'Kankan', 'Nzérékoré'];

const AddLocation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre: '', categorie: '', ville: '', quartier: '', prix: '', contact: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      // Les images en base64 seront converties en URLs Cloudinary côté serveur
      await api.post('/locations', { ...form, prix: Number(form.prix), photos });
      navigate('/locations');
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">Publier une location</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Titre</label><input className="form-control" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} required /></div>
        <div className="form-group"><label>Catégorie</label>
          <select className="form-control" value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})} required>
            <option value="">Sélectionner</option><option value="Location">Location</option><option value="Colocation">Colocation</option><option value="Vente_immobilière">Vente immobilière</option>
          </select></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="form-group" style={{ flex: 1 }}><label>Ville</label>
            <select className="form-control" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} required>
              <option value="">Sélectionner</option>{villes.map(v => <option key={v} value={v}>{v}</option>)}
            </select></div>
          <div className="form-group" style={{ flex: 1 }}><label>Quartier</label><input className="form-control" value={form.quartier} onChange={e => setForm({...form, quartier: e.target.value})} required /></div>
        </div>
        <div className="form-group"><label>Prix (GNF)</label><input type="number" className="form-control" value={form.prix} onChange={e => setForm({...form, prix: e.target.value})} required /></div>
        <div className="form-group"><label>Contact (caché aux acheteurs)</label><input type="tel" className="form-control" placeholder="+224..." value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required /></div>
        <div className="form-group"><label>Photos (max 3)</label>
          <div className="photo-upload">
            {photos.map((p, i) => (<div key={i} className="photo-upload-item"><img src={p} alt="" /><button type="button" className="remove-photo" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}>×</button></div>))}
            {photos.length < 3 && (<label className="photo-upload-item" style={{ cursor: 'pointer' }}><span style={{ fontSize: 20, color: '#9ca3af' }}>+</span><input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} /></label>)}
          </div></div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Publication...' : 'Publier'}</button>
      </form>
    </div>
  );
};

export default AddLocation;
