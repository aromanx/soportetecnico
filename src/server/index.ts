import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DATABASE_PATH || 'database.sqlite';

// Inicializar base de datos SQLite
const dbPromise = open({
  filename: join(__dirname, '..', '..', DB_PATH),
  driver: sqlite3.Database
});

// Crear tablas si no existen
async function initializeDatabase() {
  const db = await dbPromise;
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      isAdmin BOOLEAN NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idc TEXT NOT NULL,
      providerId INTEGER NOT NULL,
      caseNumber TEXT NOT NULL,
      client TEXT NOT NULL,
      locationId INTEGER NOT NULL,
      serviceDate TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      userId INTEGER NOT NULL,
      userEmail TEXT NOT NULL,
      FOREIGN KEY (providerId) REFERENCES providers (id),
      FOREIGN KEY (locationId) REFERENCES locations (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Insertar usuario admin por defecto si no existe
  const adminExists = await db.get('SELECT * FROM users WHERE email = ?', ['admin']);
  if (!adminExists) {
    console.log('Creando usuario admin por defecto');
    await db.run(
      'INSERT INTO users (email, name, password, isAdmin) VALUES (?, ?, ?, ?)',
      ['admin', 'Administrador', 'mastuerzo', 1]
    );
  }
}

// Rutas para usuarios
app.post('/api/login', async (req, res) => {
  try {
    const db = await dbPromise;
    const { email, password } = req.body;
    
    console.log('Intento de login:', { email, password }); // Para debugging
    
    const user = await db.get(
      'SELECT id, email, name, isAdmin FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    console.log('Usuario encontrado:', user); // Para debugging
    
    if (user) {
      res.json(user);
    } else {
      // Verificar si es el usuario admin por defecto
      if (email === 'admin' && password === 'mastuerzo') {
        const adminUser = {
          id: 1,
          email: 'admin',
          name: 'Administrador',
          isAdmin: true
        };
        res.json(adminUser);
      } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
      }
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas para tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const db = await dbPromise;
    const { userEmail, isAdmin } = req.query;
    
    console.log('Consultando tickets:', { userEmail, isAdmin }); // Debug
    
    let tickets;
    if (isAdmin === 'true') {
      tickets = await db.all('SELECT * FROM tickets ORDER BY id DESC');
      console.log('Tickets admin:', tickets.length); // Debug
    } else {
      tickets = await db.all(
        'SELECT * FROM tickets WHERE userEmail = ? ORDER BY id DESC',
        [userEmail]
      );
      console.log('Tickets usuario:', tickets.length); // Debug
    }
    
    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const db = await dbPromise;
  const ticket = req.body;
  
  const result = await db.run(`
    INSERT INTO tickets (
      idc, providerId, caseNumber, client, locationId,
      serviceDate, startTime, endTime, userId, userEmail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    ticket.idc, ticket.providerId, ticket.caseNumber,
    ticket.client, ticket.locationId, ticket.serviceDate,
    ticket.startTime, ticket.endTime, ticket.userId,
    ticket.userEmail
  ]);
  
  res.json({ id: result.lastID, ...ticket });
});

// Rutas para providers
app.get('/api/providers', async (req, res) => {
  const db = await dbPromise;
  const providers = await db.all('SELECT * FROM providers');
  res.json(providers);
});

app.post('/api/providers', async (req, res) => {
  const db = await dbPromise;
  const { name } = req.body;
  
  const result = await db.run(
    'INSERT INTO providers (name) VALUES (?)',
    [name]
  );
  
  const provider = await db.get(
    'SELECT * FROM providers WHERE id = ?',
    [result.lastID]
  );
  
  res.json(provider);
});

// Rutas para locations
app.get('/api/locations', async (req, res) => {
  const db = await dbPromise;
  const locations = await db.all('SELECT * FROM locations');
  res.json(locations);
});

app.post('/api/locations', async (req, res) => {
  const db = await dbPromise;
  const { name } = req.body;
  
  const result = await db.run(
    'INSERT INTO locations (name) VALUES (?)',
    [name]
  );
  
  const location = await db.get(
    'SELECT * FROM locations WHERE id = ?',
    [result.lastID]
  );
  
  res.json(location);
});

// Ruta para actualizar tickets
app.put('/api/tickets/:id', async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  const ticket = req.body;
  
  await db.run(`
    UPDATE tickets 
    SET idc = ?, providerId = ?, caseNumber = ?, 
        client = ?, locationId = ?, serviceDate = ?,
        startTime = ?, endTime = ?, userEmail = ?
    WHERE id = ?
  `, [
    ticket.idc, ticket.providerId, ticket.caseNumber,
    ticket.client, ticket.locationId, ticket.serviceDate,
    ticket.startTime, ticket.endTime, ticket.userEmail,
    id
  ]);
  
  const updatedTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
  res.json(updatedTicket);
});

// Ruta para eliminar tickets
app.delete('/api/tickets/:id', async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  
  await db.run('DELETE FROM tickets WHERE id = ?', [id]);
  res.json({ success: true });
});

// Rutas para usuarios
app.get('/api/users', async (req, res) => {
  const db = await dbPromise;
  const users = await db.all('SELECT * FROM users');
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const db = await dbPromise;
  const user = req.body;
  
  const result = await db.run(`
    INSERT INTO users (email, name, password, isAdmin)
    VALUES (?, ?, ?, ?)
  `, [user.email, user.name, user.password, user.isAdmin ? 1 : 0]);
  
  const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
  res.json(newUser);
});

app.put('/api/users/:id', async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  const updates = req.body;
  
  const setClause = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = [...Object.values(updates), id];
  
  await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values);
  
  const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  res.json(updatedUser);
});

app.delete('/api/users/:id', async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  
  await db.run('DELETE FROM users WHERE id = ?', [id]);
  res.json({ success: true });
});

// Ruta para eliminar proveedores
app.delete('/api/providers/:id', async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  
  try {
    await db.run('DELETE FROM providers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'No se puede eliminar el proveedor porque está en uso' });
  }
});

// Ruta para eliminar localidades
app.delete('/api/locations/:id', async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  
  try {
    await db.run('DELETE FROM locations WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'No se puede eliminar la localidad porque está en uso' });
  }
});

// Inicializar y arrancar servidor
initializeDatabase()
  .then(() => {
    console.log('Base de datos inicializada correctamente');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`API disponible en http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  });

// Corregir el manejador de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
  next(err);
}); 