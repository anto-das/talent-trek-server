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
    const JobsCollections = db.collection("jobs");
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    // save the job in DB
    app.post("/add-jobs", async(req,res) =>{
      const jobsData = req.body;
      const result = await JobsCollections.insertOne(jobsData)
      console.log(result)
      res.send(result)
    })
    // get all data from DB
    app.get("/jobs", async(req,res) =>{
      const result = await JobsCollections.find().toArray();
      res.send(result);
    })

    // get data category wise from DB
    app.get("/jobs/:category", async(req,res) =>{
      const category = req.params;
      const result =await JobsCollections.find(category).toArray()
      res.send(result)
    })

    // get data from DB using email
    app.get("/myJobs/:email", async(req,res) =>{
      const email = req.params.email;
      const query = ({'buyer.email':email})
      const result = await JobsCollections.find(query).toArray()
      res.send(result)
    })

    // get a data from db using id

    app.get('/job/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await JobsCollections.findOne(query)
      res.send(result)
    })

    // delete a document by id

    app.delete('/job/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await JobsCollections.deleteOne(query)
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
      const result = await JobsCollections.updateOne(filter,updatedDoc,options)
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
