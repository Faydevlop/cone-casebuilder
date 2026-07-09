import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: 'dashboard' | 'builder' | 'checker';
  onViewChange: (view: 'dashboard' | 'builder' | 'checker') => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { userRole } = useAuth();

  return (
    <aside className="sidebar" style={{ width: 'var(--sidebar-width)' }}>
      {/* Logo / Brand */}
      <div className="sidebar-logo" style={{ padding: '24px 20px' }}>
        <div className="sidebar-logo-icon">
          {/* Simple stethoscope-style mark */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="var(--color-primary)" strokeWidth="2" />
            <path
              d="M10 10 Q10 18 16 18 Q22 18 22 10"
              stroke="var(--color-primary)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="22" cy="22" r="3" fill="var(--color-primary)" />
            <line x1="22" y1="19" x2="22" y2="22" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-name" style={{ fontSize: '15px' }}>ClinicaOne</div>
          <div className="sidebar-logo-tagline" style={{ fontSize: '10px' }}>Institutional Precision</div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Render Dashboard & Add Case ONLY for Faculty users */}
        {userRole === 'faculty' && (
          <>
            <button
              className={`sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              type="button"
              onClick={() => onViewChange('dashboard')}
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 'var(--font-size-base)',
              }}
            >
              <svg className="sidebar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: currentView === 'dashboard' ? 1 : 0.6 }}>
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              Dashboard
            </button>

            <button
              className={`sidebar-nav-item ${currentView === 'builder' ? 'active' : ''}`}
              type="button"
              onClick={() => onViewChange('builder')}
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 'var(--font-size-base)',
              }}
            >
              <svg className="sidebar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: currentView === 'builder' ? 1 : 0.6 }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Case
            </button>
          </>
        )}

        {/* Render Checker Portal ONLY for Checker users */}
        {userRole === 'checker' && (
          <button
            className={`sidebar-nav-item ${currentView === 'checker' ? 'active' : ''}`}
            type="button"
            onClick={() => onViewChange('checker')}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: 'var(--font-size-base)',
            }}
          >
            <svg className="sidebar-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: currentView === 'checker' ? 1 : 0.6 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Checker Portal
          </button>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom links */}
      <div className="sidebar-bottom" style={{ padding: '16px 12px' }}>
        <button className="sidebar-nav-item" type="button" style={{ padding: '8px 16px', fontSize: 'var(--font-size-sm)' }}>
          <svg className="sidebar-nav-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          Help Center
        </button>
      </div>
    </aside>
  );
}
