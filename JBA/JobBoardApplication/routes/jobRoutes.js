const { createJob, getJobs, updateJob, deleteJob } = require('../controllers/jobController');
const {filterJobs} = require('../controllers/filterController')

async function jobRoutes(req, res, db) {
  const urlParts = req.url.split('/');
  const jobId = urlParts[2]; // Extract jobId from the URL path (for PUT and DELETE requests)

  // Handle POST request to create a new job
  if (req.method === 'POST' && req.url === '/job') {
    await createJob(req, res, db);
  } 
  // Handle GET request to fetch all jobs
  else if (req.method === 'GET' && req.url === '/jobs') {
    req.db = db;  // Attach the database to the request object for controllers
    await getJobs(req, res);
  } 
  // Handle PUT request to update a job (by jobId)
  else if (req.method === 'PUT' && req.url.startsWith('/job/') && jobId) {
    req.params = { id: jobId };
    await updateJob(req, res, db);
  } 
  // Handle DELETE request to delete a job (by jobId)
  else if (req.method === 'DELETE' && req.url.startsWith('/job/') && jobId) {
    req.params = { id: jobId };
    await deleteJob(req, res, db);
  } 
  else if (req.url.startsWith('/jobs/filter') && req.method === 'GET') {
    await filterJobs(req, res, db);  // Apply filter logic)
  }
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
}

module.exports = jobRoutes;
