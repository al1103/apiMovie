const Movie = require("../models/movies");

class Movies {
  async getAllMovies(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await Movie.find({}).limit(limit);
      res.status(200).json({ status: "success", length: data.length, data });
    } catch (err) {
      next(err);
    }
  }
  async getOneMovie(req, res, next) {
    try {
      const movie = await Movie.findOne({
        _id: req.params.slug,
      });
      if (!movie) {
        return res.status(404).json({ message: "Phim không có" });
      } else {
        res.json({ status: "success", length: movie.length, movie });
      }
    } catch (error) {
      next(error);
    }
  }
  async  SearchMovie(req, res, next) {
    try {
      // Extract search parameters with type checking (optional)
      const nameQuery = req.query.name?.trim(); // Assuming name is required, trim whitespaces
      const filters = req.query;
  
      // Build the search query with a base for name matching
      const searchQuery = { name: { $regex: nameQuery, $options: "i" } };
  
      // Add optional filters using a loop for cleaner structure
      const filterFields = ["category", "quality", "language", "year", "country"];
      for (const field of filterFields) {
        if (filters[field]) {
          searchQuery[field] = filters[field];
        }
      }
  
      // Execute the search
      const results = await Movie.find(searchQuery);
  
      // Send successful response
      res.json({ status: "success", results });
    } catch (error) {
      next(error);
    }
  }
  
  async index (req, res) {
    const movies = await Movie.find({});
    res.json({ status: "success", length: movies.length, movies });
  }
}

module.exports = new Movies();
