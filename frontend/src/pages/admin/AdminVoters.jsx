import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function AdminVoters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', collegeId: '', password: '', department: '', year: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const r = await API.get('/admin/voters');
    setVoters(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', collegeId: '', password: '', department: '', year: '' }); setModal(true); };
  const openEdit = (v) => { setEditing(v._id); setForm({ name: v.name, collegeId: v.collegeId, password: '', department: v.department || '', year: v.year || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await API.put(`/admin/voters/${editing}`, form); toast.success('Voter updated'); }
      else { await API.post('/admin/voters', form); toast.success('Voter added'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voter?')) return;
    await API.delete(`/admin/voters/${id}`); toast.success('Voter deleted'); load();
  };

  const filtered = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.collegeId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Voters ({voters.length})</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <button className="btn btn-primary" onClick={openAdd}>+ Add Voter</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>College ID</th><th>Dept</th><th>Year</th><th>Role</th><th>Voted GS</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v._id}>
                <td>{v.name}</td>
                <td style={{ color: 'var(--text2)', fontSize: 13 }}>{v.collegeId}</td>
                <td style={{ color: 'var(--text2)', fontSize: 13 }}>{v.department || '—'}</td>
                <td style={{ color: 'var(--text2)', fontSize: 13 }}>{v.year || '—'}</td>
                <td><span className={`badge ${v.role === 'nominal' ? 'badge-green' : 'badge-blue'}`}>{v.role}</span></td>
                <td>{v.hasVoted?.GS ? <span className="voted-badge">✓ Yes</span> : <span className="not-voted-badge">No</span>}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(v)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>{editing ? 'Edit Voter' : 'Add Voter'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              {!editing && <div className="form-group"><label>College ID</label><input value={form.collegeId} onChange={e => setForm({...form, collegeId: e.target.value})} required /></div>}
              {!editing && <div className="form-group"><label>Password (default)</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>}
              <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
              <div className="form-group"><label>Year</label>
                <select value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                  <option value="">Select</option>
                  {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
