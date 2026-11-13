import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, switchMode, logout } = useAuth();
  const [error, setError] = useState('');

  if (!user.purpose) return <Navigate to="/purpose" replace />;

  const nextMode = user.activeMode === 'customer' ? 'trader' : 'customer';

  async function onSwitch() {
    setError('');
    try {
      await switchMode(nextMode);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="screen">
      <h1>Hello, {user.fullName}</h1>
      <p>
        You are in <strong>{user.activeMode}</strong> mode.
        {user.traderStatus !== 'none' && <> Trader profile: <strong>{user.traderStatus}</strong>.</>}
      </p>
      <div className="form">
        <button type="button" onClick={onSwitch}>Switch to {nextMode} mode</button>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="button" className="secondary" onClick={logout}>Log out</button>
      </div>
    </main>
  );
}
