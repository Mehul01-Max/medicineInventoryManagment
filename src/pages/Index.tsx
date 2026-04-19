import { Navigate } from 'react-router-dom';
import { store } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not onboarded → welcome
  // Logged in and onboarded → dashboard
  return <Navigate to={store.isOnboarded() ? '/home' : '/welcome'} replace />;
};

export default Index;
