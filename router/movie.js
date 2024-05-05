const express = require("express");
const router = express.Router();

const Movies = require("../controller/Movies");
router.get("/filter/:category", Movies.getMovieCategory);
router.get("/allmovie", Movies.getAllMovies);
router.get("/latestMovies", Movies.latestMovies);
router.get("/Search", Movies.SearchMovie);
router.get("/:slug", Movies.getOneMovie);

module.exports = router;
