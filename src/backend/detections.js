const express = require('express');

function createDetectionsRouter(pool) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 14));
    const offset = (page - 1) * limit;

    try {
      const countResult = await pool.query('SELECT COUNT(*) AS total FROM detection');
      const total = parseInt(countResult.rows[0].total);

      const result = await pool.query(
        `SELECT
           det.id,
           det.image_url,
           det.has_match,
           det.detected_at,
           det.latitude,
           det.longitude,
           v.license_plate,
           v.vehicle_model,
           v.vehicle_brand
         FROM detection det
         JOIN vehicle v ON v.id = det.vehicle_id
         ORDER BY det.detected_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const detections = result.rows.map(row => {
        const dt = new Date(row.detected_at);
        return {
          id:       row.id,
          photoUrl: row.image_url || null,
          carModel: `${row.vehicle_brand} ${row.vehicle_model} — ${row.license_plate}`,
          time:     dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date:     dt.toLocaleDateString('pt-BR'),
          location: `${Number(row.latitude).toFixed(4)}, ${Number(row.longitude).toFixed(4)}`,
          status:   row.has_match ? 'ALERTA' : 'VERIFICADO',
        };
      });

      return res.json({ detections, total, page, limit });
    } catch (err) {
      console.error('Erro ao buscar detecções:', err);
      return res.status(500).json({ error: 'Erro ao buscar detecções' });
    }
  });

  return router;
}

module.exports = { createDetectionsRouter };