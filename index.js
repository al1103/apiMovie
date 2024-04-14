const express = require('express');
const methodOverride = require('method-override'); // Notice correct spelling
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://phamtuan72az:1JLluHBFWpYed7em@zilong.sz4jqlp.mongodb.net/?retryWrites=true&w=majority&appName=zilong";
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const port = 4000;
const config = require('./db');
const router = require('./router'); // Assuming router exports a function



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cors()); // Add semicolon here

// Register routes from the imported router
router(app);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
