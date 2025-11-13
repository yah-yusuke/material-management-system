import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../utils/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(username, email, passwordHash, role);

    res.status(201).json({
      id: result.lastInsertRowid,
      username,
      email,
      role,
      message: 'ユーザーを登録しました'
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'ユーザー名またはメールアドレスが既に使用されています' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
