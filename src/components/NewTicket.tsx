import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Provider {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

export function NewTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    idc: user?.name || '',
    provider: '',
    caseNumber: '',
    client: '',
    location: '',
    serviceDate: '',
    startTime: '',
    endTime: '',
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newProvider, setNewProvider] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el ticket
    navigate('/tickets');
  };

  const handleAddProvider = () => {
    if (newProvider.trim()) {
      // Aquí iría la lógica para agregar el proveedor a la base de datos
      setProviders([...providers, { id: providers.length + 1, name: newProvider }]);
      setNewProvider('');
      setShowProviderModal(false);
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      // Aquí iría la lógica para agregar la localidad a la base de datos
      setLocations([...locations, { id: locations.length + 1, name: newLocation }]);
      setNewLocation('');
      setShowLocationModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-light-text">Nuevo Ticket de Servicio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              IDC (Nombre del usuario)
            </label>
            <input
              type="text"
              value={formData.idc}
              onChange={(e) => setFormData({ ...formData, idc: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Proveedor
            </label>
            <div className="flex gap-2">
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
                required
              >
                <option value="">Seleccione un proveedor</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowProviderModal(true)}
                className="mt-1 px-3 py-2 bg-light-secondary text-white rounded-md hover:bg-opacity-90 dark:bg-dark-accent"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Localidad
            </label>
            <div className="flex gap-2">
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
                required
              >
                <option value="">Seleccione una localidad</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="mt-1 px-3 py-2 bg-light-secondary text-white rounded-md hover:bg-opacity-90 dark:bg-dark-accent"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Caso/Folio
            </label>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cliente
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha del Servicio
            </label>
            <input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hora de Inicio
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hora de Fin
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-secondary dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-light-primary hover:bg-opacity-90 rounded-md dark:bg-dark-accent"
          >
            Guardar Ticket
          </button>
        </div>
      </form>

      {/* Modal para nuevo proveedor */}
      {showProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-300">
              Agregar Nuevo Proveedor
            </h3>
            <input
              type="text"
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-primary dark:border-dark-accent dark:text-white"
              placeholder="Nombre del proveedor"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProviderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-primary dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddProvider}
                className="px-4 py-2 text-sm font-medium text-white bg-light-primary hover:bg-opacity-90 rounded-md dark:bg-dark-accent"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nueva localidad */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-300">
              Agregar Nueva Localidad
            </h3>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-primary dark:border-dark-accent dark:text-white"
              placeholder="Nombre de la localidad"
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-dark-primary dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-4 py-2 text-sm font-medium text-white bg-light-primary hover:bg-opacity-90 rounded-md dark:bg-dark-accent"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 