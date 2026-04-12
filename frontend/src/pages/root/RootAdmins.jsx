import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function RootAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', collegeId: '', email: '', password: '', department: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
  const r = await API.get('/root/admins');
  setAdmins(r.data);
  setLoading(false);
};
useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', collegeId: '', email: '', password: '', department: '' }); setModal(true); };
  const openEdit = (a) => { setEditing(a._id); setForm({ name: a.name, collegeId: a.collegeId || '', email: a.email || '', password: '', department: a.department || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await API.put(`/root/admins/${editing}`, form); toast.success('Admin updated'); }
      else { await API.post('/root/admins', form); toast.success('Admin created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin?')) return;
    await API.delete(`/root/admins/${id}`); toast.success('Admin deleted'); load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Admins</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Admin</button>
      </div>

      {admins.length === 0
        ? <div className="empty"><div className="empty-icon">👑</div><p>No admins created yet</p></div>
        : <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>College ID</th><th>Email</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{a.collegeId || '—'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{a.email || '—'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{a.department || '—'}</td>
                    <td><span className={`badge ${a.isActive ? 'badge-green' : 'badge-red'}`}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(a)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>{editing ? 'Edit Admin' : 'Add Admin'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>College ID (login username)</label><input value={form.collegeId} onChange={e => setForm({...form, collegeId: e.target.value})} required={!editing} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
              <div className="form-group"><label>{editing ? 'New Password (leave blank to keep)' : 'Password'}</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editing} /></div>
              {editing && (
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.isActive === false ? 'false' : 'true'} onChange={e => setForm({...form, isActive: e.target.value === 'true'})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create Admin'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
