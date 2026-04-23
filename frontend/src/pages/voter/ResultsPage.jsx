import { useState, useEffect } from 'react';
import API from '../../utils/api';

const POST_LABELS = {
  GS: 'General Secretary',
  VGS: 'Vice General Secretary',
  president: 'President',
  vicePresident: 'Vice President',
  secretary: 'Secretary',
  treasurer: 'Treasurer'
};

export default function ResultsPage() {
  const [nominals, setNominals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await API.get('/public/results');
        setNominals(r.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Results not available');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div className="empty">
      <div className="empty-icon">⏳</div>
      <p>{error}</p>
    </div>
  );

  // Group by post + club
  const groups = {};
  nominals.forEach(n => {
    const key = n.clubId ? `${n.clubId._id}-${n.postType}` : n.postType;
    const label = n.clubId
      ? `${n.clubId.name} — ${POST_LABELS[n.postType]}`
      : POST_LABELS[n.postType];
    if (!groups[key]) groups[key] = { label, nominals: [] };
    groups[key].nominals.push(n);
  });

  Object.values(groups).forEach(g =>
    g.nominals.sort((a, b) => b.voteCount - a.voteCount)
  );

  return (
    <div>
      <h2 className="section-title">🏆 Election Results</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
        Official results declared by GH Raisoni ISU Student Council
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.values(groups).map(group => {
          const winner = group.nominals[0];
          const totalVotes = group.nominals.reduce((a, b) => a + b.voteCount, 0);

          return (
            <div key={group.label} className="card">
              <h4 style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 14 }}>
                {group.label}
              </h4>

              {group.nominals.map((n, i) => (
                <div key={n._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < group.nominals.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  {/* Rank */}
                  <div style={{ width: 28, textAlign: 'center', fontSize: 18 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </div>

                  {/* Photo */}
                  {n.photo
                    ? <img src={n.photo} alt={n.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: i === 0 ? '2px solid #f7c94f' : '2px solid var(--border)' }} />
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg3)', display: 'grid', placeItems: 'center', fontSize: 18 }}>👤</div>
                  }

                  {/* Name + bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: i === 0 ? 700 : 400, fontSize: 14, color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>
                        {n.name} {i === 0 && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ WINNER</span>}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                        {n.voteCount} votes ({totalVotes > 0 ? Math.round((n.voteCount / totalVotes) * 100) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: 3,
                        width: `${totalVotes > 0 ? (n.voteCount / totalVotes) * 100 : 0}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg, #f7c94f, #f7a94f)'
                          : 'var(--accent)',
                        opacity: i === 0 ? 1 : 0.5,
                        transition: 'width .6s ease'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}