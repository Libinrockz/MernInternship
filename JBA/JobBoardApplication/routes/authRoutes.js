// routes/authRoutes.js
const { signup, login } = require('../controllers/authController');

async function authRoutes(req, res) {
  if (req.url === '/auth/signup' && req.method === 'POST') {
    await signup(req, res);
  } else if (req.url === '/auth/login' && req.method === 'POST') {
    await login(req, res);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
}

module.exports = authRoutes;
