import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// 全トランザクション取得
router.get('/', (req, res) => {
  try {
    const { material_id, type, date_from, date_to, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT t.*, m.code as material_code, m.name as material_name, m.unit
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      WHERE 1=1
    `;

    const params = [];

    if (material_id) {
      query += ' AND t.material_id = ?';
      params.push(material_id);
    }

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (date_from) {
      query += ' AND t.date >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND t.date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// 入庫登録
router.post('/receive', (req, res) => {
  try {
    const { material_id, quantity, date, lot_number, supplier, remarks } = req.body;

    const transaction = db.transaction(() => {
      // 現在の在庫取得
      const inventory = db.prepare('SELECT quantity FROM inventory WHERE material_id = ?').get(material_id);

      const newQuantity = inventory.quantity + parseFloat(quantity);

      // 在庫更新
      db.prepare('UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE material_id = ?')
        .run(newQuantity, material_id);

      // トランザクション記録
      const result = db.prepare(`
        INSERT INTO transactions (material_id, type, quantity, balance, date, lot_number, supplier, remarks)
        VALUES (?, 'in', ?, ?, ?, ?, ?, ?)
      `).run(material_id, parseFloat(quantity), newQuantity, date || new Date().toISOString().split('T')[0], lot_number, supplier, remarks);

      return result.lastInsertRowid;
    });

    const transactionId = transaction();

    // アラートチェック
    checkAndCreateAlerts(material_id);

    res.status(201).json({ id: transactionId, message: '入庫を登録しました' });
  } catch (error) {
    console.error('Error receiving material:', error);
    res.status(500).json({ error: error.message });
  }
});

// 出庫登録
router.post('/ship', (req, res) => {
  try {
    const { material_id, quantity, date, destination, job_number, remarks } = req.body;

    const transaction = db.transaction(() => {
      // 現在の在庫取得
      const inventory = db.prepare('SELECT quantity, available_quantity FROM inventory WHERE material_id = ?').get(material_id);

      if (inventory.available_quantity < parseFloat(quantity)) {
        throw new Error('在庫が不足しています');
      }

      const newQuantity = inventory.quantity - parseFloat(quantity);

      // 在庫更新
      db.prepare('UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE material_id = ?')
        .run(newQuantity, material_id);

      // トランザクション記録
      const result = db.prepare(`
        INSERT INTO transactions (material_id, type, quantity, balance, date, destination, job_number, remarks)
        VALUES (?, 'out', ?, ?, ?, ?, ?, ?)
      `).run(material_id, parseFloat(quantity), newQuantity, date || new Date().toISOString().split('T')[0], destination, job_number, remarks);

      return result.lastInsertRowid;
    });

    const transactionId = transaction();

    // アラートチェック
    checkAndCreateAlerts(material_id);

    res.status(201).json({ id: transactionId, message: '出庫を登録しました' });
  } catch (error) {
    console.error('Error shipping material:', error);
    res.status(500).json({ error: error.message });
  }
});

// アラート生成関数
function checkAndCreateAlerts(materialId) {
  const material = db.prepare(`
    SELECT m.*, i.quantity
    FROM materials m
    LEFT JOIN inventory i ON m.id = i.material_id
    WHERE m.id = ?
  `).get(materialId);

  if (!material) return;

  db.prepare('DELETE FROM alerts WHERE material_id = ? AND is_read = 0').run(materialId);

  if (material.quantity === 0) {
    db.prepare(`
      INSERT INTO alerts (material_id, type, severity, message)
      VALUES (?, 'out_of_stock', 'critical', ?)
    `).run(materialId, `${material.name}（${material.code}）が在庫切れです`);
  } else if (material.quantity <= material.min_stock) {
    db.prepare(`
      INSERT INTO alerts (material_id, type, severity, message)
      VALUES (?, 'low_stock', 'warning', ?)
    `).run(materialId, `${material.name}（${material.code}）の在庫が最低在庫数を下回っています（現在: ${material.quantity}${material.unit}）`);
  }
}

export default router;
