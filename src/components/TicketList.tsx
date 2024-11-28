import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Ticket, Provider, Location } from '../services/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [providersData, locationsData, ticketsData] = await Promise.all([
          api.getProviders(),
          api.getLocations(),
          api.getTickets(user?.email || '', !!user?.isAdmin)
        ]);
        
        setProviders(providersData);
        setLocations(locationsData);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Configurar intervalo de refresco cada 5 segundos
    const interval = setInterval(fetchData, 5000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lista de Tickets</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['ID', 'IDC', 'Proveedor', 'Caso/Folio', 'Cliente', 'Localidad', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Creador'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.idc}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {providers.find(p => p.id === ticket.providerId)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.caseNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {locations.find(l => l.id === ticket.locationId)?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: es })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.startTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.endTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.userEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 