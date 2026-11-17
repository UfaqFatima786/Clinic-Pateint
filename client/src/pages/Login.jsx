import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homePath } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(homePath(user.role));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="auth-showcase">
        <div className="showcase-orb showcase-orb-one" aria-hidden="true" />
        <div className="showcase-orb showcase-orb-two" aria-hidden="true" />
        <div className="showcase-content">
          <span className="showcase-kicker">YOUR HEALTH, OUR PRIORITY</span>
          <h1>Care that fits your life.</h1>
          <p>Connect with trusted doctors and manage your appointments, all in one place.</p>
          <div className="showcase-note">
            <span className="showcase-note-icon">✦</span>
            <span><strong>Here for you</strong><br />Simple, thoughtful care starts here.</span>
          </div>
        </div>
      </section>
      <form className="card auth-card" onSubmit={submit}>
        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="muted">Enter your details to continue to your clinic.</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Enter your password"
        />
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
        <p className="muted center auth-signup">
          New patient? <Link to="/register">Create an account <span aria-hidden="true">→</span></Link>
        </p>
      </form>
    </div>
  );
}
