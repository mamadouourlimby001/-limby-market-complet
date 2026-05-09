import { useState, useEffect } from 'react';
import api from '../utils/api';

const RenewSubscription = () => {
  const [form, setForm] = useState({ nomBoutique: '', telephoneDepot: '', montant: '10000', boutiqueId: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [boutique, setBoutique] = useState(null);

  useEffect(() => {
    const fetchBoutique = async () => {
      try {
        const res = await api.get('/boutiques/my-boutique').catch(() => ({ data: null }));
        if (res.data) {
          setBoutique(res.data);
          setForm(prev => ({ ...prev, nomBoutique: res.data.nom, boutiqueId: res.data._id }));
        }
      } catch (err) { console.error(err); }
    };
    fetchBoutique();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/credits/subscription-request', { ...form, montant: Number(form.montant) });
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <span style={{ fontSize: 48 }}>✔️</span>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 12, color: '#1B2A6B' }}>Demande envoyée !</h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>Votre demande de renouvellement sera traitée sous peu.</p>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">Renouveler abonnement</h1>
      <div className="alert alert-info">
        � Déposez <strong>10 000 GNF</strong> sur le numéro Orange Money <strong>+224625223418</strong> puis soumettez ce formulaire.
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Nom de la boutique</label><input className="form-control" value={form.nomBoutique} onChange={e => setForm({...form, nomBoutique: e.target.value})} required /></div>
        <div className="form-group"><label>Numéro avec lequel le dépôt a été fait</label><input type="tel" className="form-control" value={form.telephoneDepot} onChange={e => setForm({...form, telephoneDepot: e.target.value})} required /></div>
        <div className="form-group"><label>Montant (GNF)</label><input type="number" className="form-control" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} required /></div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Envoi...' : 'Soumettre la demande'}</button>
      </form>
    </div>
  );
};

export default RenewSubscription;
