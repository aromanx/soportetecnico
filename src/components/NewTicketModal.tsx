import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Ticket, Provider, Location } from '../services/db';

interface NewTicketModalProps {
  ticket?: Ticket | null;
  onClose: () => void;
  onSave: () => void;
}

export function NewTicketModal({ ticket, onClose, onSave }: NewTicketModalProps) {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newProvider, setNewProvider] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [formData, setFormData] = useState<Omit<Ticket, 'id' | 'createdAt' | 'userId'>>({
    idc: '',
    providerId: 0,
    caseNumber: '',
    client: '',
    locationId: 0,
    serviceDate: '',
    startTime: '',
    endTime: '',
    userEmail: '',
  });

  useEffect(() => {
    loadCatalogs();
    if (ticket) {
      setFormData({
        idc: ticket.idc,
        providerId: ticket.providerId,
        caseNumber: ticket.caseNumber,
        client: ticket.client,
        locationId: ticket.locationId,
        serviceDate: ticket.serviceDate,
        startTime: ticket.startTime,
        endTime: ticket.endTime,
        userEmail: ticket.userEmail,
      });
    }
  }, [ticket]);

  const loadCatalogs = async () => {
    try {
      const [loadedProviders, loadedLocations] = await Promise.all([
        api.getProviders(),
        api.getLocations()
      ]);
      setProviders(loadedProviders);
      setLocations(loadedLocations);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const handleAddProvider = async () => {
    if (newProvider.trim()) {
      try {
        const addedProvider = await api.createProvider({ name: newProvider });
        setProviders([...providers, addedProvider]);
        setFormData({ ...formData, providerId: addedProvider.id });
        setNewProvider('');
        setShowProviderModal(false);
      } catch (error) {
        console.error('Error adding provider:', error);
      }
    }
  };

  const handleAddLocation = async () => {
    if (newLocation.trim()) {
      try {
        const addedLocation = await api.createLocation({ name: newLocation });
        setLocations([...locations, addedLocation]);
        setFormData({ ...formData, locationId: addedLocation.id });
        setNewLocation('');
        setShowLocationModal(false);
      } catch (error) {
        console.error('Error adding location:', error);
      }
    }
  };

  const handleDeleteProvider = async (providerId: number) => {
    try {
      await api.deleteProvider(providerId);
      const updatedProviders = await api.getProviders();
      setProviders(updatedProviders);
      if (formData.providerId === providerId) {
        setFormData({ ...formData, providerId: 0 });
      }
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    try {
      await api.deleteLocation(locationId);
      const updatedLocations = await api.getLocations();
      setLocations(updatedLocations);
      if (formData.locationId === locationId) {
        setFormData({ ...formData, locationId: 0 });
      }
    } catch (error) {
      console.error('Error eliminando localidad:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (ticket?.id) {
        await api.updateTicket(ticket.id, formData);
      } else {
        await api.createTicket({
          ...formData,
          userId: 0,
          userEmail: user?.email || '',
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {ticket ? 'Editar Ticket' : 'Nuevo Ticket'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                IDC
              </label>
              <input
                type="text"
                value={formData.idc}
                onChange={(e) => setFormData({ ...formData, idc: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Proveedor
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={formData.providerId}
                  onChange={(e) => setFormData({ ...formData, providerId: Number(e.target.value) })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Seleccione un proveedor</option>
                  {providers.map((provider) => (
                    <option 
                      key={provider.id} 
                      value={provider.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (window.confirm('¿Está seguro de que desea eliminar este proveedor?')) {
                          handleDeleteProvider(provider.id);
                        }
                      }}
                    >
                      {provider.name} {/* El botón de eliminar aparecerá con clic derecho */}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowProviderModal(true)}
                  className="p-2 bg-light-primary text-white rounded-md hover:bg-opacity-90 dark:bg-dark-accent"
                >
                  <PlusIcon className="h-5 w-5" />
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Localidad
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: Number(e.target.value) })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Seleccione una localidad</option>
                  {locations.map((location) => (
                    <option 
                      key={location.id} 
                      value={location.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (window.confirm('¿Está seguro de que desea eliminar esta localidad?')) {
                          handleDeleteLocation(location.id);
                        }
                      }}
                    >
                      {location.name} {/* El botón de eliminar aparecerá con clic derecho */}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="p-2 bg-light-primary text-white rounded-md hover:bg-opacity-90 dark:bg-dark-accent"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha del Servicio
              </label>
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-light-primary hover:bg-opacity-90 rounded-md dark:bg-dark-accent"
            >
              {ticket ? 'Guardar Cambios' : 'Crear Ticket'}
            </button>
          </div>
        </form>

        {/* Modal para nuevo proveedor */}
        {showProviderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Agregar Nuevo Proveedor
              </h3>
              <input
                type="text"
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Nombre del proveedor"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Agregar Nueva Localidad
              </h3>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Nombre de la localidad"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
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
    </div>
  );
} 