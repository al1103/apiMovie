const Movie = require("../models/movies");

class Movies {
  async getAllMovies(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query; // Destructuring for cleaner code

      // Input validation (optional but recommended)
      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid page or limit" });
      }

      const skip = (page - 1) * limit; // Calculate skip for efficient pagination
      const movies = await Movie.find({}, null, { skip, limit }); // Project only necessary fields

      res
        .status(200)
        .json({
          status: "success",
          page: parseInt(page),
          length: movies.length,
          data: movies,
        });
    } catch (err) {
      console.error(err); // Log the error for debugging
      next(err); // Pass the error to the next middleware for handling
    }
  }

  async getOneMovie(req, res, next) {
    try {
      const movie = await Movie.findOne({
        slug: req.params.slug,
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
  async SearchMovie(req, res, next) {
    try {
      // Extract search parameters with type checking (optional)
      const nameQuery = req.query.name?.trim(); // Assuming name is required, trim whitespaces
      const filters = req.query;

      // Build the search query with a base for name matching
      const searchQuery = { name: { $regex: nameQuery, $options: "i" } };

      // Add optional filters using a loop for cleaner structure
      const filterFields = [
        "category",
        "quality",
        "language",
        "year",
        "country",
      ];
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
}

module.exports = new Movies();
