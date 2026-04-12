import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import VotingSection from './VotingSection';
import ClubsList from './ClubsList';
import NoticeFeed from './NoticeFeed';
import MyNominalCard from './MyNominalCard';
import ResultsPage from './ResultsPage';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [view, setView] = useState('home'); // home | GS | VGS | clubs | club-detail
  const [selectedClub, setSelectedClub] = useState(null);
  const [election, setElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState({ GS: false, VGS: false, clubs: {} });

  useEffect(() => {
    const fetch = async () => {
      const [elec, status] = await Promise.all([
        API.get('/public/election'),
        API.get('/voter/status')
      ]);
      setElection(elec.data);
      setVotingStatus(status.data.hasVoted || {});
    };
    fetch();
  }, []);

  const refreshStatus = () => API.get('/voter/status').then(r => setVotingStatus(r.data.hasVoted || {}));
  if (view === 'results') return (
  <><Navbar />
  <div className="page">
    <button className="btn btn-secondary btn-sm" onClick={() => setView('home')} style={{ marginBottom: 20 }}>← Back</button>
    <ResultsPage />
  </div></>
);

  if (view === 'GS' || view === 'VGS') return (
    <><Navbar />
    <div className="page">
      <button className="btn btn-secondary btn-sm" onClick={() => setView('home')} style={{ marginBottom: 20 }}>← Back</button>
      <VotingSection postType={view} clubId={null} election={election} alreadyVoted={votingStatus[view]} onVoted={refreshStatus} />
    </div></>
  );

  if (view === 'clubs') return (
    <><Navbar />
    <div className="page">
      <button className="btn btn-secondary btn-sm" onClick={() => setView('home')} style={{ marginBottom: 20 }}>← Back</button>
      <ClubsList onSelectClub={(club) => { setSelectedClub(club); setView('club-detail'); }} />
    </div></>
  );

  if (view === 'club-detail' && selectedClub) return (
    <><Navbar />
    <div className="page">
      <button className="btn btn-secondary btn-sm" onClick={() => setView('clubs')} style={{ marginBottom: 20 }}>← Back to clubs</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        {selectedClub.logo && <img src={selectedClub.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />}
        <div>
          <h2 style={{ fontSize: 22 }}>{selectedClub.name}</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{selectedClub.description}</p>
        </div>
      </div>
      {['president', 'vicePresident', 'secretary', 'treasurer'].map(post => (
        <div key={post} style={{ marginBottom: 32 }}>
          <VotingSection
            postType={post}
            clubId={selectedClub._id}
            election={election}
            alreadyVoted={votingStatus?.clubs?.[selectedClub._id]?.[post]}
            onVoted={refreshStatus}
          />
        </div>
      ))}
    </div></>
  );

  // Home view
  return (
    <><Navbar />
    <div className="page">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>Welcome, {user.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 6 }}>GH Raisoni International Skilltech University, Pune · CampusVote</p>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          {election?.isOpen ? '🟢 Voting is currently open' : '🔴 Voting is currently closed'}
          {election?.resultsPublished && ' · 🏆 Results have been published'}
        </p>
      </div>

      {/* Nominal card (if user is a nominal) */}
      {user.role === 'nominal' && <MyNominalCard />}

      {/* Main voting buttons */}
      <h2 className="section-title" style={{ marginBottom: 16 }}>Cast Your Vote</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        <VoteButton label="General Secretary" sub="GS" icon="🏛" color="#4f8ef7" voted={votingStatus?.GS} onClick={() => setView('GS')} />
        <VoteButton label="Vice General Secretary" sub="VGS" icon="🎖" color="#7c5ef7" voted={votingStatus?.VGS} onClick={() => setView('VGS')} />
        <VoteButton label="Club Elections" sub="All clubs" icon="🏆" color="#f7c94f" onClick={() => setView('clubs')} />
      </div>
      {election?.resultsPublished && (
        <VoteButton
          label="Election Results"
          sub="View winners"
          icon="🏆"
          color="#f7c94f"
          onClick={() => setView('results')}
                />
)}
      {/* Notices */}
      <NoticeFeed />
    </div></>
  );
}

function VoteButton({ label, sub, icon, color, voted, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--card)', border: `1px solid ${voted ? color + '44' : 'var(--border)'}`,
      borderRadius: 12, padding: '22px 18px', cursor: 'pointer', textAlign: 'left',
      transition: 'all .2s', display: 'flex', flexDirection: 'column', gap: 10
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = voted ? color + '44' : 'var(--border)'; e.currentTarget.style.transform = ''; }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{sub}</div>
      </div>
      {voted && <span style={{ fontSize: 11, color: '#3dd68c', fontWeight: 600 }}>✓ Voted</span>}
    </button>
  );
}
