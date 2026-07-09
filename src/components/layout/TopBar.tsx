// ─── TopBar: profile area with logout ────────────────────────────────────────

import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { userEmail, logout } = useAuth();

  // Derive display name from email
  const emailName = userEmail ? userEmail.split('@')[0] : 'Faculty';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      {/* Left — hamburger menu (mobile only) */}
      <button
        type="button"
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Right — profile + logout */}
      <div className="topbar-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1.2 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', lineHeight: 1.2 }}>
              {userEmail}
            </div>
          </div>
          <div className="topbar-avatar" title={displayName}>
            {initials}
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={logout}
            style={{ marginLeft: '4px', fontSize: '12px', padding: '5px 10px' }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: 4 }}>
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414-1.414L11.586 7H7a1 1 0 110-2h7a1 1 0 011 1v7a1 1 0 11-2 0V7.414z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
