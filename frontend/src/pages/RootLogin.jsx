import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RootLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/root/login', form);
      login(data.token, { name: data.name, role: 'root' });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="CampusVote" style={{ height: 70, width: 'auto', objectFit: 'contain', marginBottom: 10 }} />
          <h1 style={{ fontSize: 22, letterSpacing: '-.02em' }}>Root Access</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>CampusVote — Restricted Panel</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>Authorised Personnel Only</p>
        </div>

        <div className="card" style={{ padding: 28, borderColor: '#3a1a1a' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input placeholder="root username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="root password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg,#f75f5f,#f7a94f)', color: '#1a0a00', fontWeight: 600 }} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Enter Root Panel'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text3)' }}>
          <Link to="/login" style={{ color: 'var(--text3)' }}>← Back to student login</Link>
        </p>
      </div>
    </div>
  );
}
