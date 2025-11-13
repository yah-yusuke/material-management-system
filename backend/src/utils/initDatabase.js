import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../data/inventory.db');

const db = new Database(dbPath);

// データベーススキーマ初期化
const initDatabase = () => {
  console.log('Initializing database...');

  // ユーザーテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 材料マスタテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      spec TEXT,
      unit TEXT NOT NULL,
      min_stock REAL NOT NULL,
      optimal_stock REAL,
      reorder_point REAL,
      lead_time_days INTEGER DEFAULT 7,
      warehouse TEXT,
      shelf_number TEXT,
      category TEXT,
      supplier_id INTEGER,
      unit_cost REAL,
      remarks TEXT,
      barcode TEXT,
      qr_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // 在庫テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      reserved_quantity REAL NOT NULL DEFAULT 0,
      available_quantity REAL GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES materials(id),
      UNIQUE(material_id)
    );
  `);

  // 入出庫トランザクションテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('in', 'out', 'adjust')),
      quantity REAL NOT NULL,
      balance REAL NOT NULL,
      date DATE NOT NULL,
      lot_number TEXT,
      supplier TEXT,
      destination TEXT,
      job_number TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (material_id) REFERENCES materials(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // 仕入先テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      lead_time_days INTEGER DEFAULT 7,
      rating INTEGER DEFAULT 5,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 発注テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER NOT NULL,
      order_date DATE NOT NULL,
      expected_delivery_date DATE,
      actual_delivery_date DATE,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'received', 'cancelled')),
      total_amount REAL,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // 発注明細テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL,
      total_price REAL,
      received_quantity REAL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES materials(id)
    );
  `);

  // アラートテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('low_stock', 'out_of_stock', 'reorder_point')),
      severity TEXT DEFAULT 'warning' CHECK(severity IN ('info', 'warning', 'critical')),
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES materials(id)
    );
  `);

  // 監査ログテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // インデックス作成
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_materials_code ON materials(code);
    CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_material ON transactions(material_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_material ON alerts(material_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read);
  `);

  console.log('Database initialized successfully!');
};

// サンプルデータ挿入
const insertSampleData = () => {
  console.log('Inserting sample data...');

  // サンプル仕入先
  const insertSupplier = db.prepare(`
    INSERT OR IGNORE INTO suppliers (code, name, contact_person, email, phone, lead_time_days)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertSupplier.run('SUP001', '鉄鋼商事株式会社', '田中太郎', 'tanaka@tekkoshouji.co.jp', '03-1234-5678', 5);
  insertSupplier.run('SUP002', 'ステンレス材料株式会社', '佐藤花子', 'sato@stainless.co.jp', '03-2345-6789', 7);
  insertSupplier.run('SUP003', 'アルミ加工センター', '鈴木一郎', 'suzuki@aluminum.co.jp', '03-3456-7890', 3);

  // サンプル材料
  const insertMaterial = db.prepare(`
    INSERT OR IGNORE INTO materials (code, name, spec, unit, min_stock, optimal_stock, reorder_point, warehouse, shelf_number, category, unit_cost, supplier_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMaterial.run('MAT-001', 'ステンレス棒材', 'SUS304 φ50×500L', '本', 10, 30, 15, '第1倉庫', 'A-01', '鋼材', 2500, 2);
  insertMaterial.run('MAT-002', '鉄板', 'SS400 t6×1000×2000', '枚', 5, 15, 8, '第1倉庫', 'B-03', '鋼材', 15000, 1);
  insertMaterial.run('MAT-003', 'アルミ角材', 'A5052 50×50×1000L', '本', 20, 50, 30, '第2倉庫', 'C-05', '非鉄金属', 1800, 3);
  insertMaterial.run('MAT-004', '真鍮丸棒', 'C3604 φ30×500L', '本', 15, 40, 20, '第2倉庫', 'D-02', '非鉄金属', 3200, 3);
  insertMaterial.run('MAT-005', 'ステンレス板', 'SUS304 t3×1000×2000', '枚', 8, 20, 10, '第1倉庫', 'B-05', '鋼材', 25000, 2);

  // サンプル在庫
  const insertInventory = db.prepare(`
    INSERT OR IGNORE INTO inventory (material_id, quantity)
    VALUES (?, ?)
  `);

  insertInventory.run(1, 25);
  insertInventory.run(2, 12);
  insertInventory.run(3, 45);
  insertInventory.run(4, 18);
  insertInventory.run(5, 6);

  console.log('Sample data inserted successfully!');
};

// データベース初期化実行
try {
  initDatabase();
  insertSampleData();
  db.close();
  console.log('Database setup complete!');
} catch (error) {
  console.error('Database initialization error:', error);
  process.exit(1);
}
