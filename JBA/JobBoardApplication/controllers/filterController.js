const { MongoClient } = require('mongodb');
const url = require('url');

async function filterJobs(req, res, db) {
  try {
    // Parse the query parameters from the request URL
    const parsedUrl = url.parse(req.url, true);
    const { jobType, location, minSalary, maxSalary, page = 1, limit = 10 } = parsedUrl.query;

    // Construct the query object based on provided parameters
    const query = {};

    // Apply job type filter if provided
    if (jobType) {
      query.type = jobType;
    }

    // Apply location filter if provided
    if (location) {
      query.location = location;
    }

    // Apply salary range filter if minSalary or maxSalary is provided
    if (minSalary || maxSalary) {
      query.salary = {};  // Initialize salary filter as an empty object

      if (minSalary) {
        query.salary.$gte = parseInt(minSalary);
      }
      if (maxSalary) {
        query.salary.$lte = parseInt(maxSalary);
      }
    }

    // Debugging log to check the constructed query
    console.log("Constructed query with filters:", query);

    // Parse page number and page size for pagination
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    // Execute the query with pagination
    const jobs = await db.collection('jobs')
      .find(query)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Get the total count of matching documents for pagination info
    const totalJobs = await db.collection('jobs').countDocuments(query);
    const totalPages = Math.ceil(totalJobs / pageSize);

    // Construct response with jobs and pagination info
    const response = {
      jobs,
      pagination: {
        totalJobs,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    };

    // Send the response with status 200 and JSON data
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    // Log error and send error response if something goes wrong
    console.error('Error filtering jobs:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error filtering jobs' }));
  }
}

module.exports = { filterJobs };
