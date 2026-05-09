import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search, SortAsc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BoutiqueCard from '../components/BoutiqueCard';

const BoutiquesList = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [userBoutique, setUserBoutique] = useState(null);
  const [filteredBoutiques, setFilteredBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterVille, setFilterVille] = useState('');
  const { user } = useAuth();

  // Get unique categories and cities
  const categories = [...new Set(boutiques.map(b => b.categorie))].filter(Boolean);
  const villes = [...new Set(boutiques.map(b => b.ville))].filter(Boolean);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/boutiques');
        setBoutiques(res.data);
        
        // Fetch user's boutique if logged in
        if (user) {
          try {
            const userRes = await api.get('/boutiques/my-boutique');
            if (userRes.data) {
              setUserBoutique(userRes.data.boutique || userRes.data);
            }
          } catch (err) {
            // User doesn't have a boutique
          }
        }
      }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  useEffect(() => {
    let filtered = boutiques.filter(b => {
      const matchSearch = b.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategorie = !filterCategorie || b.categorie === filterCategorie;
      const matchVille = !filterVille || b.ville === filterVille;
      const notUserBoutique = !userBoutique || b._id !== userBoutique._id;
      return matchSearch && matchCategorie && matchVille && notUserBoutique;
    });
    setFilteredBoutiques(filtered);
  }, [searchTerm, filterCategorie, filterVille, boutiques, userBoutique]);

  return (
    <div className="page">
      <h1 className="page-title">Boutiques</h1>
      
      {user && user.role !== 'vendeur_boutique' && (
        <Link to="/boutiques/creer" className="btn btn-primary btn-block" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Store size={16} /> Créer ma boutique</Link>
      )}

      {/* Search and filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Chercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 36px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          style={{
            padding: '10px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            background: '#fff',
            minWidth: '140px'
          }}
        >
          <option value="">Catégorie</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={filterVille}
          onChange={(e) => setFilterVille(e.target.value)}
          style={{
            padding: '10px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            background: '#fff',
            minWidth: '120px'
          }}
        >
          <option value="">Ville</option>
          {villes.map(ville => <option key={ville} value={ville}>{ville}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : (
        <>
          {/* User's boutique */}
          {userBoutique && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1B2A6B' }}>Votre boutique</h2>
              <div style={{ marginBottom: 8 }}>
                <BoutiqueCard boutique={userBoutique} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Statut: <span className={`badge ${userBoutique.isActive ? 'badge-success' : 'badge-danger'}`}>{userBoutique.isActive ? 'Active' : 'Inactive'}</span></span>
                <Link to="/credits/renouveler-abonnement" className="btn btn-primary btn-sm">Renouveler</Link>
              </div>
            </>
          )}

          {/* Other boutiques */}
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1B2A6B' }}>
            {userBoutique ? 'Les autres boutiques' : 'Boutiques'}
          </h2>
          {filteredBoutiques.length === 0 ? (
            <div className="empty-state"><p>Aucune boutique trouvée</p></div>
          ) : (
            <div className="grid-2">{filteredBoutiques.map(b => <BoutiqueCard key={b._id} boutique={b} />)}</div>
          )}
        </>
      )}
    </div>
  );
};

export default BoutiquesList;
