import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const POST_OPTS = ['GS','VGS','president','vicePresident','secretary','treasurer'];
const POST_LABELS = { GS:'GS', VGS:'VGS', president:'President', vicePresident:'Vice President', secretary:'Secretary', treasurer:'Treasurer' };

const EMPTY = { collegeId: '', postType: 'GS', clubId: '', description: '', photo: null };

export default function AdminNominals() {
  const [nominals, setNominals] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [n, c] = await Promise.all([API.get('/admin/nominals'), API.get('/admin/clubs')]);
    setNominals(n.data);
    setClubs(c.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const needsClub = !['GS','VGS'].includes(form.postType);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (n) => {
    setEditing(n._id);
    setForm({ collegeId: n.collegeId, postType: n.postType, clubId: n.clubId?._id || '', description: n.description || '', photo: null });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('collegeId', form.collegeId);
      fd.append('postType', form.postType);
      fd.append('description', form.description);
      if (needsClub && form.clubId) fd.append('clubId', form.clubId);
      if (form.photo) fd.append('photo', form.photo);
      if (editing) {
        await API.put(`/admin/nominals/${editing}`, fd);
        toast.success('Nominal updated');
      } else {
        await API.post('/admin/nominals', fd);
        toast.success('Nominal added');
      }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this nominal?')) return;
    await API.delete(`/admin/nominals/${id}`);
    toast.success('Nominal removed');
    load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Nominals</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Nominal</button>
      </div>

      {nominals.length === 0
        ? <div className="empty"><div className="empty-icon">🏅</div><p>No nominals added yet</p></div>
        : <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>College ID</th><th>Post</th><th>Club</th><th>Votes</th><th>Actions</th></tr></thead>
              <tbody>
                {nominals.map(n => (
                  <tr key={n._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {n.photo
                        ? <img src={n.photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', display: 'grid', placeItems: 'center', fontSize: 14 }}>👤</div>}
                      <span>{n.name}</span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{n.collegeId}</td>
                    <td><span className="badge badge-blue">{POST_LABELS[n.postType]}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{n.clubId?.name || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--gold)' }}>{n.voteCount}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(n)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n._id)}>Remove</button>
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
            <h3>{editing ? 'Edit Nominal' : 'Add Nominal'}</h3>
            <form onSubmit={handleSubmit}>
              {!editing && (
                <div className="form-group">
                  <label>College ID</label>
                  <input placeholder="Student's college ID" value={form.collegeId} onChange={e => setForm({...form, collegeId: e.target.value})} required />
                </div>
              )}
              <div className="form-group">
                <label>Post</label>
                <select value={form.postType} onChange={e => setForm({...form, postType: e.target.value, clubId: ''})}>
                  {POST_OPTS.map(p => <option key={p} value={p}>{POST_LABELS[p]}</option>)}
                </select>
              </div>
              {needsClub && (
                <div className="form-group">
                  <label>Club</label>
                  <select value={form.clubId} onChange={e => setForm({...form, clubId: e.target.value})} required>
                    <option value="">Select club</option>
                    {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Description / Manifesto</label>
                <textarea rows={3} placeholder="Brief description shown to voters" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={e => setForm({...form, photo: e.target.files[0]})} style={{ background: 'none', padding: 0, border: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Nominal'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
