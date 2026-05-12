import { useState, useEffect } from 'react';
import { Search, Lock, RotateCcw } from 'lucide-react';
import api from '../utils/api';

const AdminPasswords = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users-security');
      setUsers(res.data);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.telephone.includes(search)
  );

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de réinitialiser le mot de passe de ${selectedUser.nom}?`)) {
      return;
    }

    setResetting(true);
    try {
      await api.post(`/admin/users/${selectedUser._id}/reset-password`, {
        newPassword
      });
      alert('Mot de passe réinitialisé avec succès');
      setNewPassword('');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Gestion des Mots de Passe</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {!selectedUser ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: 6, paddingLeft: 10 }}>
              <Search size={16} style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Chercher utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '10px 8px',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
            Utilisateurs ({filteredUsers.length})
          </h2>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af' }}>
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map(u => (
              <div key={u._id} className="card" style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{u.nom}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>☎️ {u.telephone}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Rôle: <span className="badge badge-primary">{u.role}</span></p>
                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Question: <span style={{ fontStyle: 'italic' }}>{u.securityQuestion}</span></p>
                    <p style={{ fontSize: 10, color: '#9ca3af' }}>Créé le {new Date(u.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(u)}
                    style={{
                      padding: '8px 12px',
                      background: '#1B2A6B',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <Lock size={14} />
                    Réinitialiser
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selectedUser.nom}</h2>
            <p style={{ fontSize: 12, color: '#6b7280' }}>☎️ {selectedUser.telephone}</p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>Réinitialiser le mot de passe</p>
          </div>

          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
            <button
              onClick={() => {
                setSelectedUser(null);
                setNewPassword('');
              }}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPasswords;
