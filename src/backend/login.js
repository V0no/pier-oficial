const express = require('express');

function createLoginRouter(pool) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { email, senha } = req.body || {};

    if (!email || !senha) {
      return res.json({ authenticated: false });
    }

    try {
      const query = `
        SELECT password
        FROM "user"
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `;

      const values = [String(email).trim()];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.json({ authenticated: false });
      }

      const senhaSalva = String(result.rows[0].password ?? '');
      const authenticated = senhaSalva === String(senha);

      return res.json({ authenticated });
    } catch (error) {
      console.error('Erro ao validar login:', error);
      return res.status(500).json({ authenticated: false });
    }
  });

  return router;
}

module.exports = { createLoginRouter };
