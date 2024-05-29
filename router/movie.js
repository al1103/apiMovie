const express = require("express");
const router = express.Router();

const Movies = require("../controller/Movies");
router.get("/comments/:id", Movies.getComments);
router.get("/filter", Movies.FilterMovie);
router.get("/allmovie", Movies.getAllMovies);
router.get("/latestMovies", Movies.latestMovies);
router.get("/search", Movies.SearchMovie);
router.get("/:slug", Movies.getOneMovie);

module.exports = router;
