import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OPTIONS = [
  { value: 'find', title: 'Find help', text: 'Book trusted tradespeople near you' },
  { value: 'offer', title: 'Offer my services', text: 'Get booked and get paid for your work' },
  { value: 'both', title: 'Both', text: 'Book help and offer services with one account' },
];

export default function Purpose() {
  const { setPurpose } = useAuth();
  const navigate = useNavigate();
  const [choice, setChoice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await setPurpose(choice);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <h1>What brings you to Tradr?</h1>
      <p className="hint">You can change this later in More.</p>
      <form onSubmit={onSubmit} className="form">
        {OPTIONS.map((o) => (
          <label key={o.value} className={`choice ${choice === o.value ? 'selected' : ''}`}>
            <input type="radio" name="purpose" value={o.value} checked={choice === o.value} onChange={() => setChoice(o.value)} />
            <span>
              <strong>{o.title}</strong>
              <span className="hint">{o.text}</span>
            </span>
          </label>
        ))}
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" disabled={!choice || busy}>{busy ? 'Saving…' : 'Continue'}</button>
      </form>
    </main>
  );
}
