const express = require('express');
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 9000
const app = express()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hojma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hojma.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const db = client.db("TalentTrekDB");
    const jobsCollections = db.collection("jobs");
    const bidsCollections = db.collection("applicants");
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    // save the job in DB
    app.post("/add-jobs", async(req,res) =>{
      const jobsData = req.body;
      const result = await jobsCollections.insertOne(jobsData)
      console.log(result)
      res.send(result)
    })
    // get all data from DB
    app.get("/jobs", async(req,res) =>{
      const result = await jobsCollections.find().toArray();
      res.send(result);
    })

    // get data category wise from DB
    app.get("/jobs/:category", async(req,res) =>{
      const category = req.params;
      const result =await jobsCollections.find(category).toArray()
      res.send(result)
    })

    // get data from DB using email
    app.get("/myJobs/:email", async(req,res) =>{
      const email = req.params.email;
      const query = ({'buyer.email':email})
      const result = await jobsCollections.find(query).toArray()
      res.send(result)
    })

    // get a data from db using id

    app.get('/job/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await jobsCollections.findOne(query)
      res.send(result)
    })

    // delete a document by id

    app.delete('/job/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobsCollections.deleteOne(query)
      res.send(result)
    })

    // put data in db with updated version

    app.put("/job-update/:id", async(req,res) =>{
      const id = req.params.id;
      const formData = req.body;
      const filter = {_id: new ObjectId(id)}
      const options ={upsert:true}
      const updatedDoc = {
        $set:formData
      }
      const result = await jobsCollections.updateOne(filter,updatedDoc,options)
      res.send(result)
    })

    // save job bid in DB
    app.post('/add-bids', async(req,res)=>{
      // 1. check whether this user is here or not.
      const query ={email:req.body.email, jobId:req.body.jobId}
      const userAlreadyExist = await bidsCollections.findOne(query)
      if(userAlreadyExist){
        return res
        .status(400)
        .send('you have already a bid in this job')
      }
      // 2.save data in bids collections
      const bidData = req.body;
      const result = await bidsCollections.insertOne(bidData)
      // 3.increase bids count job collections
      const filter ={_id: new ObjectId(bidData.jobId)}
      const updatedDoc={
        $inc:{bid_counts:1},
      }
      const updateBidCount = await jobsCollections.updateOne(filter,updatedDoc)
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
