import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// 在庫一覧取得
router.get('/', (req, res) => {
  try {
    const { status, warehouse } = req.query;

    let query = `
      SELECT
        m.id, m.code, m.name, m.spec, m.unit,
        m.min_stock, m.optimal_stock, m.warehouse, m.shelf_number,
        i.quantity, i.available_quantity, i.reserved_quantity,
        CASE
          WHEN i.quantity = 0 THEN 'out-of-stock'
          WHEN i.quantity <= m.min_stock THEN 'low-stock'
          ELSE 'in-stock'
        END as status
      FROM materials m
      LEFT JOIN inventory i ON m.id = i.material_id
      WHERE 1=1
    `;

    const params = [];

    if (warehouse) {
      query += ' AND m.warehouse = ?';
      params.push(warehouse);
    }

    if (status === 'out-of-stock') {
      query += ' AND i.quantity = 0';
    } else if (status === 'low-stock') {
      query += ' AND i.quantity > 0 AND i.quantity <= m.min_stock';
    } else if (status === 'in-stock') {
      query += ' AND i.quantity > m.min_stock';
    }

    query += ' ORDER BY m.code';

    const inventory = db.prepare(query).all(...params);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

// 在庫数量更新（調整）
router.post('/adjust', (req, res) => {
  try {
    const { material_id, quantity, remarks } = req.body;

    const currentInventory = db.prepare('SELECT quantity FROM inventory WHERE material_id = ?').get(material_id);

    if (!currentInventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    const newQuantity = quantity;
    const difference = newQuantity - currentInventory.quantity;

    // トランザクション開始
    const transaction = db.transaction(() => {
      // 在庫更新
      db.prepare('UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE material_id = ?')
        .run(newQuantity, material_id);

      // トランザクション記録
      db.prepare(`
        INSERT INTO transactions (material_id, type, quantity, balance, date, remarks)
        VALUES (?, 'adjust', ?, ?, DATE('now'), ?)
      `).run(material_id, difference, newQuantity, remarks || '在庫調整');
    });

    transaction();

    // アラートチェック
    checkAndCreateAlerts(material_id);

    res.json({ message: '在庫を調整しました', new_quantity: newQuantity });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
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

  // 既存のアラートを削除
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
  } else if (material.reorder_point && material.quantity <= material.reorder_point) {
    db.prepare(`
      INSERT INTO alerts (material_id, type, severity, message)
      VALUES (?, 'reorder_point', 'info', ?)
    `).run(materialId, `${material.name}（${material.code}）が発注点に達しました`);
  }
}

export default router;
