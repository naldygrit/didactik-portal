import { useAuth } from '../../shared/AuthContext';

export function BroadcasterDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Broadcaster Dashboard
      </h1>
      <p className="text-gray-500 text-sm">
        Signed in as {user?.email}
      </p>
    </div>
  );
}
