import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Small delay for visual feedback
    setTimeout(() => {
      const err = login(email, password);
      if (err) {
        setError(err);
      }
      setIsLoading(false);
    }, 400);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
            marginBottom: '16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" opacity={0.85}>
              <circle cx="32" cy="32" r="28" stroke="var(--color-primary)" strokeWidth="2.5" />
              <path d="M32 18v28M18 32h28" stroke="var(--color-primary)" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-primary)',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>
            ClinicaOne
          </h1>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-muted)',
            margin: 0,
          }}>
            Faculty Case Builder
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            margin: '0 0 4px',
          }}>
            Sign in
          </h2>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-muted)',
            margin: '0 0 24px',
          }}>
            Enter your authorized email and password to continue.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--color-accent-red)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-muted)',
          margin: 0,
        }}>
          Access restricted to authorized faculty members only.
        </p>
      </div>
    </div>
  );
}
