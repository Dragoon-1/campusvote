import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const r = await API.get('/admin/stats');
      setStats(r.data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="spinner" />;

  const items = [
    { label: 'Registered Voters', num: stats.totalVoters, icon: '👥', color: '#4f8ef7' },
    { label: 'Voted for GS', num: stats.votedGS, icon: '🏛', color: '#7c5ef7' },
    { label: 'Voted for VGS', num: stats.votedVGS, icon: '🎖', color: '#3dd68c' },
    { label: 'Active Nominals', num: stats.totalNominals, icon: '🏅', color: '#f7c94f' },
    { label: 'Active Clubs', num: stats.totalClubs, icon: '🏆', color: '#f75f5f' },
    { label: 'GS Turnout', num: stats.turnoutPercent + '%', icon: '📊', color: '#4fc9f7' },
  ];

  return (
    <div>
      <h2 className="section-title">Election Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
        {items.map(item => (
          <div key={item.label} className="stat-card">
            <div style={{ fontSize: 26, marginBottom: 8 }}>{item.icon}</div>
            <div className="stat-num" style={{ color: item.color }}>{item.num}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
