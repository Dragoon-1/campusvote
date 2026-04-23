import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleColors = { root: '#f75f5f', admin: '#f7c94f', voter: '#4f8ef7', nominal: '#3dd68c' };
const roleLabels = { root: 'Root Admin', admin: 'Admin', voter: 'Voter', nominal: 'Nominal' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      background: '#0e1016', borderBottom: '1px solid #22262f',
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="CampusVote" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16, letterSpacing: '-.01em', lineHeight: 1.1 }}>CampusVote</div>
          <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: '.03em' }}>GH Raisoni ISU · Pune</div>
        </div>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: roleColors[user.role] || '#4f8ef7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {roleLabels[user.role] || user.role}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign out</button>
        </div>
      )}
    </nav>
  );
}
