import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Info } from 'lucide-react';
import api from '../utils/api';

const CreateBoutique = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '', categorie: '', telephone: '', ville: '', quartier: '' });
  const [logo, setLogo] = useState('');
  const [originalLogo, setOriginalLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  const [boutique, setBoutique] = useState(null);

  useEffect(() => {
    // Vérifier si on est en mode édition (détection par la présence d'une boutique existante)
    checkIfEditMode();
  }, []);

  const checkIfEditMode = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get('/boutiques/my-boutique');
      if (res.data && res.data.boutique) {
        // Mode édition : pré-remplir le formulaire avec les données existantes
        setBoutique(res.data.boutique);
        setForm({
          nom: res.data.boutique.nom,
          description: res.data.boutique.description,
          categorie: res.data.boutique.categorie,
          telephone: res.data.boutique.telephone,
          ville: res.data.boutique.ville,
          quartier: res.data.boutique.quartier
        });
        setOriginalLogo(res.data.boutique.logo);
        setIsEditMode(true);
      }
    } catch (err) {
      // Pas de boutique existante ou pas connecté - mode création
      setIsEditMode(false);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = () => setLogo(reader.result); 
      reader.readAsDataURL(file); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setLoading(true);
    try {
      if (isEditMode) {
        // Mode édition : mettre à jour la boutique existante
        const updateData = { ...form };
        // Si un nouveau logo a été sélectionné, l'inclure
        if (logo) {
          updateData.logo = logo;
        } else if (originalLogo) {
          // Garder l'ancien logo si pas de nouveau
          updateData.logo = originalLogo;
        }
        await api.put(`/boutiques/${boutique._id}`, updateData);
        alert('Boutique mise à jour avec succès');
        navigate('/ma-boutique');
      } else {
        // Mode création : créer une nouvelle boutique
        if (!logo) {
          setError('Le logo est requis pour créer une boutique');
          return;
        }
        await api.post('/boutiques', { ...form, logo });
        alert('Boutique créée avec succès');
        navigate('/mon-compte');
      }
    } catch (err) { 
      setError(err.response?.data?.message || 'Erreur'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (initialLoading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">{isEditMode ? 'Modifier ma boutique' : 'Créer ma boutique'}</h1>
      
      {!isEditMode && (
        <>
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} /> Votre boutique sera créée mais inactive. Pour l'activer, vous devez payer un abonnement de 10000 GNF et obtenir l'approbation d'un administrateur.
          </div>
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} /> Déposez <strong>10 000 GNF</strong> sur le numéro Orange Money <strong>+224625223418</strong> pour activer votre boutique.
          </div>
        </>
      )}
      
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
        <div className="form-group"><label>Ville</label><input className="form-control" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} placeholder="Ex: Conakry" required /></div>
        <div className="form-group"><label>Quartier</label><input className="form-control" value={form.quartier} onChange={e => setForm({...form, quartier: e.target.value})} placeholder="Ex: Kaloum" required /></div>
        <div className="form-group"><label>Téléphone</label><input type="tel" className="form-control" placeholder="+224..." value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} required /></div>
        <div className="form-group"><label>Logo</label>
          <div className="photo-upload">
            {logo ? (
              <div className="photo-upload-item"><img src={logo} alt="" /><button type="button" className="remove-photo" onClick={() => setLogo('')}>×</button></div>
            ) : isEditMode && originalLogo ? (
              <>
                <div className="photo-upload-item"><img src={originalLogo} alt="" /></div>
                <label className="photo-upload-item" style={{ cursor: 'pointer', fontSize: 12, textAlign: 'center' }}><span style={{ fontSize: 20, color: '#9ca3af', display: 'block' }}>+</span><span>Changer</span><input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} /></label>
              </>
            ) : (
              <label className="photo-upload-item" style={{ cursor: 'pointer' }}><span style={{ fontSize: 20, color: '#9ca3af' }}>+</span><input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} /></label>
            )}
          </div></div>
        <button type="submit" disabled={loading || (!isEditMode && !logo)} className="btn btn-primary btn-block">{loading ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour' : 'Créer la boutique')}</button>
      </form>
    </div>
  );
};

export default CreateBoutique;
