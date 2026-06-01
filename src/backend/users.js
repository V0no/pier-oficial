const express = require('express');

function createUsersRouter(pool) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 9));
    const offset = (page - 1) * limit;

    try {
      const countResult = await pool.query('SELECT COUNT(*) AS total FROM "user"');
      const total = parseInt(countResult.rows[0].total);

      const result = await pool.query(
        `SELECT id, name, email, role, ultimo_ping, esta_online
         FROM "user"
         ORDER BY id
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const users = result.rows.map(row => ({
        id:          row.id,
        operatorId:  row.id,
        name:        row.name || row.email.split('@')[0],
        email:       row.email,
        role:        row.role,
        last_login:  row.ultimo_ping
          ? new Date(row.ultimo_ping).toLocaleString('pt-BR')
          : 'Nunca',
        status:      row.esta_online ? 'Online' : 'Offline',
        avatarUrl:   null,
      }));

      return res.json({ users, total, page, limit });
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  });

  return router;
}

module.exports = { createUsersRouter };