import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import PhotoSlider from './PhotoSlider';
import UnlockButton from './UnlockButton';
import ReportButton from './ReportButton';

const ProductCard = ({ product }) => {
  const etatLabels = { neuf: 'Neuf', occasion: 'Occasion', bon_etat: 'Bon état', use: 'Usagé' };
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <Link to={`/occasion/${product._id}`}>
        <PhotoSlider photos={product.photos} />
      </Link>
      <div style={{ padding: '8px' }}>
        <Link to={`/occasion/${product._id}`}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.titre}</h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {product.ville}</span>
          {product.etat && <span className="badge badge-primary" style={{ fontSize: 10 }}>{etatLabels[product.etat]}</span>}
        </div>
        <p className="price" style={{ fontSize: '14px', marginBottom: 6 }}>
          {product.prix?.toLocaleString('fr-GN')} GNF
        </p>
        <UnlockButton type="product" id={product._id} contact={product.contact} />
        <ReportButton typeContenu="product" contenuId={product._id} />
      </div>
    </div>
  );
};

export default ProductCard;
