import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../services/db';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    email: '',
    name: '',
    password: '',
    isAdmin: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const loadUsers = async () => {
    try {
      const allUsers = await api.getUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    const interval = setInterval(loadUsers, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleAddUser = async () => {
    if (!newUser.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return;
    }

    if (newUser.email && newUser.name && newUser.password) {
      try {
        await api.createUser(newUser);
        await loadUsers(); // Recargar usuarios después de crear uno nuevo
        setOpenDialog(false);
        resetForm();
      } catch (error) {
        console.error('Error creando usuario:', error);
      }
    }
  };

  const handleUpdateUser = async () => {
    if (editingUser?.id) {
      if (editingUser.email !== 'admin' && !editingUser.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return;
      }

      const updateData: Partial<User> = {
        name: editingUser.name,
        email: editingUser.email,
        isAdmin: editingUser.isAdmin,
      };

      if (showPasswordChange && newPassword) {
        updateData.password = newPassword;
      }

      await api.updateUser(editingUser.id, updateData);
      await loadUsers();
      setEditingUser(null);
      setShowPasswordChange(false);
      setNewPassword('');
    }
  };

  const handleDeleteUser = async (id: number) => {
    await api.deleteUser(id);
    await loadUsers();
    setShowConfirmDelete(null);
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setShowPasswordChange(false);
    setNewPassword('');
  };

  const resetForm = () => {
    setNewUser({
      email: '',
      name: '',
      password: '',
      isAdmin: false
    });
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-light-primary hover:bg-opacity-90 dark:bg-dark-accent"
        >
          Nuevo Usuario
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuarios..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-light-primary focus:border-light-primary sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                      Nombre
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300">
                      Administrador
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={user.isAdmin}
                          onChange={async () => {
                            await api.updateUser(user.id!, { isAdmin: !user.isAdmin });
                            loadUsers();
                          }}
                          className="h-4 w-4 text-light-primary focus:ring-light-primary border-gray-300 rounded dark:border-gray-600"
                        />
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(user.id!)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para nuevo/editar usuario */}
      {(openDialog || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingUser ? editingUser.name : newUser.name}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, name: e.target.value });
                    } else {
                      setNewUser({ ...newUser, name: e.target.value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, email: e.target.value });
                    } else {
                      setNewUser({ ...newUser, email: e.target.value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {editingUser ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="flex items-center text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                    >
                      <KeyIcon className="h-4 w-4 mr-1" />
                      {showPasswordChange ? 'Cancelar cambio' : 'Cambiar contraseña'}
                    </button>
                  </div>
                  {showPasswordChange && (
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nueva contraseña"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-primary focus:ring-light-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                  ¿Es administrador?
                </label>
                <input
                  type="checkbox"
                  checked={editingUser ? editingUser.isAdmin : newUser.isAdmin}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, isAdmin: e.target.checked });
                    } else {
                      setNewUser({ ...newUser, isAdmin: e.target.checked });
                    }
                  }}
                  className="h-4 w-4 text-light-primary focus:ring-light-primary border-gray-300 rounded dark:border-gray-600"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setOpenDialog(false);
                  setEditingUser(null);
                  setShowPasswordChange(false);
                  setNewPassword('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="px-4 py-2 text-sm font-medium text-white bg-light-primary hover:bg-opacity-90 rounded-md dark:bg-dark-accent"
              >
                {editingUser ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Confirmar eliminación
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar este usuario?
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => showConfirmDelete && handleDeleteUser(showConfirmDelete)}
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