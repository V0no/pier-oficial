const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { createLoginRouter } = require('./login');
const { createUsersRouter } = require('./users');
const { createDronesRouter } = require('./drones');
const { createDetectionsRouter } = require('./detections');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

app.use('/auth', createLoginRouter(pool));
app.use('/users', createUsersRouter(pool));
app.use('/drones', createDronesRouter(pool));
app.use('/detections', createDetectionsRouter(pool));

app.get('/', (_req, res) => {
  res.json({
    message: 'Pier Surveillance API is running',
  });
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'online', db: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'online', db: 'disconnected' });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'online', db: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'online', db: 'disconnected' });
  }
});

app.get('/api/drones', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name_drone,
        model_drone,
        status_drone,
        battery,
        signal
      FROM drone
      ORDER BY id ASC
    `);

    const drones = result.rows.map((drone) => ({
      id: drone.id,
      name: drone.name_drone,
      model: drone.model_drone,
      status: drone.status_drone,
      battery: drone.battery,
      signal: drone.signal,
    }));

    res.json(drones);
  } catch (error) {
    console.error('Erro ao buscar drones:', error);
    res.status(500).json({
      error: 'Erro ao buscar drones',
    });
  }
});

app.get('/api/operators', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        role,
        esta_online
      FROM "user"
      ORDER BY id ASC
    `);

    const operators = result.rows.map((operator) => {
      const email = operator.email || '';
      const name =
        operator.name ||
        (email ? email.split('@')[0] : `Usuário ${operator.id}`);

      return {
        id: operator.id,
        name,
        email,
        role: operator.role,
        isOnline: operator.esta_online,
        initial: name.charAt(0).toUpperCase(),
      };
    });

    res.json(operators);
  } catch (error) {
    console.error('Erro ao buscar operadores:', error);
    res.status(500).json({
      error: 'Erro ao buscar operadores',
    });
  }
});

app.get('/api/assignments', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        da.id,
        da.user_id,
        da.drone_id,
        da.assigned_at,
        da.unassigned_at,
        da.is_active,

        u.name AS user_name,
        u.email,
        u.role,
        u.esta_online,

        d.name_drone,
        d.model_drone,
        d.status_drone,
        d.battery,
        d.signal
      FROM drone_assignment da
      JOIN "user" u ON u.id = da.user_id
      JOIN drone d ON d.id = da.drone_id
      ORDER BY da.assigned_at DESC
      LIMIT 10
    `);

    const assignments = result.rows.map((assignment) => {
      const email = assignment.email || '';
      const operatorName =
        assignment.user_name ||
        (email ? email.split('@')[0] : `Usuário ${assignment.user_id}`);

      return {
        id: assignment.id,

        droneId: assignment.drone_id,
        droneName: assignment.name_drone,
        droneModel: assignment.model_drone,
        droneStatus: assignment.status_drone,
        droneBattery: assignment.battery,
        droneSignal: assignment.signal,

        operatorId: assignment.user_id,
        operatorName,
        operatorInitial: operatorName.charAt(0).toUpperCase(),
        operatorRole: assignment.role,
        operatorIsOnline: assignment.esta_online,

        assignedAt: assignment.assigned_at,
        unassignedAt: assignment.unassigned_at,
        isActive: assignment.is_active,
      };
    });

    res.json(assignments);
  } catch (error) {
    console.error('Erro ao buscar atribuições:', error);
    res.status(500).json({
      error: 'Erro ao buscar atribuições',
    });
  }
});

app.post('/api/assignments', async (req, res) => {
  const { userId, droneId } = req.body;

  if (!userId || !droneId) {
    return res.status(400).json({
      error: 'userId e droneId são obrigatórios',
    });
  }

  try {
    const activeAssignment = await pool.query(
      `
      SELECT id
      FROM drone_assignment
      WHERE drone_id = $1
        AND is_active = true
      LIMIT 1
      `,
      [droneId]
    );

    if (activeAssignment.rows.length > 0) {
      return res.status(409).json({
        error: 'Este drone já possui uma atribuição ativa',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO drone_assignment (
        user_id,
        drone_id,
        assigned_at,
        is_active
      )
      VALUES ($1, $2, NOW(), true)
      RETURNING id, user_id, drone_id, assigned_at, is_active
      `,
      [userId, droneId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar atribuição:', error);
    res.status(500).json({
      error: 'Erro ao criar atribuição',
    });
  }
});

app.patch('/api/assignments/:id/unassign', async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const result = await pool.query(
      `
      UPDATE drone_assignment
      SET
        is_active = false,
        unassigned_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, drone_id, assigned_at, unassigned_at, is_active
      `,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Atribuição não encontrada',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao desatribuir drone:', error);
    res.status(500).json({
      error: 'Erro ao desatribuir drone',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});