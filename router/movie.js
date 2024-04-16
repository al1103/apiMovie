const express = require("express");
const router = express.Router();

const Movies = require("../controller/Movies");
router.get("/allmovie", Movies.getAllMovies);

router.get("/Search", Movies.SearchMovie);
router.get("/:slug", Movies.getOneMovie);

module.exports = router;
