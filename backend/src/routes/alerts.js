import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const alerts = db.prepare(`
      SELECT a.*, m.code as material_code, m.name as material_name
      FROM alerts a
      JOIN materials m ON a.material_id = m.id
      WHERE a.is_read = 0
      ORDER BY a.severity DESC, a.created_at DESC
    `).all();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'アラートを既読にしました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
