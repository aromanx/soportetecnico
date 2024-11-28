import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function Home() {
  const { user, isAdmin } = useAuth();

  if (user) {
    return <Navigate to={isAdmin ? "/users" : "/tickets"} replace />;
  }

  return <Navigate to="/login" replace />;
} 