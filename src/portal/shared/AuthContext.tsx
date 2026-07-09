import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  clearSession,
  decodeToken,
  getAccessToken,
  hadSession,
  markSession,
  setAccessToken,
  silentRefresh,
} from './auth';
import type { JwtPayload } from './types';

interface AuthState {
  accessToken: string | null;
  user: JwtPayload | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Only attempt a silent refresh if this browser has logged in before — a
    // fresh visitor has no refresh cookie, so calling /auth/refresh/ would 401
    // and noise the console for nothing.
    if (!hadSession()) {
      setState({ accessToken: null, user: null, loading: false });
      return;
    }
    // Page reload: restore the session if the HttpOnly refresh cookie is valid.
    silentRefresh().then((token) => {
      if (token) {
        setAccessToken(token);
        setState({ accessToken: token, user: decodeToken(token), loading: false });
      } else {
        // Cookie expired/absent — drop the stale marker so the next load is clean.
        clearSession();
        setState({ accessToken: null, user: null, loading: false });
      }
    });
  }, []);

  function login(token: string) {
    markSession();
    setAccessToken(token);
    setState({ accessToken: token, user: decodeToken(token), loading: false });
  }

  function logout() {
    clearSession();
    setAccessToken(null);
    setState({ accessToken: null, user: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { getAccessToken };
