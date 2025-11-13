import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// ルートのインポート
import materialsRouter from './routes/materials.js';
import inventoryRouter from './routes/inventory.js';
import transactionsRouter from './routes/transactions.js';
import suppliersRouter from './routes/suppliers.js';
import purchaseOrdersRouter from './routes/purchaseOrders.js';
import alertsRouter from './routes/alerts.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ログミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ルート
app.use('/api/auth', authRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/reports', reportsRouter);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`\n🚀 材料在庫管理システム API サーバー起動`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health\n`);
});

export default app;
