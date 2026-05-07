import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminUsers = () => {
  const { isSupremeAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditInput, setCreditInput] = useState({});
  const [removeMode, setRemoveMode] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetch = async () => {
    try { const res = await api.get('/admin/users'); setUsers(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur et toutes ses publications ?')) return;
    try { await api.delete(`/admin/users/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const addCredits = async (id) => {
    const credits = creditInput[id];
    if (!credits || credits <= 0) return;
    try { await api.post(`/admin/users/${id}/add-credits`, { credits: Number(credits) }); setCreditInput({...creditInput, [id]: ''}); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const removeCredits = async (id) => {
    const credits = creditInput[id];
    if (!credits || credits <= 0) return;
    try { await api.post(`/admin/users/${id}/remove-credits`, { credits: Number(credits) }); setCreditInput({...creditInput, [id]: ''}); setRemoveMode({...removeMode, [id]: false}); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const toggleVerified = async (id, current) => {
    try { await api.post(`/admin/users/${id}/set-verified`, { isVerified: !current }); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const toggleAdmin = async (id, role) => {
    if (role === 'admin_simple') {
      try { await api.delete(`/admin/admins/${id}`); fetch(); }
      catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    } else {
      try { await api.post('/admin/admins/add', { userId: id }); fetch(); }
      catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    }
  };

  const roleLabels = { acheteur: 'Acheteur', vendeur: 'Vendeur', vendeur_boutique: 'V. Boutique', admin_simple: 'Admin', admin_supreme: 'Admin Suprême' };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.telephone.includes(searchTerm)
  );

  return (
    <div className="page">
      <h1 className="page-title">Utilisateurs ({filteredUsers.length})</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px 12px', fontSize: 13 }}
        />
      </div>
      {filteredUsers.map(u => (
        <div key={u._id} className="card" style={{ padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{u.nom} {u.isVerified && <span style={{ color: '#4A90D9' }}>✓</span>}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>📞 {u.telephone}</p>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <span className="badge badge-primary">{roleLabels[u.role]}</span>
                <span className="badge badge-success">💰 {u.credits}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <button onClick={() => toggleVerified(u._id, u.isVerified)} className="btn btn-secondary btn-sm">
              {u.isVerified ? '❌ Retirer badge' : '✓ Vérifier'}
            </button>
            <button onClick={() => deleteUser(u._id)} className="btn btn-danger btn-sm">🗑️</button>
            {isSupremeAdmin && u.role !== 'admin_supreme' && (
              <button onClick={() => toggleAdmin(u._id, u.role)} className={`btn btn-sm ${u.role === 'admin_simple' ? 'btn-danger' : 'btn-primary'}`}>
                {u.role === 'admin_simple' ? 'Retirer admin' : 'Nommer admin'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <input type="number" placeholder="Crédits" className="form-control" style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}
              value={creditInput[u._id] || ''} onChange={e => setCreditInput({...creditInput, [u._id]: e.target.value})} />
            <button onClick={() => addCredits(u._id)} className="btn btn-success btn-sm">+ Crédits</button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" placeholder="Crédits à retirer" className="form-control" style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}
              value={removeMode[u._id] ? (creditInput[u._id] || '') : ''} onChange={e => setCreditInput({...creditInput, [u._id]: e.target.value})} disabled={!removeMode[u._id]} />
            {!removeMode[u._id] ? (
              <button onClick={() => setRemoveMode({...removeMode, [u._id]: true})} className="btn btn-danger btn-sm">- Crédits</button>
            ) : (
              <>
                <button onClick={() => removeCredits(u._id)} className="btn btn-danger btn-sm">Confirmer</button>
                <button onClick={() => { setRemoveMode({...removeMode, [u._id]: false}); setCreditInput({...creditInput, [u._id]: ''}); }} className="btn btn-secondary btn-sm">Annuler</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;
