import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BoutiqueCard from '../components/BoutiqueCard';

const BoutiquesList = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [userBoutique, setUserBoutique] = useState(null);
  const [filteredBoutiques, setFilteredBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

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
    let filtered = boutiques.filter(b => 
      b.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!userBoutique || b._id !== userBoutique._id)
    );
    setFilteredBoutiques(filtered);
  }, [searchTerm, boutiques, userBoutique]);

  return (
    <div className="page">
      <h1 className="page-title">Boutiques</h1>
      
      {user && user.role !== 'vendeur_boutique' && (
        <Link to="/boutiques/creer" className="btn btn-primary btn-block" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Store size={16} /> Créer ma boutique</Link>
      )}

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
        <input
          type="text"
          placeholder="Chercher une boutique..."
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

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : (
        <>
          {/* User's boutique */}
          {userBoutique && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1B2A6B' }}>Votre boutique</h2>
              <div style={{ marginBottom: 24 }}>
                <BoutiqueCard boutique={userBoutique} />
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
