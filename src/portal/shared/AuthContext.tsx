import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  decodeToken,
  getAccessToken,
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
    // Attempt silent refresh on mount so a page reload restores the session
    // if the HttpOnly refresh cookie is still valid.
    silentRefresh().then((token) => {
      if (token) {
        setAccessToken(token);
        setState({ accessToken: token, user: decodeToken(token), loading: false });
      } else {
        setState({ accessToken: null, user: null, loading: false });
      }
    });
  }, []);

  function login(token: string) {
    setAccessToken(token);
    setState({ accessToken: token, user: decodeToken(token), loading: false });
  }

  function logout() {
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
