// models/userModel.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://libinrockz21:1xFjv02guDFARAoQ@faith.l9ehq.mongodb.net/JobBoardApplication?retryWrites=true&w=majority&appName=faith';
const client = new MongoClient(uri);
const dbName = 'jobBoardDB';

async function getUserCollection() {
  await client.connect();
  const db = client.db(dbName);
  return db.collection('users');
}

// Register a new user
async function registerUser(userData) {
  const collection = await getUserCollection();
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user object with `username`
  const user = { email: userData.email, password: hashedPassword, username: userData.username };
  await collection.insertOne(user);
  return user;
}

// Find a user by email
async function findUserByEmail(email) {
  const collection = await getUserCollection();
  return collection.findOne({ email });
}

module.exports = { registerUser, findUserByEmail };
