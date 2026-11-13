import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ ...form, phone: form.phone || undefined });
      navigate('/purpose');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <h1>Sign up to Tradr</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Full name
          <input value={form.fullName} onChange={update('fullName')} autoComplete="name" required />
        </label>
        <label>
          Email address
          <input type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
        </label>
        <label>
          Mobile number (optional)
          <input type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" />
        </label>
        <label>
          Password
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="inline">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Show password
        </label>
        <p className="hint">At least 8 characters with a letter, a number and a special character.</p>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="alt">Already have an account? <Link to="/login">Log in</Link></p>
    </main>
  );
}
