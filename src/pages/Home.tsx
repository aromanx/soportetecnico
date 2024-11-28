import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TicketIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export function Home() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null; // La redirección se maneja en App.tsx
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Sistema de Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Selecciona una opción para comenzar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/tickets')}
          className="bg-light-primary dark:bg-dark-accent rounded-xl p-8 text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <div className="flex flex-col items-center text-center">
            <TicketIcon className="h-16 w-16 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Tickets</h3>
            <p className="text-sm opacity-90">Gestionar tickets de servicio</p>
          </div>
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate('/users')}
            className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-8 text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="flex flex-col items-center text-center">
              <UserGroupIcon className="h-16 w-16 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Administración</h3>
              <p className="text-sm opacity-90">Gestionar usuarios del sistema</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
} 