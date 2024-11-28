import axios from 'axios';
import type { Ticket, Provider, Location, User } from '../services/db';

const API_URL = 'http://localhost:3001/api';

export const api = {
  async login(email: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  async getTickets(userEmail: string, isAdmin: boolean) {
    const response = await axios.get(`${API_URL}/tickets`, {
      params: { userEmail, isAdmin }
    });
    return response.data;
  },

  async createTicket(ticket: Omit<Ticket, 'id'>) {
    const response = await axios.post(`${API_URL}/tickets`, ticket);
    return response.data;
  },

  async updateTicket(id: number, ticket: Partial<Ticket>) {
    const response = await axios.put(`${API_URL}/tickets/${id}`, ticket);
    return response.data;
  },

  async deleteTicket(id: number) {
    const response = await axios.delete(`${API_URL}/tickets/${id}`);
    return response.data;
  },

  async getProviders() {
    const response = await axios.get<Provider[]>(`${API_URL}/providers`);
    return response.data;
  },

  async getLocations() {
    const response = await axios.get<Location[]>(`${API_URL}/locations`);
    return response.data;
  },

  async createProvider(provider: Omit<Provider, 'id'>) {
    const response = await axios.post(`${API_URL}/providers`, provider);
    return response.data;
  },

  async createLocation(location: Omit<Location, 'id'>) {
    const response = await axios.post(`${API_URL}/locations`, location);
    return response.data;
  },

  async getUsers() {
    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  },

  async createUser(user: Omit<User, 'id'>) {
    const response = await axios.post(`${API_URL}/users`, user);
    return response.data;
  },

  async updateUser(id: number, user: Partial<User>) {
    const response = await axios.put(`${API_URL}/users/${id}`, user);
    return response.data;
  },

  async deleteUser(id: number) {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  },

  async deleteProvider(id: number) {
    const response = await axios.delete(`${API_URL}/providers/${id}`);
    return response.data;
  },

  async deleteLocation(id: number) {
    const response = await axios.delete(`${API_URL}/locations/${id}`);
    return response.data;
  }
}; 