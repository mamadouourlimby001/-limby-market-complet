import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';

const LocationPermissionModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleYes = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Localisation activée:', position.coords);
          localStorage.setItem('locationPermissionAsked', 'true');
          setIsVisible(false);
          onClose();
        },
        (error) => {
          console.log('Erreur localisation:', error);
          localStorage.setItem('locationPermissionAsked', 'true');
          setIsVisible(false);
          onClose();
        }
      );
    } else {
      localStorage.setItem('locationPermissionAsked', 'true');
      setIsVisible(false);
      onClose();
    }
  };

  const handleCancel = () => {
    localStorage.setItem('locationPermissionAsked', 'true');
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 24,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={24} color="#1B2A6B" />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1B2A6B' }}>
              Activer la localisation
            </h2>
          </div>
        </div>

        <p style={{ color: '#6b7280', marginBottom: 24, lineHeight: 1.5 }}>
          Pour une meilleure expérience, nous vous proposons d'activer la localisation. Cela nous permettra de vous afficher des informations adaptées à votre région.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#d1d5db')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#e5e7eb')}
          >
            Annuler
          </button>
          <button
            onClick={handleYes}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: '#1B2A6B',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1a2361')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#1B2A6B')}
          >
            Oui
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
