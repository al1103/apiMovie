const express = require('express');
const router = express.Router();
const MovieDetail = require("../controller/MoviedetailController"); 



router.get("/:slug", MovieDetail.getOneMovie);


module.exports = router;