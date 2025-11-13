import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'inventory.db');

// データディレクトリを作成
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// データベース接続
const db = new Database(dbPath);

// WALモードを有効化（パフォーマンス向上）
db.pragma('journal_mode = WAL');

// 外部キー制約を有効化
db.pragma('foreign_keys = ON');

export default db;
