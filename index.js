const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const router = require("./router");
const bodyParser = require("body-parser");
const UserController = require("./controller/usersController");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000; // Sử dụng PORT được cung cấp hoặc mặc định là 4000

const uri = process.env.MONGODB_URI; // Sử dụng URI của MongoDB từ biến môi trường

mongoose.set("strictQuery", true);

async function connect() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Connection to MongoDB failed:", error.message);
    process.exit(1); // Exit with failure
  }
}

connect();

app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("combined"));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cors());


router(app);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(uri);
});
