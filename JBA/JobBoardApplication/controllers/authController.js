// controllers/authController.js
const jwt = require('jsonwebtoken');
const { registerUser, findUserByEmail } = require('../models/userModel');
const bcrypt = require('bcryptjs');
const secretKey = 'your_jwt_secret_key';  // Replace with an env variable in production

// User signup
// Updated User signup
async function signup(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { email, password, username } = JSON.parse(body);

    // Ensure all fields are provided
    if (!email || !password || !username) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Email, password, and username are required' }));
    }

    try {
      const existingUser = await findUserByEmail(email);

      // Check if user already exists
      if (existingUser) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'User already exists' }));
      }

      // Register the new user
      const user = await registerUser({ email, password, username });

      res.statusCode = 201;
      res.end(JSON.stringify({ message: 'User registered successfully', user: { email, username } }));
    } catch (error) {
      console.error('Error during signup:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to register user' }));
    }
  });
}

// User login
async function login(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { email, password } = JSON.parse(body);
    if (!email || !password) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Email and password are required' }));
    }

    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Invalid email or password' }));
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Login successful', token }));
  });
}


module.exports = { signup, login };
