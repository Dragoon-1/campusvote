import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ collegeId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, { name: data.name, role: data.role, collegeId: data.collegeId, id: data.id });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo.png" alt="CampusVote" style={{ height: 90, width: 'auto', objectFit: 'contain', marginBottom: 10 }} />
          <h1 style={{ fontSize: 26, letterSpacing: '-.02em' }}>CampusVote</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>GH Raisoni International Skilltech University, Pune</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>Student Council Election Portal</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Sign in with College ID</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>College ID</label>
              <input
                placeholder="e.g. CS2021001"
                value={form.collegeId}
                onChange={e => setForm({ ...form, collegeId: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
          Admin/Authority? <Link to="/root/login" style={{ color: 'var(--text2)' }}>Root login →</Link>
        </p>
      </div>
    </div>
  );
}
