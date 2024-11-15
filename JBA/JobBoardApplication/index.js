const http = require('http');
const { MongoClient } = require('mongodb');
const url = require('url');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

// MongoDB connection string
const uri = 'mongodb+srv://libinrockz21:1xFjv02guDFARAoQ@faith.l9ehq.mongodb.net/JobBoardApplication?retryWrites=true&w=majority&appName=faith';

let db;

async function connectDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db('jobBoardDB');  
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

connectDB().then(() => {
  const server = http.createServer(async (req, res) => {
    // Set CORS headers for every request
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');  // Adjust this for production
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests (OPTIONS)
    if (req.method === 'OPTIONS') {
      res.writeHead(204); // No Content
      return res.end();
    }

    res.setHeader('Content-Type', 'application/json');

    try {
      // Parse URL and query parameters
      const parsedUrl = url.parse(req.url, true);
      req.path = parsedUrl.pathname;
      req.query = parsedUrl.query;

      // Authentication routes
      if (req.path.startsWith('/auth')) {
        await authRoutes(req, res, db);
      } 
      // Job-related routes
      else if (req.path.startsWith('/job') || req.path.startsWith('/jobs')) {
        await jobRoutes(req, res, db);
      } 
      // Route not found
      else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Route not found' }));
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
