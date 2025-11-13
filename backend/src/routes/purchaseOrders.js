import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// 発注一覧取得
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.order_date DESC
    `).all();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 発注作成
router.post('/', (req, res) => {
  try {
    const { order_number, supplier_id, order_date, expected_delivery_date, items, remarks } = req.body;

    const transaction = db.transaction(() => {
      const orderResult = db.prepare(`
        INSERT INTO purchase_orders (order_number, supplier_id, order_date, expected_delivery_date, remarks)
        VALUES (?, ?, ?, ?, ?)
      `).run(order_number, supplier_id, order_date, expected_delivery_date, remarks);

      const orderId = orderResult.lastInsertRowid;

      items.forEach(item => {
        db.prepare(`
          INSERT INTO purchase_order_items (order_id, material_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?)
        `).run(orderId, item.material_id, item.quantity, item.unit_price, item.total_price);
      });

      return orderId;
    });

    const orderId = transaction();
    res.status(201).json({ id: orderId, message: '発注を作成しました' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
