import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const POST_LABELS = {
  GS: 'General Secretary', VGS: 'Vice General Secretary',
  president: 'President', vicePresident: 'Vice President',
  secretary: 'Secretary', treasurer: 'Treasurer'
};

export default function VotingSection({ postType, clubId, election, alreadyVoted, onVoted }) {
  const [nominals, setNominals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(alreadyVoted);

  useEffect(() => {
    setDone(alreadyVoted);
    if (clubId) {
      API.get(`/public/clubs/${clubId}/nominals`).then(r => {
        setNominals(r.data[postType] || []);
        setLoading(false);
      });
    } else {
      API.get(`/public/nominals/${postType}`).then(r => {
        setNominals(r.data);
        setLoading(false);
      });
    }
  }, [postType, clubId, alreadyVoted]);

  const handleVote = async () => {
    if (!selected) return toast.error('Please select a candidate');
    setSubmitting(true);
    try {
      await API.post('/voter/vote', { nominalId: selected, postType, clubId });
      toast.success('Vote cast successfully! 🎉');
      setDone(true);
      onVoted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18 }}>{POST_LABELS[postType]}</h3>
        {done && <span className="badge badge-green">✓ Voted</span>}
        {!election?.isOpen && <span className="badge badge-red">Voting Closed</span>}
      </div>

      {nominals.length === 0 ? (
        <div className="empty"><div className="empty-icon">📋</div><p>No candidates registered yet</p></div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {nominals.map(n => (
              <div
                key={n._id}
                className={`vote-card ${selected === n._id ? 'selected' : ''} ${done ? 'disabled' : ''}`}
                onClick={() => { if (!done && election?.isOpen) setSelected(n._id); }}
                style={{ opacity: done && selected !== n._id ? .6 : 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  {n.photo
                    ? <img src={n.photo} alt={n.name} />
                    : <div className="no-photo">👤</div>}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-head)' }}>{n.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{n.collegeId}</div>
                  </div>
                </div>
                {n.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{n.description}</p>}
              </div>
            ))}
          </div>

          {!done && election?.isOpen && (
            <button className="btn btn-primary" onClick={handleVote} disabled={!selected || submitting}>
              {submitting ? 'Casting Vote...' : `Submit Vote for ${POST_LABELS[postType]}`}
            </button>
          )}

          {done && (
            <div style={{ padding: '12px 16px', background: '#142a1e', borderRadius: 8, border: '1px solid #1e4030', color: 'var(--green)', fontSize: 14 }}>
              ✅ Your vote for {POST_LABELS[postType]} has been recorded. Thank you!
            </div>
          )}
        </>
      )}
    </div>
  );
}
