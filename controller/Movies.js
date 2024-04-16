const Movie = require("../models/movies");
const MovieDetail = require("../models/moviedetails");

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
  async  SearchMovie(req, res, next) {
    try {
      // Extract search parameters with type checking (optional)
      const nameQuery = req.query.name?.trim(); // Assuming name is required, trim whitespaces
  
      // Validate required parameters (if applicable)
      if (!nameQuery) {
        return res.status(400).json({ message: "Missing required parameter: 'name'" });
      }
  
      // Sanitize user input (consider using a library like validator.js)
  
      // Build the search query with a base for name matching, using regular expression for case-insensitivity
      const searchQuery = { slug: { $regex:nameQuery , $options: "i" } };
  
      // Add optional filters using destructuring for clarity and potential type checking
      const { category, quality, language, year, country } = req.query;
      if (category) searchQuery.category = category;
      if (quality) searchQuery.quality = quality;
      if (language) searchQuery.language = language;
      if (year) {
        // Validate year format (optional)
        if (isNaN(year) || year.length !== 4) {
          return res.status(400).json({ message: "Invalid year format. Use YYYY." });
        }
        searchQuery.year = year;
      }
      if (country) searchQuery.country = country;
  
      console.log(searchQuery); // For debugging
  
      // Execute the search with MongoDB's `find` method
      const results = await MovieDetail.find(searchQuery);
  
      // Send successful response with informative status message
      res.json({ status: "success", message: "Movies found successfully!", results });
    } catch (error) {
      console.error(error); // Log the error for debugging
      next(error); // Pass the error to the error handler middleware
    }
  }
  
}

module.exports = new Movies();
