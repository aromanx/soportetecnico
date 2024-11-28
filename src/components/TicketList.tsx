import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, Ticket } from '../services/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      let fetchedTickets;
      if (user?.isAdmin) {
        fetchedTickets = await db.tickets.toArray(); // Obtener todos los tickets
      } else {
        fetchedTickets = await db.tickets.where('userId').equals(user.id).toArray(); // Filtrar por ID de usuario
      }

      // Obtener nombres de usuarios para cada ticket
      const ticketsWithUser = await Promise.all(fetchedTickets.map(async (ticket) => {
        const user = await db.users.get(ticket.userId); // Obtener el usuario por ID
        return { ...ticket, userName: user?.name || 'Desconocido' }; // Agregar el nombre del usuario
      }));

      setTickets(ticketsWithUser);
    };

    fetchTickets();
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.provider}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.caseNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: es })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.startTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.endTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{ticket.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 