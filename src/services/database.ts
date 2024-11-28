import Database from 'better-sqlite3';
import { schema } from '../db/schema';

const db = new Database('soportillo.db');

// Inicializar la base de datos con el esquema
db.exec(schema);

// Insertar usuario admin por defecto si no existe
const adminUser = {
  email: 'admin',
  name: 'Administrador',
  password: 'mastuerzo', // En producción, esto debería estar hasheado
  isAdmin: true
};

try {
  const stmt = db.prepare('INSERT INTO users (email, name, password, is_admin) VALUES (?, ?, ?, ?)');
  stmt.run(adminUser.email, adminUser.name, adminUser.password, adminUser.isAdmin);
} catch {
  // Usuario ya existe
}

export interface User {
  id?: number;
  email: string;
  name: string;
  password?: string;
  isAdmin: boolean;
}

interface SqliteValue {
  string: string;
  number: number;
  boolean: boolean;
}

export interface Ticket {
  id?: number;
  idc: string;
  provider_id: number;
  case_number: string;
  client: string;
  location_id: number;
  service_date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}

// Servicios de usuario
const userService = {
  login(email: string, password: string): User | null {
    const stmt = db.prepare('SELECT id, email, name, is_admin FROM users WHERE email = ? AND password = ?');
    return stmt.get(email, password) as User | null;
  },

  createUser(user: User): User {
    const stmt = db.prepare('INSERT INTO users (email, name, password, is_admin) VALUES (?, ?, ?, ?)');
    const result = stmt.run(user.email, user.name, user.password, user.isAdmin);
    return { ...user, id: result.lastInsertRowid as number };
  },

  updateUser(id: number, user: Partial<User>): boolean {
    const sets: string[] = [];
    const values: Array<SqliteValue[keyof SqliteValue]> = [];
    
    if (user.email) {
      sets.push('email = ?');
      values.push(user.email);
    }
    if (user.name) {
      sets.push('name = ?');
      values.push(user.name);
    }
    if (user.password) {
      sets.push('password = ?');
      values.push(user.password);
    }
    if (typeof user.isAdmin === 'boolean') {
      sets.push('is_admin = ?');
      values.push(user.isAdmin);
    }

    if (sets.length === 0) return false;

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  },

  deleteUser(id: number): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  getAllUsers(): User[] {
    const stmt = db.prepare('SELECT id, email, name, is_admin FROM users');
    return stmt.all() as User[];
  }
};

// Servicios de tickets
const ticketService = {
  getTickets(startDate?: string, endDate?: string): Ticket[] {
    let query = 'SELECT t.*, p.name as provider, l.name as location FROM tickets t ' +
                'LEFT JOIN providers p ON t.provider_id = p.id ' +
                'LEFT JOIN locations l ON t.location_id = l.id';
    
    const params: Array<string> = [];
    if (startDate && endDate) {
      query += ' WHERE service_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY service_date DESC';
    
    const stmt = db.prepare(query);
    return stmt.all(...params) as Ticket[];
  },

  createTicket(ticket: Ticket): Ticket {
    const stmt = db.prepare(`
      INSERT INTO tickets (
        idc, provider_id, case_number, client, location_id,
        service_date, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      ticket.idc,
      ticket.provider_id,
      ticket.case_number,
      ticket.client,
      ticket.location_id,
      ticket.service_date,
      ticket.start_time,
      ticket.end_time
    );
    
    return { ...ticket, id: result.lastInsertRowid as number };
  },

  getTicketById(id: number): Ticket | null {
    const stmt = db.prepare(`
      SELECT t.*, p.name as provider, l.name as location 
      FROM tickets t
      LEFT JOIN providers p ON t.provider_id = p.id
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE t.id = ?
    `);
    return stmt.get(id) as Ticket | null;
  },

  updateTicket(id: number, ticket: Partial<Ticket>): boolean {
    const sets: string[] = [];
    const values: Array<SqliteValue[keyof SqliteValue]> = [];
    
    if (ticket.idc) {
      sets.push('idc = ?');
      values.push(ticket.idc);
    }
    if (ticket.provider_id) {
      sets.push('provider_id = ?');
      values.push(ticket.provider_id);
    }
    if (ticket.case_number) {
      sets.push('case_number = ?');
      values.push(ticket.case_number);
    }
    if (ticket.client) {
      sets.push('client = ?');
      values.push(ticket.client);
    }
    if (ticket.location_id) {
      sets.push('location_id = ?');
      values.push(ticket.location_id);
    }
    if (ticket.service_date) {
      sets.push('service_date = ?');
      values.push(ticket.service_date);
    }
    if (ticket.start_time) {
      sets.push('start_time = ?');
      values.push(ticket.start_time);
    }
    if (ticket.end_time) {
      sets.push('end_time = ?');
      values.push(ticket.end_time);
    }

    if (sets.length === 0) return false;

    values.push(id);
    const stmt = db.prepare(`UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  },

  deleteTicket(id: number): boolean {
    const stmt = db.prepare('DELETE FROM tickets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

export { userService, ticketService }; 