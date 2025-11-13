import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name').all();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { code, name, contact_person, email, phone, address, lead_time_days, remarks } = req.body;
    const result = db.prepare(`
      INSERT INTO suppliers (code, name, contact_person, email, phone, address, lead_time_days, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(code, name, contact_person, email, phone, address, lead_time_days, remarks);
    res.status(201).json({ id: result.lastInsertRowid, message: '仕入先を登録しました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
