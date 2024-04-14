const express = require('express');
const methodOverride = require('method-override'); // Notice correct spelling
const path = require('path');

const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const port = 4000;
const config = require('./db');
const router = require('./router'); // Assuming router exports a function

async function connect() {
  try {
    await mongoose.connect(config.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Connection to MongoDB failed:", error.message);
  }
}

connect();

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
