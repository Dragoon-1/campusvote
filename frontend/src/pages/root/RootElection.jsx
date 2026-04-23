import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function RootElection() {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ isOpen: false, resultsPublished: false, startTime: '', endTime: '' });

  const load = async () => {
  const r = await API.get('/root/election');
  setElection(r.data);
  setForm({
    isOpen: r.data.isOpen || false,
    resultsPublished: r.data.resultsPublished || false,
    startTime: r.data.startTime ? new Date(r.data.startTime).toISOString().slice(0,16) : '',
    endTime: r.data.endTime ? new Date(r.data.endTime).toISOString().slice(0,16) : ''
  });
  setLoading(false);
};
useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/root/election', form);
      toast.success('Election settings updated');
      load();
    } catch (err) { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 className="section-title">Election Control</h2>

      <div className="card" style={{ marginBottom: 16, borderColor: form.isOpen ? '#1e4030' : 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Voting Status</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Toggle to open or close voting</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: form.isOpen ? 'var(--green)' : 'var(--text3)', fontWeight: 600 }}>
              {form.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
            </span>
            <input type="checkbox" checked={form.isOpen} onChange={e => setForm({...form, isOpen: e.target.checked})}
              style={{ width: 20, height: 20, accentColor: 'var(--green)', cursor: 'pointer' }} />
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, borderColor: form.resultsPublished ? '#2a2010' : 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Publish Results</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Makes results visible to all voters</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: form.resultsPublished ? 'var(--gold)' : 'var(--text3)', fontWeight: 600 }}>
              {form.resultsPublished ? '🏆 PUBLISHED' : '⏳ PENDING'}
            </span>
            <input type="checkbox" checked={form.resultsPublished} onChange={e => setForm({...form, resultsPublished: e.target.checked})}
              style={{ width: 20, height: 20, accentColor: '#f7c94f', cursor: 'pointer' }} />
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 14, fontSize: 14, color: 'var(--text2)' }}>Election Window (optional)</h4>
        <div className="form-group">
          <label>Start Time</label>
          <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
        </div>
      </div>

      <button className="btn btn-gold" onClick={handleSave} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
        {saving ? 'Saving...' : '💾 Save Election Settings'}
      </button>

      {election?.updatedAt && (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 10 }}>
          Last updated: {new Date(election.updatedAt).toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
