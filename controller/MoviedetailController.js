const MovieDetailService = require('../models/moviedetails'); // Assuming MovieDetailService is a function

class MovieDetailController {
  async getOneMovie(req, res) {
    try {
      const slug = req.params.slug;

      // Assuming MovieDetailService.findOne returns a Promise
      const movieDetail = await MovieDetailService.find({slug:slug});

      if (!movieDetail) {
        return res.status(404).json({ message: 'Movie not found' }); // Handle not found case
      }

      res.status(200).json(movieDetail);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new MovieDetailController();  // Use module.exports for multiple exports
