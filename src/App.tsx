import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { UserManagement } from './components/UserManagement';
import { TicketsManager } from './components/TicketsManager';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Home />} />
          <Route
            path="tickets"
            element={
              <ProtectedRoute>
                <TicketsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
