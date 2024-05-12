const Movie = require("../models/movies");
const MovieDetail = require("../models/moviedetails");
const Package = require("../models/PackageDefault"); // Import Package model
const Comment = require("../models/Comment");

class Movies {
  async index(req, res, next) {}

  // async getComments(req, res, next) {
  //   try {
  //     const movieId = req.params.id;

  //     const movie = await Movie.findById(movieId).populate("comments");
  //     if (!movie) {
  //       return res.status(404).json({ message: "Movie not found" });
  //     }
  //     if (!movie) {
  //       return res.status(404).json({ message: "Movie not found" });
  //     }
  //     const comments = await Comment.find({
  //       _id: { $in: movie.comments },
  //     }).populate("User", "username avatar");
  //     res
  //       .status(200)
  //       .json({ status: "success", length: comments.length, comments });
  //   } catch (error) {
  //     console.error("Error getting comments:", error.message);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // }

  async getAllMovies(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Calculate skip based on valid page and limit
      const skip = (page - 1) * limit;

      // Get total count of movies
      const count = await MovieDetail.countDocuments();

      // Calculate total pages (ensure at least one page)
      const totalPages = Math.ceil(Math.max(count, 1) / limit);

      // Find movies with pagination
      // const TotalMovie = (await Movie.find()).length;
      const movies = await MovieDetail.find()
        .sort({ _id: -1 }) // Sắp xếp theo _id theo thứ tự giảm dần (từ cuối lên đầu)
        .skip(skip)
        .limit(limit);

      res.json({
        status: "success",
        length: movies.length,
        data: movies,
        // TotalMovie: TotalMovie,
        totalPages, // Include totalPages in the response
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" }); // Generic error message
    }
  }

  async getOneMovie(req, res, next) {
    try {
      const movie = await MovieDetail.findOne({
        slug: req.params.slug,
      });
      if (!movie) {
        return res.status(404).json({ message: "Không tìm thấy phim" });
      }
      res.json({ status: "success", data: movie });
    } catch (error) {
      next(error);
    }
  }

  async SearchMovie(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const nameQuery = req.query.name ? req.query.name.trim() : "";

      // Lọc phim theo tên
      let movies = await MovieDetail.find(
        { $text: { $search: nameQuery } },
        { score: { $meta: "textScore" } }
      )
        .skip(skip)
        .limit(limit);

      // Lọc lại theo thể loại nếu có
      if (req.query.category) {
        const categoryMap = {
          "hoat-hinh": "Hoạt Hình",
          "hanh-dong": "Hành Động",
          "tinh-cam": "Tình Cảm",
          "kinh-di": "Kinh Dị",
          "vien-tuong": "Viễn Tưởng",
          "hai-huoc": "Hài Hước",
          "phieu-luu": "Phiêu Lưu",
          "tam-ly": "Tâm Lý",
          "chien-tranh": "Chiến Tranh",
          "hoi-huong": "Hồi Hướng",
          "tv-show": "TV Show",
          "phim-le": "Phim Lẻ",
          "phim-bo": "Phim Bộ",
          "phim-chieu-rap": "Phim Chiếu Rạp",
          "phim-hai": "Phim Hài",
          "hinh-su": "Hình Sự",
        };
        const normalizedCategory = req.query.category.toLowerCase();
        const categoryName =
          categoryMap[normalizedCategory] || normalizedCategory;

        // Lọc lại kết quả theo thể loại
        const pipeline = [
          { $project: { category: { $objectToArray: "$category" } } },
          { $unwind: "$category" },
          { $unwind: "$category.v.list" },
          { $match: { "category.v.list.name": categoryName } },
          { $project: { _id: 1, title: 1 } },
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit },
        ];

        movies = await MovieDetail.aggregate(pipeline).then((movies) =>
          MovieDetail.populate(movies, { path: "_id" })
        );
        const newMovie = []
  
        movies.forEach(movie => {
          newMovie.push(movie._id)
        })
        movies = newMovie
      }

      res.json({
        length: movies.length,
        status: "success",
        data: movies,
      });
    } catch (error) {
      next(error);
    }
  }

  async FilterMovie(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      const categoryMap = {
        "hoat-hinh": "Hoạt Hình",
        "hanh-dong": "Hành Động",
        "tinh-cam": "Tình Cảm",
        "kinh-di": "Kinh Dị",
        "vien-tuong": "Viễn Tưởng",
        "hai-huoc": "Hài Hước",
        "phieu-luu": "Phiêu Lưu",
        "tam-ly": "Tâm Lý",
        "chien-tranh": "Chiến Tranh",
        "hoi-huong": "Hồi Hướng",
        "tv-show": "TV Show",
        "phim-le": "Phim Lẻ",
        "phim-bo": "Phim Bộ",
        "phim-chieu-rap": "Phim Chiếu Rạp",
        "phim-hai": "Phim Hài",
        "hinh-su": "Hình Sự",
      };

      let actionMovies;

      if (req.query.category) {
        const categoryQuery = req.query.category.toLowerCase();
        const categoryName = categoryMap[categoryQuery] || categoryQuery;
        const pipeline = [
          { $project: { category: { $objectToArray: "$category" } } },
          { $unwind: "$category" },
          { $unwind: "$category.v.list" },
          { $match: { "category.v.list.name": categoryName } },
          { $project: { _id: 1, title: 1 } },
          { $sort: { _id: -1 } },
          { $skip: skip },
          { $limit: limit },
        ];

        actionMovies = await MovieDetail.aggregate(pipeline).then((movies) =>
          MovieDetail.populate(movies, { path: "_id" })
        );
      }

      res.json({
        status: "success",
        length: actionMovies.length,
        page,
        data: actionMovies,
      });
    } catch (error) {
      next(error);
    }
  }

  async latestMovies(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const count = await MovieDetail.countDocuments();
      const totalPages = Math.ceil(count / limit);
      const movies = await MovieDetail.find()
        .sort({ modified: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        status: "success",
        length: movies.length,
        data: movies,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }
  async getComments(req, res, next) {
    try {
      const id = req.params.id;
      const comments = await Comment.find({ movieId: id }).populate("User");
      if (!comments || comments.length === 0) {
        return res
          .status(404)
          .json({ message: "No comments found for this movie" }); // Trả về thông báo lỗi phù hợp nếu không có bình luận nào
      }
      res.status(200).json({
        status: "success",
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Movies();
