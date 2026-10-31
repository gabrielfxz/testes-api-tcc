const express = require('express');
const jwt = require('jsonwebtoken');
const jsonDb = require('../utils/jsonDb');

const router = express.Router();

const DB_FILE = 'users_challenge1.json';

const JWT_SECRET = 'super_secret_key_hardcoded_12345';

const DEFAULT_USERS = [
  {
    id: 1,
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Administrador'
  }
];

function getUsers() {
  return jsonDb.readData(DB_FILE, DEFAULT_USERS);
}

function saveUsers(users) {
  jsonDb.writeData(DB_FILE, users);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

/**
 * POST /register
 */
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, password, name.' });
  }

  const users = getUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'E-mail já cadastrado.' });
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    email,
    password,
    name
  };

  users.push(newUser);
  saveUsers(users);

  return res.status(201).json({
    message: 'Usuário registrado com sucesso.',
    user: { id: newUser.id, email: newUser.email, name: newUser.name }
  });
});

/**
 * POST /login
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, password.' });
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json({
    message: 'Login realizado com sucesso.',
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

/**
 * GET /profile
 */
router.get('/profile', authMiddleware, (req, res) => {
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    password: user.password
  });
});

module.exports = router;
