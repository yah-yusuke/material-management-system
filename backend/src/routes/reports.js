import express from 'express';
import db from '../utils/database.js';

const router = express.Router();

// ABC分析
router.get('/abc-analysis', (req, res) => {
  try {
    const { period_days = 90 } = req.query;

    const analysis = db.prepare(`
      WITH material_usage AS (
        SELECT
          m.id, m.code, m.name, m.unit, m.unit_cost,
          SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END) as total_usage,
          SUM(CASE WHEN t.type = 'out' THEN t.quantity * COALESCE(m.unit_cost, 0) ELSE 0 END) as total_value
        FROM materials m
        LEFT JOIN transactions t ON m.id = t.material_id
        WHERE t.date >= DATE('now', '-' || ? || ' days')
        GROUP BY m.id
      ),
      ranked_materials AS (
        SELECT *,
          SUM(total_value) OVER () as grand_total,
          SUM(total_value) OVER (ORDER BY total_value DESC) as cumulative_value
        FROM material_usage
        WHERE total_value > 0
      )
      SELECT
        id, code, name, unit, total_usage, total_value,
        ROUND(total_value * 100.0 / grand_total, 2) as value_percentage,
        ROUND(cumulative_value * 100.0 / grand_total, 2) as cumulative_percentage,
        CASE
          WHEN cumulative_value * 100.0 / grand_total <= 70 THEN 'A'
          WHEN cumulative_value * 100.0 / grand_total <= 90 THEN 'B'
          ELSE 'C'
        END as abc_class
      FROM ranked_materials
      ORDER BY total_value DESC
    `).all(period_days);

    res.json(analysis);
  } catch (error) {
    console.error('Error in ABC analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// 在庫回転率
router.get('/turnover-rate', (req, res) => {
  try {
    const { period_days = 30 } = req.query;

    const turnover = db.prepare(`
      SELECT
        m.id, m.code, m.name, m.unit,
        i.quantity as current_stock,
        AVG(i.quantity) as avg_stock,
        SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END) as total_shipped,
        CASE
          WHEN AVG(i.quantity) > 0
          THEN ROUND(SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END) / AVG(i.quantity), 2)
          ELSE 0
        END as turnover_rate,
        CASE
          WHEN SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END) > 0
          THEN ROUND(AVG(i.quantity) * ? / SUM(CASE WHEN t.type = 'out' THEN t.quantity ELSE 0 END), 1)
          ELSE 0
        END as days_of_inventory
      FROM materials m
      LEFT JOIN inventory i ON m.id = i.material_id
      LEFT JOIN transactions t ON m.id = t.material_id
        AND t.date >= DATE('now', '-' || ? || ' days')
      GROUP BY m.id
      HAVING total_shipped > 0
      ORDER BY turnover_rate DESC
    `).all(period_days, period_days);

    res.json(turnover);
  } catch (error) {
    console.error('Error calculating turnover rate:', error);
    res.status(500).json({ error: error.message });
  }
});

// 発注推奨リスト
router.get('/reorder-suggestions', (req, res) => {
  try {
    const suggestions = db.prepare(`
      SELECT
        m.id, m.code, m.name, m.unit, m.min_stock, m.optimal_stock,
        m.reorder_point, m.lead_time_days, m.unit_cost,
        i.quantity as current_stock, i.available_quantity,
        s.name as supplier_name, s.lead_time_days as supplier_lead_time,
        COALESCE(m.optimal_stock - i.quantity, m.min_stock * 2) as suggested_order_quantity,
        CASE
          WHEN i.quantity = 0 THEN 'urgent'
          WHEN i.quantity <= m.min_stock THEN 'high'
          WHEN m.reorder_point IS NOT NULL AND i.quantity <= m.reorder_point THEN 'medium'
          ELSE 'low'
        END as priority
      FROM materials m
      LEFT JOIN inventory i ON m.id = i.material_id
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE i.quantity <= COALESCE(m.reorder_point, m.min_stock)
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        i.quantity ASC
    `).all();

    res.json(suggestions);
  } catch (error) {
    console.error('Error generating reorder suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ダッシュボード統計
router.get('/dashboard', (req, res) => {
  try {
    const stats = {
      total_materials: db.prepare('SELECT COUNT(*) as count FROM materials').get().count,
      low_stock_count: db.prepare(`
        SELECT COUNT(*) as count FROM materials m
        JOIN inventory i ON m.id = i.material_id
        WHERE i.quantity > 0 AND i.quantity <= m.min_stock
      `).get().count,
      out_of_stock_count: db.prepare(`
        SELECT COUNT(*) as count FROM materials m
        JOIN inventory i ON m.id = i.material_id
        WHERE i.quantity = 0
      `).get().count,
      total_inventory_value: db.prepare(`
        SELECT ROUND(SUM(i.quantity * COALESCE(m.unit_cost, 0)), 2) as value
        FROM inventory i
        JOIN materials m ON i.material_id = m.id
      `).get().value || 0,
      transactions_today: db.prepare(`
        SELECT COUNT(*) as count FROM transactions
        WHERE DATE(date) = DATE('now')
      `).get().count,
      pending_orders: db.prepare(`
        SELECT COUNT(*) as count FROM purchase_orders
        WHERE status = 'pending'
      `).get().count
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
