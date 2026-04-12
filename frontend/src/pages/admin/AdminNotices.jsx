import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const typeColors = { notice: 'var(--accent)', update: 'var(--green)', result: 'var(--gold)' };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'notice' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await API.get('/admin/notices');
    setNotices(r.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ title: '', content: '', type: 'notice' }); setModal(true); };
  const openEdit = (n) => { setEditing(n._id); setForm({ title: n.title, content: n.content, type: n.type }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await API.put(`/admin/notices/${editing}`, form); toast.success('Notice updated'); }
      else { await API.post('/admin/notices', form); toast.success('Notice posted'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await API.delete(`/admin/notices/${id}`); toast.success('Deleted'); load();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Noticeboard</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ Post Notice</button>
      </div>

      {notices.length === 0
        ? <div className="empty"><div className="empty-icon">📢</div><p>No notices yet</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notices.map(n => (
              <div key={n._id} className="card" style={{ borderLeft: `3px solid ${typeColors[n.type]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ fontSize: 15 }}>{n.title}</h4>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: typeColors[n.type] + '22', color: typeColors[n.type], fontWeight: 600 }}>{n.type}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{n.content}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n._id)}>Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      {modal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <h3>{editing ? 'Edit Notice' : 'Post Notice'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="notice">📋 Notice</option>
                  <option value="update">🔔 Update</option>
                  <option value="result">🏆 Result</option>
                </select>
              </div>
              <div className="form-group"><label>Content</label><textarea rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} required /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Posting...' : editing ? 'Update' : 'Post'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
