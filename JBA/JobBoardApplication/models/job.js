const { MongoClient } = require('mongodb');

async function createJob() {
  const uri = 'mongodb+srv://libinrockz21:1xFjv02guDFARAoQ@faith.l9ehq.mongodb.net/jobBoardDB?retryWrites=true&w=majority&appName=faith';
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('jobBoardDB');
    const jobs = db.collection('jobs');

    // Example job data to insert (this can be dynamic)
    const newJob = {
      title: "Software Engineer",
      company: "Tech Corp",
      location: "New York, NY",
      salary: 100000,
      type: "Full-time", // You can validate that this is either Full-time or Part-time
      description: "Develop software applications.",
      status: "Active", // Validate this as "Active" or "Inactive"
      createdAt: new Date() // MongoDB automatically handles Date objects
    };

    // Insert the new job into the collection
    const result = await jobs.insertOne(newJob);
    
    console.log("Job created successfully:", result);
  } finally {
    await client.close();
  }
}

createJob().catch(console.error);
