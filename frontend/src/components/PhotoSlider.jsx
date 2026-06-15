import { useState } from 'react';

const PhotoSlider = ({ photos = [], height = '180px', onPhotoClick = null }) => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrent(c => c < photos.length - 1 ? c + 1 : 0);
      } else {
        setCurrent(c => c > 0 ? c - 1 : photos.length - 1);
      }
    }
    setTouchStart(null);
  };

  if (!photos || photos.length === 0) {
    return (
      <div style={{ width: '100%', height, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' }}>
        Pas de photo
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', background: '#f0f0f0' }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <img src={photos[current]} alt="" onClick={() => onPhotoClick && onPhotoClick(current)} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f0f0f0', cursor: onPhotoClick ? 'pointer' : 'default' }} />
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(c => c > 0 ? c - 1 : photos.length - 1); }}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(c => c < photos.length - 1 ? c + 1 : 0); }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 50, height: 50, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
            {photos.map((_, i) => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === current ? '#fff' : 'rgba(255,255,255,0.5)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoSlider;
