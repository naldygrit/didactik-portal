import { useId, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postLogin, decodeToken } from './auth';
import { useAuth } from './AuthContext';
import { DkFormMessage } from '../../components/dk/DkFormMessage';
import { bcLink, pcLink, portalHome, signupPath } from './portalHost';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorId = useId();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = await postLogin(username, password);
      login(token);
      const payload = decodeToken(token);
      if (payload.role === 'broadcaster_user') {
        navigate(bcLink('dashboard'), { replace: true });
      } else if (payload.role === 'production_company_user') {
        navigate(pcLink('dashboard'), { replace: true });
      } else {
        navigate(portalHome(), { replace: true });
      }
    } catch {
      setError('Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="mb-8 text-center flex flex-col items-center">
          <img
            src="/images/didactik-logo-1.svg"
            alt="Didactik Media"
            className="h-10 mb-2"
          />
          <p className="mt-1 text-sm text-gray-500">Sign in to your portal</p>
        </div>

        {error && (
          <DkFormMessage
            tone="error"
            id={errorId}
            className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </DkFormMessage>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="cta-button w-full border-none outline-none py-3 text-sm disabled:opacity-60"
          >
            <span aria-live="polite">{submitting ? 'Signing in…' : 'Sign in'}</span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to Didactik?{' '}
          <Link to={signupPath()} className="font-medium" style={{ color: '#5343fd' }}>
            Apply for access
          </Link>
        </p>
      </div>
    </div>
  );
}
