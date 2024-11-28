import Dexie from 'dexie';

export interface User {
  id?: number;
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

export interface Provider {
  id?: number;
  name: string;
}

export interface Location {
  id?: number;
  name: string;
}

export interface Ticket {
  id?: number;
  idc: string;
  providerId: number;
  caseNumber: string;
  client: string;
  locationId: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  createdAt?: Date;
  userId: number;
  userEmail: string;
}

class AppDatabase extends Dexie {
  users!: Dexie.Table<User, number>;
  providers!: Dexie.Table<Provider, number>;
  locations!: Dexie.Table<Location, number>;
  tickets!: Dexie.Table<Ticket, number>;

  constructor() {
    super('soportilloDB');
    this.version(2).stores({
      users: '++id, email, name, password, isAdmin',
      providers: '++id, name',
      locations: '++id, name',
      tickets: '++id, idc, providerId, locationId, serviceDate, userId, userEmail'
    });
  }
}

const db = new AppDatabase();

// Agregar usuario admin por defecto
db.on('ready', async () => {
  const adminCount = await db.users.where('email').equals('admin').count();
  if (adminCount === 0) {
    await db.users.add({
      email: 'admin',
      name: 'Administrador',
      password: 'mastuerzo',
      isAdmin: true
    });
  }
});

export const userService = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      console.log('Intentando login con:', email); // Para debugging

      // Primero verificamos si es el admin
      if (email === 'admin' && password === 'mastuerzo') {
        return {
          id: 0,
          email: 'admin',
          name: 'Administrador',
          isAdmin: true,
          password: 'mastuerzo'
        };
      }

      // Buscar usuario por email y contraseña
      const user = await db.users
        .where('email')
        .equals(email.toLowerCase())
        .first();

      console.log('Usuario encontrado:', user); // Para debugging

      if (user && user.password === password) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          password: user.password
        };
      }

      return null;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  },

  async createUser(user: User): Promise<User> {
    // Asegurarnos de que el email esté en minúsculas
    const newUser = {
      ...user,
      email: user.email.toLowerCase()
    };
    const id = await db.users.add(newUser);
    return { ...newUser, id: Number(id) };
  },

  async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    try {
      await db.users.update(id, user);
      return true;
    } catch {
      return false;
    }
  },

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.users.delete(id);
      return true;
    } catch {
      return false;
    }
  },

  async getAllUsers(): Promise<User[]> {
    return db.users.toArray();
  }
};

export const ticketService = {
  async getTickets(userId: number, isAdmin: boolean): Promise<Ticket[]> {
    if (isAdmin) {
      return db.tickets.toArray();
    } else {
      return db.tickets.where('userId').equals(userId).toArray();
    }
  },

  async createTicket(ticket: Ticket): Promise<Ticket> {
    const id = await db.tickets.add({
      ...ticket,
      createdAt: new Date()
    });
    return { ...ticket, id: Number(id) };
  },

  async updateTicket(id: number, ticket: Partial<Ticket>): Promise<boolean> {
    try {
      await db.tickets.update(id, ticket);
      return true;
    } catch {
      return false;
    }
  },

  async deleteTicket(id: number): Promise<boolean> {
    try {
      await db.tickets.delete(id);
      return true;
    } catch {
      return false;
    }
  }
};

export { db }; 