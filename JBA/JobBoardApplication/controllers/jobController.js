const { ObjectId } = require('mongodb');

// Utility to parse JSON body from request
async function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

// Create a job posting
async function createJob(req, res, db) {
  try {
    const jobData = await parseRequestBody(req);

    console.log('Received job data:', jobData);

    const { title, company, location, salary, type, description, status } = jobData;

    if (!title || !company || !location || !salary || !type || !description || !status) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'All fields are required' }));
      return;
    }

    const jobsCollection = db.collection('jobs');
    const newJob = { title, company, location, salary, type, description, status };

    console.log('Inserting job:', newJob);

    const result = await jobsCollection.insertOne(newJob);

    if (result.acknowledged) {
      // Set the newly created job's ID in the response
      newJob._id = result.insertedId;

      res.statusCode = 201;
      res.end(JSON.stringify({
        message: 'Job created successfully',
        job: newJob  // Return the job details
      }));
    } else {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to insert job into database' }));
    }
  } catch (error) {
    console.error('Error creating job:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to create job' }));
  }
}



async function getJobs(req, res) {
  try {
    const jobsCollection = req.db.collection('jobs');  // Access the jobs collection
    const jobs = await jobsCollection.find().toArray();  // Retrieve all jobs
    
    res.statusCode = 200;
    res.end(JSON.stringify(jobs));  // Respond with the job listings in JSON format
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to fetch jobs' }));
  }
}


// Update a job posting
async function updateJob(req, res, db) {
  try {
    const jobId = req.params.id;
    const jobData = await parseRequestBody(req);

    const jobsCollection = db.collection('jobs');
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: jobData }
    );

    if (result.matchedCount === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Job not found' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Job updated successfully', jobId, updatedData: jobData }));
  } catch (error) {
    console.error('Error updating job:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to update job' }));
  }
}

// Delete a job posting
async function deleteJob(req, res, db) {
  try {
    const jobId = req.params.id;
    const jobsCollection = db.collection('jobs');
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(jobId) });

    if (result.deletedCount === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Job not found' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Job deleted successfully'}));
  } catch (error) {
    console.error('Error deleting job:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to delete job' }));
  }
}

module.exports = { createJob, getJobs, updateJob, deleteJob };
