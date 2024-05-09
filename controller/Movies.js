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

  // async SearchMovie(req, res, next) {
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 10;
  //     const skip = (page - 1) * limit;
  //     const nameQuery = req.query.name ? req.query.name.trim() : "";
  //     const searchQuery = { slug: { $regex: nameQuery, $options: "i" } };
  //     const count = await MovieDetail.countDocuments(searchQuery);
  //     const totalPages = Math.ceil(count / limit);

  //     const categoryMap = {
  //       "hoat-hinh": "Hoạt Hình",
  //       "hanh-dong": "Hành Động",
  //       "tinh-cam": "Tình Cảm",
  //       "kinh-di": "Kinh Dị",
  //       "vien-tuong": "Viễn Tưởng",
  //       "hai-huoc": "Hài Hước",
  //       "phieu-luu": "Phiêu Lưu",
  //       "tam-ly": "Tâm Lý",
  //       "chien-tranh": "Chiến Tranh",
  //       "hoi-huong": "Hồi Hướng",
  //       "tv-show": "TV Show",
  //       "phim-le": "Phim Lẻ",
  //       "phim-bo": "Phim Bộ",
  //       "phim-chieu-rap": "Phim Chiếu Rạp",
  //       "phim-hai": "Phim Hài",
  //       "hinh-su": "Hình Sự",
  //     };

  //     if (req.query.category) {
  //       const categoryName = categoryMap[req.query.category.toLowerCase()];
  //       req.query.category = categoryName ? categoryName : req.query.category;
  //     }

  //     const originalAllowedFilters = {
  //       format: "Định dạng ",
  //       category: "Thể loại",
  //       year: "Năm",
  //       country: "Quốc gia",
  //     };

  //     const updatedQuery = {};
  //     if (req.query) {
  //       Object.keys(req.query).forEach((key) => {
  //         if (originalAllowedFilters.hasOwnProperty(key)) {
  //           updatedQuery[originalAllowedFilters[key]] = req.query[key];
  //         }
  //       });
  //     }
  //     var result = [];
  //     if (
  //       Object.keys(req.query).length === 1 &&
  //       req.query.hasOwnProperty("name")
  //     ) {
  //       const movies = await MovieDetail.find(searchQuery).skip(skip).limit(10);
  //       res.json({
  //         length: movies.length,
  //         status: "success",
  //         data: movies,
  //       });
  //     } else {
  //       const movies = await MovieDetail.find(searchQuery);

  //       var filteredMovies = movies;
  //       if (req.query.category) {
  //         const categoryArray = req.query.category.split(",");
  //         filteredMovies = filteredMovies.filter((movie) => {
  //           let shouldInclude = false;

  //           if (movie.category) {
  //             const MovieCategory = movie.category;
  //             const movieCategoryArray = Object.values(MovieCategory);

  //             movieCategoryArray.forEach((category) => {
  //               Object.entries(category).reduce((acc, [type, value]) => {
  //                 if (type === "list") {
  //                   const modifiedCategories = value.map((obj) => obj.name);

  //                   if (
  //                     modifiedCategories !== undefined &&
  //                     modifiedCategories.length > 0
  //                   ) {
  //                     result.push(modifiedCategories);

  //                     if (
  //                       categoryArray.some((element) =>
  //                         modifiedCategories.includes(element)
  //                       )
  //                     ) {
  //                       shouldInclude = true;
  //                     }
  //                   }
  //                 }
  //               }, {});
  //             });
  //           }

  //           return shouldInclude;
  //         });
  //       }

  //       if (req.query.year) {
  //         const yearArray = req.query.year.split(",");

  //         filteredMovies = filteredMovies.filter((movie) => {
  //           let shouldInclude = false;
  //           if (movie.category) {
  //             const movieCategoryArray = Object.values(movie.category);

  //             movieCategoryArray.forEach((category) => {
  //               Object.entries(category).reduce((acc, [type, value]) => {
  //                 if (type === "list") {
  //                   const modifiedCategories = value.map((obj) => obj.name);
  //                   if (
  //                     modifiedCategories !== undefined &&
  //                     modifiedCategories.length > 0
  //                   ) {
  //                     result.push(modifiedCategories);
  //                     if (
  //                       yearArray.some((element) =>
  //                         modifiedCategories.includes(element)
  //                       )
  //                     ) {
  //                       shouldInclude = true;
  //                     }
  //                   }
  //                 }
  //               }, {});
  //             });
  //           }

  //           return shouldInclude;
  //         });
  //         if (req.query.country) {
  //           const countryArray = req.query.country.split(",");

  //           filteredMovies = filteredMovies.filter((movie) => {
  //             let shouldInclude = false;

  //             if (movie.category) {
  //               const movieCategoryArray = Object.values(movie.category);

  //               movieCategoryArray.forEach((category) => {
  //                 Object.entries(category).reduce((acc, [type, value]) => {
  //                   if (type === "list") {
  //                     const modifiedCategories = value.map((obj) => obj.name);

  //                     if (
  //                       modifiedCategories !== undefined &&
  //                       modifiedCategories.length > 0
  //                     ) {
  //                       result.push(modifiedCategories);

  //                       // Kiểm tra nếu có ít nhất một phần tử trong yearArray tồn tại trong modifiedCategories
  //                       if (
  //                         countryArray.some((element) =>
  //                           modifiedCategories.includes(element)
  //                         )
  //                       ) {
  //                         shouldInclude = true;
  //                       }
  //                     }
  //                   }
  //                 }, {});
  //               });
  //             }

  //             return shouldInclude;
  //           });
  //         }
  //       }
  //       filteredMovies = filteredMovies.slice(skip, skip + limit);
  //     }

  //     res.json({
  //       length: filteredMovies.length,
  //       status: "success",
  //       data: filteredMovies,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async SearchMovie(req, res, next) {
    try {
      // const nameQuery = req.query.name ? req.query.name.trim() : "";
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 10;
      // const skip = (page - 1) * limit;
      // if (nameQuery === "") {
      //   const query = await MovieDetail.find(
      //     { $text: { $search: nameQuery } },
      //     { score: { $meta: "textScore" } } // Đẩy lên một cấp nhất, cặp key-value này là phần thứ hai của hàm find()
      //   )
      //     .sort({ score: { $meta: "textScore" } })
      //     .skip(skip)
      //     .limit(limit)
      //     .exec();

      //   const count = await MovieDetail.countDocuments({
      //     $text: { $search: nameQuery },
      //   });

      //   // Tính toán số trang và gửi kết quả
      //   const totalPages = Math.ceil(count / limit);
      //   res.json({
      //     status: "success",
      //     length: query.length,
      //     totalPages,
      //     data: query,
      //   });
      // } else {
      // console.log("nameQuery", nameQuery);
      // const categoryName = "Hành Động";

      const query = MovieDetail.find({
        category: {
          $elemMatch: {
            list: {
              $elemMatch: {
                name: {},
              },
            },
          },
        },
      });
      res.json({
        status: "success",
        length: query.length,
        data: query,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMovieCategory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      var numberSkip = 0;
      var quantityMovie = 1000;
      const skip = (page - 1) * limit;
      if (skip + limit >= quantityMovie) {
        quantityMovie += 100;
        numberSkip += 100;
      }
      var category = req.params.category;
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

      if (req.params.category) {
        var categoryName = categoryMap[req.params.category.toLowerCase()];
        category = categoryName ? categoryName : req.params.category;
      }

      const movies = await MovieDetail.find({})
        .skip(numberSkip)
        .limit(quantityMovie);
      var filteredMovies = movies;
      if (req.params.category) {
        let result = [];

        filteredMovies = filteredMovies.filter((movie) => {
          let shouldInclude = false;

          if (movie.category) {
            const movieCategory = movie.category[2];

            if (movieCategory && movieCategory.list) {
              result.push(movieCategory.list.map((obj) => obj.name));
              if (result.some((element) => element.includes(category))) {
                shouldInclude = true;
              }
            }
          }
          result = [];

          return shouldInclude;
        });
      }
      const dozens = Math.floor(filteredMovies.length / 10) + 1;
      const units = filteredMovies.length % 10;
      const shouldFetchAgain = page <= dozens && units < 5;

      if (shouldFetchAgain) {
        quantityMovie += 100;
        numberSkip += 100;
      }

      const updatedDozens = Math.floor(filteredMovies.length / 10) + 1;
      const updatedUnits = filteredMovies.length % 10;

      filteredMovies = filteredMovies.slice(skip, skip + limit);

      res.json({
        length: filteredMovies.length,
        status: "success",
        data: filteredMovies,
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
