import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function ClubsList({ onSelectClub }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/public/clubs').then(r => { setClubs(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h2 className="section-title">Club Elections</h2>
      {clubs.length === 0
        ? <div className="empty"><div className="empty-icon">🏆</div><p>No clubs registered yet</p></div>
        : <div className="grid-2">
            {clubs.map(club => (
              <button key={club._id} onClick={() => onSelectClub(club)} style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '18px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                display: 'flex', alignItems: 'center', gap: 14
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f8ef7'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
                {club.logo
                  ? <img src={club.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                  : <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg3)', display: 'grid', placeItems: 'center', fontSize: 22 }}>🏆</div>}
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16 }}>{club.name}</div>
                  {club.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{club.description}</div>}
                  <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>4 posts · Click to vote →</div>
                </div>
              </button>
            ))}
          </div>
      }
    </div>
  );
}
