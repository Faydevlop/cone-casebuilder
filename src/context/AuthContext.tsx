import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'faculty' | 'checker';

interface AuthContextValue {
  isAuthenticated: boolean;
  userEmail: string | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
const EMAIL_PASSWORD = import.meta.env.VITE_EMAIL_PASSWORD || '';

const CHECKER_EMAIL = (import.meta.env.VITE_CHECKER_EMAIL || 'checker@gmail.com').trim().toLowerCase();
const CHECKER_PASSWORD = import.meta.env.VITE_CHECKER_PASSWORD || '12345';

const SESSION_KEY = 'clinicaone_auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.email) {
          const emailLower = parsed.email.toLowerCase();
          if (emailLower === CHECKER_EMAIL) {
            setUserEmail(parsed.email);
            setUserRole('checker');
          } else if (ALLOWED_EMAILS.includes(emailLower)) {
            setUserEmail(parsed.email);
            setUserRole('faculty');
          }
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function login(email: string, password: string): string | null {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return 'Please enter your email address.';
    }

    // Check if it is a checker
    if (normalizedEmail === CHECKER_EMAIL) {
      if (password !== CHECKER_PASSWORD) {
        return 'Incorrect password. Please try again.';
      }
      setUserEmail(normalizedEmail);
      setUserRole('checker');
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalizedEmail, role: 'checker' }));
      return null;
    }

    // Check if it is faculty
    if (ALLOWED_EMAILS.includes(normalizedEmail)) {
      if (password !== EMAIL_PASSWORD) {
        return 'Incorrect password. Please try again.';
      }
      setUserEmail(normalizedEmail);
      setUserRole('faculty');
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalizedEmail, role: 'faculty' }));
      return null;
    }

    return 'This email is not authorized to access ClinicaOne.';
  }

  function logout() {
    setUserEmail(null);
    setUserRole(null);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: userEmail !== null,
      userEmail,
      userRole,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
