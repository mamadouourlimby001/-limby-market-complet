import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const packs = [
  { credits: 2, prix: 400, bonus: 0, label: '2 crédits' },
  { credits: 5, prix: 1000, bonus: 1, label: '5 crédits + 1 bonus' },
  { credits: 10, prix: 2000, bonus: 2, label: '10 crédits + 2 bonus' },
];

const BuyCredits = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ nomCompte: '', telephoneDepot: '', montant: '', telephoneCompte: user?.telephone || '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/credits/request', { ...form, montant: Number(form.montant) });
      setSuccess(true);
    } catch (err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <span style={{ fontSize: 48 }}>✅</span>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 12, color: '#1B2A6B' }}>Demande envoyée !</h2>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>Votre demande sera traitée sous peu par un administrateur.</p>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1 className="page-title">Acheter des crédits</h1>
      <div style={{ marginBottom: 16 }}>
        {packs.map((pack, i) => (
          <div key={i} className="card" style={{ padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: form.montant === String(pack.prix) ? '2px solid #1B2A6B' : '2px solid transparent' }}
            onClick={() => setForm({...form, montant: String(pack.prix)})}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1B2A6B' }}>{pack.label}</span>
              {pack.bonus > 0 && <span className="badge badge-success" style={{ marginLeft: 6 }}>🎁</span>}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{pack.prix.toLocaleString('fr-GN')} GNF</span>
          </div>
        ))}
      </div>
      <div className="alert alert-info">
        📱 Effectuez un dépôt Orange Money sur le numéro <strong>+224629043181</strong> puis remplissez le formulaire ci-dessous.
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Nom du compte à créditer</label><input className="form-control" value={form.nomCompte} onChange={e => setForm({...form, nomCompte: e.target.value})} required /></div>
        <div className="form-group"><label>Numéro avec lequel le dépôt a été fait</label><input type="tel" className="form-control" value={form.telephoneDepot} onChange={e => setForm({...form, telephoneDepot: e.target.value})} required /></div>
        <div className="form-group"><label>Montant du dépôt (GNF)</label><input type="number" className="form-control" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} required /></div>
        <div className="form-group"><label>Numéro du compte Limby à créditer</label><input type="tel" className="form-control" value={form.telephoneCompte} onChange={e => setForm({...form, telephoneCompte: e.target.value})} required /></div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading ? 'Envoi...' : 'Soumettre la demande'}</button>
      </form>
    </div>
  );
};

export default BuyCredits;
