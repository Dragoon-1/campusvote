import { useState } from 'react';
import Navbar from '../../components/Navbar';
import RootAdmins from './RootAdmins';
import RootElection from './RootElection';
import RootResults from './RootResults';
import AdminStats from '../admin/AdminStats';
import AdminNominals from '../admin/AdminNominals';
import AdminClubs from '../admin/AdminClubs';
import AdminVoters from '../admin/AdminVoters';
import AdminNotices from '../admin/AdminNotices';

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'election', label: '⚙️ Election Control' },
  { id: 'admins', label: '👑 Admins' },
  { id: 'nominals', label: '🏅 Nominals' },
  { id: 'clubs', label: '🏆 Clubs' },
  { id: 'voters', label: '👥 Voters' },
  { id: 'notices', label: '📢 Notices' },
  { id: 'results', label: '🏆 Results' },
];

export default function RootDashboard() {
  const [tab, setTab] = useState('overview');

  return (
    <>
      <Navbar />
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f75f5f', boxShadow: '0 0 8px #f75f5f' }} />
          <h1 style={{ fontSize: 24 }}>CampusVote — Root Panel</h1>
          <span className="badge badge-red">Full Access</span>
        </div>
        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'overview' && <AdminStats />}
        {tab === 'election' && <RootElection />}
        {tab === 'admins' && <RootAdmins />}
        {tab === 'nominals' && <AdminNominals />}
        {tab === 'clubs' && <AdminClubs />}
        {tab === 'voters' && <AdminVoters />}
        {tab === 'notices' && <AdminNotices />}
        {tab === 'results' && <RootResults />}
      </div>
    </>
  );
}
