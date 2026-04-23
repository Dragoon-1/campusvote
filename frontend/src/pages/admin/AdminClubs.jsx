import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', logo: null });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await API.get('/admin/clubs');
    setClubs(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', logo: null }); setModal(true); };
  const openEdit = (c) => { setEditing(c._id); setForm({ name: c.name, description: c.description || '', logo: null }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (form.logo) fd.append('logo', form.logo);
      if (editing) { await API.put(`/admin/clubs/${editing}`, fd); toast.success('Club updated'); }
      else { await API.post('/admin/clubs', fd); toast.success('Club created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this club and all its nominals?')) return;
    await API.delete(`/admin/clubs/${id}`);
    toast.success('Club deleted'); load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Clubs</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Club</button>
      </div>

      {clubs.length === 0
        ? <div className="empty"><div className="empty-icon">🏆</div><p>No clubs yet</p></div>
        : <div className="grid-2">
            {clubs.map(c => (
              <div key={c._id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                {c.logo
                  ? <img src={c.logo} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg3)', display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0 }}>🏆</div>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  {c.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{c.description}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>{editing ? 'Edit Club' : 'Add Club'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Club Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label>Logo (optional)</label><input type="file" accept="image/*" onChange={e => setForm({...form, logo: e.target.files[0]})} style={{ background: 'none', padding: 0, border: 'none' }} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
