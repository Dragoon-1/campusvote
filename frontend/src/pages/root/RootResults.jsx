import { useState, useEffect } from 'react';
import API from '../../utils/api';

const POST_LABELS = { GS:'General Secretary', VGS:'Vice General Secretary', president:'President', vicePresident:'Vice President', secretary:'Secretary', treasurer:'Treasurer' };

export default function RootResults() {
  const [nominals, setNominals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/root/results').then(r => { setNominals(r.data); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner" />;

  // Group by postType + clubId
  const groups = {};
  nominals.forEach(n => {
    const key = n.clubId ? `club-${n.clubId._id}-${n.postType}` : n.postType;
    const label = n.clubId ? `${n.clubId.name} — ${POST_LABELS[n.postType]}` : POST_LABELS[n.postType];
    if (!groups[key]) groups[key] = { label, nominals: [] };
    groups[key].nominals.push(n);
  });

  Object.values(groups).forEach(g => g.nominals.sort((a,b) => b.voteCount - a.voteCount));

  return (
    <div>
      <h2 className="section-title">Live Vote Counts</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.values(groups).map(group => {
          const maxVotes = Math.max(...group.nominals.map(n => n.voteCount), 1);
          return (
            <div key={group.label} className="card">
              <h4 style={{ fontSize: 15, marginBottom: 14, color: 'var(--text2)' }}>{group.label}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.nominals.map((n, i) => (
                  <div key={n._id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      {i === 0 && group.nominals[0].voteCount > 0 && <span style={{ fontSize: 14 }}>🥇</span>}
                      {n.photo
                        ? <img src={n.photo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg3)', display: 'grid', placeItems: 'center', fontSize: 12 }}>👤</div>}
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{n.name}</span>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: i === 0 ? 'var(--gold)' : 'var(--text2)', fontSize: 15 }}>
                        {n.voteCount}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: i === 0 ? 'linear-gradient(90deg, #f7c94f, #f7a94f)' : 'var(--accent)',
                        width: `${(n.voteCount / maxVotes) * 100}%`,
                        transition: 'width .6s ease', opacity: i === 0 ? 1 : .5
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
