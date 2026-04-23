import { useState } from 'react';
import Navbar from '../../components/Navbar';
import AdminNominals from './AdminNominals';
import AdminClubs from './AdminClubs';
import AdminVoters from './AdminVoters';
import AdminNotices from './AdminNotices';
import AdminStats from './AdminStats';
import ResultsPage from '../voter/ResultsPage';

const TABS = [
  { id: 'stats', label: '📊 Overview' },
  { id: 'nominals', label: '🏅 Nominals' },
  { id: 'clubs', label: '🏆 Clubs' },
  { id: 'voters', label: '👥 Voters' },
  { id: 'notices', label: '📢 Noticeboard' },
  { id: 'results', label: '🏆 Results' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>CampusVote — Admin Panel</h1>
        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'stats' && <AdminStats />}
        {tab === 'nominals' && <AdminNominals />}
        {tab === 'clubs' && <AdminClubs />}
        {tab === 'voters' && <AdminVoters />}
        {tab === 'notices' && <AdminNotices />}
        {tab === 'results' && <ResultsPage />}
      </div>
    </>
  );
}
