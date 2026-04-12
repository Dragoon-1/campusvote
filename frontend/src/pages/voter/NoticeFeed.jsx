import { useState, useEffect } from 'react';
import API from '../../utils/api';

const typeColors = { notice: 'var(--accent)', update: 'var(--green)', result: 'var(--gold)' };
const typeLabels = { notice: 'Notice', update: 'Update', result: 'Result' };

export default function NoticeFeed() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/public/notices').then(r => { setNotices(r.data); setLoading(false); });
  }, []);

  if (loading) return null;
  if (notices.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <h2 className="section-title">Notices &amp; Updates</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notices.map(n => (
          <div key={n._id} className="card notice-card" style={{ borderLeftColor: typeColors[n.type] }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600 }}>{n.title}</h4>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: typeColors[n.type] + '22', color: typeColors[n.type], fontWeight: 600, whiteSpace: 'nowrap' }}>
                {typeLabels[n.type]}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{n.content}</p>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              {n.postedByName} · {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
