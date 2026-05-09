import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateBoutique = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', description: '', categorie: '', telephone: '' });
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setLogo(reader.result); reader.readAsDataURL(file); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/boutiques', { ...form, logo });
      navigate('/mon-compte');
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">Créer ma boutique</h1>
      <div className="alert alert-info">📌 Votre boutique sera créée mais inactive. Pour l'activer, vous devez payer un abonnement de 10000 GNF et obtenir l'approbation d'un administrateur.</div>
      <div className="alert alert-info">
        📱 Déposez <strong>10 000 GNF</strong> sur le numéro Orange Money <strong>+224625223418</strong> pour activer votre boutique.
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Nom de la boutique</label><input className="form-control" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required /></div>
        <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
        <div className="form-group"><label>Catégorie</label>
          <select className="form-control" value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})} required>
            <option value="">Sélectionner</option>
            <option value="Électronique">Électronique</option><option value="Mode">Mode</option><option value="Alimentation">Alimentation</option>
            <option value="Beauté">Beauté</option><option value="Maison">Maison</option><option value="Services">Services</option><option value="Autres">Autres</option>
          </select></div>
        <div className="form-group"><label>Téléphone</label><input type="tel" className="form-control" placeholder="+224..." value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} required /></div>
        <div className="form-group"><label>Logo</label>
          <div className="photo-upload">
            {logo ? (<div className="photo-upload-item"><img src={logo} alt="" /><button type="button" className="remove-photo" onClick={() => setLogo('')}>×</button></div>) : (
              <label className="photo-upload-item" style={{ cursor: 'pointer' }}><span style={{ fontSize: 20, color: '#9ca3af' }}>+</span><input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} /></label>
            )}
          </div></div>
        <button type="submit" disabled={loading || !logo} className="btn btn-primary btn-block">{loading ? 'Création...' : 'Créer la boutique'}</button>
      </form>
    </div>
  );
};

export default CreateBoutique;
