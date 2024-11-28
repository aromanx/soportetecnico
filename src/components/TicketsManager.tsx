import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { NewTicketModal } from './NewTicketModal';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Ticket, Provider, Location } from '../services/db';

export function TicketsManager() {
  const { user, isAdmin } = useAuth();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({
    idc: '',
    providerId: '',
  });
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

  const loadData = async () => {
    try {
      console.log('Cargando datos con:', { email: user?.email, isAdmin }); // Debug
      const [ticketsData, providersData, locationsData] = await Promise.all([
        api.getTickets(user?.email || '', isAdmin),
        api.getProviders(),
        api.getLocations()
      ]);
      
      setTickets(ticketsData);
      setProviders(providersData);
      setLocations(locationsData);
      setFilteredTickets(ticketsData); // Actualizar también los tickets filtrados
      
      console.log('Datos cargados:', { tickets: ticketsData.length }); // Debug
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Efecto para cargar datos iniciales y configurar actualización periódica
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [user?.email, isAdmin]);

  useEffect(() => {
    if (tickets) {
      applyFilters();
    }
  }, [tickets, filters]);

  const applyFilters = () => {
    if (!tickets) return;
    
    let filtered = [...tickets];
    
    if (filters.idc) {
      filtered = filtered.filter(ticket => 
        ticket.idc.toLowerCase().includes(filters.idc.toLowerCase())
      );
    }
    
    if (filters.providerId) {
      filtered = filtered.filter(ticket => 
        ticket.providerId === Number(filters.providerId)
      );
    }
    
    setFilteredTickets(filtered);
  };

  const handleDelete = async (id: number) => {
    await api.deleteTicket(id);
    loadData();
    setShowConfirmDelete(null);
  };

  const exportToExcel = () => {
    // Preparar los datos para Excel
    const data = filteredTickets.map(ticket => ({
      ID: ticket.id,
      IDC: ticket.idc,
      Proveedor: providers.find(p => p.id === ticket.providerId)?.name || '',
      'Caso/Folio': ticket.caseNumber,
      Cliente: ticket.client,
      Localidad: locations.find(l => l.id === ticket.locationId)?.name || '',
      Fecha: format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: es }),
      'Hora Inicio': ticket.startTime,
      'Hora Fin': ticket.endTime,
      'Creado por': ticket.userEmail
    }));

    // Crear libro de Excel
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Tickets');

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 5 },  // ID
      { wch: 15 }, // IDC
      { wch: 20 }, // Proveedor
      { wch: 15 }, // Caso/Folio
      { wch: 25 }, // Cliente
      { wch: 20 }, // Localidad
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora Inicio
      { wch: 10 }, // Hora Fin
      { wch: 25 }, // Creado por
    ];
    ws['!cols'] = colWidths;

    // Descargar archivo
    writeFile(wb, 'tickets.xlsx');
  };

  const exportToPDF = () => {
    // Crear documento PDF
    const doc = new jsPDF();

    // Configurar título
    doc.setFontSize(16);
    doc.text('Reporte de Tickets', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = filteredTickets.map(ticket => [
      ticket.id?.toString() || '',
      ticket.idc,
      providers.find(p => p.id === ticket.providerId)?.name || '',
      ticket.caseNumber,
      ticket.client,
      locations.find(l => l.id === ticket.locationId)?.name || '',
      format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: es }),
      ticket.startTime,
      ticket.endTime,
      ticket.userEmail
    ]);

    // Configurar y generar tabla
    autoTable(doc, {
      head: [[
        'ID', 'IDC', 'Proveedor', 'Caso/Folio', 'Cliente', 
        'Localidad', 'Fecha', 'Inicio', 'Fin', 'Creado por'
      ]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [242, 242, 242] },
      margin: { top: 25 }
    });

    // Descargar archivo
    doc.save('tickets.pdf');
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tickets</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gestiona todos los tickets de servicio
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none space-x-2">
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-light-primary hover:bg-opacity-90 dark:bg-dark-accent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Ticket
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha Fin
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            IDC
          </label>
          <input
            type="text"
            value={filters.idc}
            onChange={(e) => setFilters({ ...filters, idc: e.target.value })}
            placeholder="Buscar por IDC..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Proveedor
          </label>
          <select
            value={filters.providerId}
            onChange={(e) => setFilters({ ...filters, providerId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-dark-secondary dark:border-dark-primary dark:text-white"
          >
            <option value="">Todos los proveedores</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de tickets */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['ID', 'IDC', 'Proveedor', 'Caso/Folio', 'Cliente', 'Localidad', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Acciones'].map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.idc}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {providers.find(p => p.id === ticket.providerId)?.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.caseNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.client}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.locationId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(ticket.serviceDate), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.startTime}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.endTime}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingTicket(ticket)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowConfirmDelete(ticket.id || null)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de nuevo/editar ticket */}
      {(showNewTicketModal || editingTicket) && (
        <NewTicketModal
          ticket={editingTicket}
          onClose={() => {
            setShowNewTicketModal(false);
            setEditingTicket(null);
          }}
          onSave={() => {
            loadData();
            setShowNewTicketModal(false);
            setEditingTicket(null);
          }}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Confirmar eliminación
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar este ticket?
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => showConfirmDelete && handleDelete(showConfirmDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 