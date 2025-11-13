import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// 全材料取得
router.get('/', (req, res) => {
  try {
    const { category, warehouse, search } = req.query;

    let query = `
      SELECT m.*,
             i.quantity as current_stock,
             i.available_quantity,
             s.name as supplier_name
      FROM materials m
      LEFT JOIN inventory i ON m.id = i.material_id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE 1=1
    `;

    const params = [];

    if (category) {
      query += ' AND m.category = ?';
      params.push(category);
    }

    if (warehouse) {
      query += ' AND m.warehouse = ?';
      params.push(warehouse);
    }

    if (search) {
      query += ' AND (m.code LIKE ? OR m.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY m.code';

    const materials = db.prepare(query).all(...params);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: error.message });
  }
});

// 材料詳細取得
router.get('/:id', (req, res) => {
  try {
    const material = db.prepare(`
      SELECT m.*,
             i.quantity as current_stock,
             i.available_quantity,
             s.name as supplier_name,
             s.lead_time_days as supplier_lead_time
      FROM materials m
      LEFT JOIN inventory i ON m.id = i.material_id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE m.id = ?
    `).get(req.params.id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: error.message });
  }
});

// 材料登録
router.post('/', (req, res) => {
  try {
    const {
      code, name, spec, unit, min_stock, optimal_stock, reorder_point,
      lead_time_days, warehouse, shelf_number, category, supplier_id,
      unit_cost, remarks, barcode
    } = req.body;

    const result = db.prepare(`
      INSERT INTO materials (
        code, name, spec, unit, min_stock, optimal_stock, reorder_point,
        lead_time_days, warehouse, shelf_number, category, supplier_id,
        unit_cost, remarks, barcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      code, name, spec, unit, min_stock, optimal_stock, reorder_point,
      lead_time_days, warehouse, shelf_number, category, supplier_id,
      unit_cost, remarks, barcode
    );

    // 在庫レコードを初期化
    db.prepare(`
      INSERT INTO inventory (material_id, quantity) VALUES (?, 0)
    `).run(result.lastInsertRowid);

    res.status(201).json({ id: result.lastInsertRowid, message: '材料を登録しました' });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: error.message });
  }
});

// 材料更新
router.put('/:id', (req, res) => {
  try {
    const {
      name, spec, unit, min_stock, optimal_stock, reorder_point,
      lead_time_days, warehouse, shelf_number, category, supplier_id,
      unit_cost, remarks, barcode
    } = req.body;

    const result = db.prepare(`
      UPDATE materials SET
        name = ?, spec = ?, unit = ?, min_stock = ?, optimal_stock = ?,
        reorder_point = ?, lead_time_days = ?, warehouse = ?, shelf_number = ?,
        category = ?, supplier_id = ?, unit_cost = ?, remarks = ?, barcode = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, spec, unit, min_stock, optimal_stock, reorder_point,
      lead_time_days, warehouse, shelf_number, category, supplier_id,
      unit_cost, remarks, barcode, req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: '材料を更新しました' });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: error.message });
  }
});

// 材料削除
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM materials WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: '材料を削除しました' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: error.message });
  }
});

// カテゴリー一覧取得
router.get('/meta/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category FROM materials WHERE category IS NOT NULL ORDER BY category
    `).all();
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
