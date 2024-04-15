const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const router = require("./router");
require("dotenv").config();
const app = express();
const uri = process.env.PORT || 4000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("sample_mflix").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("combined"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());

router(app);
