import { useState, useEffect } from 'react';
import API from '../../utils/api';

const POST_LABELS = {
  GS: 'General Secretary', VGS: 'Vice General Secretary',
  president: 'President', vicePresident: 'Vice President',
  secretary: 'Secretary', treasurer: 'Treasurer'
};

export default function MyNominalCard() {
  const [nominals, setNominals] = useState([]);

  useEffect(() => {
    API.get('/voter/my-nominal').then(r => setNominals(r.data));
  }, []);

  if (nominals.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 className="section-title">Your Candidacy</h2>
      <div className="grid-2">
        {nominals.map(n => (
          <div key={n._id} style={{
            background: 'linear-gradient(135deg, #142a1e 0%, #0f1a2e 100%)',
            border: '1px solid #1e4030', borderRadius: 12, padding: 18,
            display: 'flex', gap: 14, alignItems: 'flex-start'
          }}>
            {n.photo
              ? <img src={n.photo} alt={n.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3dd68c44' }} />
              : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg3)', display: 'grid', placeItems: 'center', fontSize: 24 }}>👤</div>}
            <div>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>🏅 You are running for</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700 }}>{POST_LABELS[n.postType]}</div>
              {n.clubId && <div style={{ fontSize: 13, color: 'var(--text2)' }}>{n.clubId.name}</div>}
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>{n.description}</div>
              <div style={{ marginTop: 8, fontSize: 12, padding: '4px 10px', background: '#1e4030', borderRadius: 6, color: 'var(--green)', display: 'inline-block' }}>
                ℹ️ You cannot vote for this post
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
