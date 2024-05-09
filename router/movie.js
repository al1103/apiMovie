const express = require("express");
const router = express.Router();

const Movies = require("../controller/Movies");
router.get("/comments/:id", Movies.getComments);
router.get("/filter/:category", Movies.getMovieCategory);
router.get("/allmovie", Movies.getAllMovies);
router.get("/latestMovies", Movies.latestMovies);
router.get("/Search", Movies.SearchMovie);
router.get("/:slug", Movies.getOneMovie);
// router.get("/", Movies);


module.exports = router;
