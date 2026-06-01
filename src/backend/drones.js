const express = require('express');

function createDronesRouter(pool) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
    const offset = (page - 1) * limit;

    try {
      const countResult = await pool.query('SELECT COUNT(*) AS total FROM drone');
      const total = parseInt(countResult.rows[0].total);

      const result = await pool.query(
        `SELECT
           d.id,
           d.name_drone   AS name,
           d.model_drone  AS model,
           d.status_drone AS status,
           d.battery,
           d.signal,
           d.base,
           d.image_url    AS "imageUrl",
           u.email        AS operator
         FROM drone d
         LEFT JOIN drone_assignment da
           ON da.drone_id = d.id AND da.is_active = TRUE
         LEFT JOIN "user" u ON u.id = da.user_id
         ORDER BY d.id
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return res.json({ drones: result.rows, total, page, limit });
    } catch (err) {
      console.error('Erro ao buscar drones:', err);
      return res.status(500).json({ error: 'Erro ao buscar drones' });
    }
  });

  return router;
}

module.exports = { createDronesRouter };