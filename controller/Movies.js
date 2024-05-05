const Movie = require("../models/movies");
const MovieDetail = require("../models/moviedetails");
const Package = require("../models/PackageDefault"); // Import Package model

class Movies {
  async index(req, res, next) {
    // Tạo các gói dịch vụ trong cơ sở dữ liệu
    try {
      // Tạo gói dịch vụ basic
      await Package.create({
        name: "Basic",
        price: 0, // Giả sử giá của gói basic là 10 đơn vị tiền tệ
        subscriptionPlan: "basic",
        subscriptionExpiration: null, // Giả sử gói basic có thời hạn 30 ngày
      });

      // Tạo gói dịch vụ premium
      await Package.create({
        name: "Premium",
        price: 7, // Giả sử giá của gói premium là 20 đơn vị tiền tệ
        subscriptionPlan: "premium",
        subscriptionExpiration: 7, // Giả sử gói premium có thời hạn 30 ngày
      });
      await Package.create({
        name: "Premium",
        price: 30,
        subscriptionPlan: "premium",
        subscriptionExpiration: 30,
      });
      await Package.create({
        name: "Premium",
        price: 365,
        subscriptionPlan: "premium",
        subscriptionExpiration: 365,
      });
    } catch (error) {
      console.error("Error creating packages:", error);
    }
  }

  async getOneFilm(req, res, next) {
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
  async getComments(req, res, next) {
    try {
      const movieId = req.params.id;

      // Find the movie and populate comments with user data efficiently
      const movie = await Movie.findById(movieId).populate("comments");
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      const comments = await Comment.find({
        _id: { $in: movie.comments },
      }).populate("User", "username avatar");
      res
        .status(200)
        .json({ status: "success", length: comments.length, comments });
    } catch (error) {
      console.error("Error getting comments:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }

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
      const movies = await MovieDetail.find().skip(skip).limit(limit);
      res.json({
        status: "success",
        length: movies.length,
        results: movies,
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
      const movie = await Movie.findOne({
        slug: req.params.slug,
      });
      if (!movie) {
        return res.status(404).json({ message: "Không tìm thấy phim" });
      }
      res.json({ status: "success", movie });
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
      const searchQuery = { slug: { $regex: nameQuery, $options: "i" } };
      const count = await MovieDetail.countDocuments(searchQuery);
      const totalPages = Math.ceil(count / limit);

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

      if (req.query.category) {
        const categoryName = categoryMap[req.query.category.toLowerCase()];
        req.query.category = categoryName ? categoryName : req.query.category;
      }

      const originalAllowedFilters = {
        format: "Định dạng ",
        category: "Thể loại",
        year: "Năm",
        country: "Quốc gia",
      };

      const updatedQuery = {};
      if (req.query) {
        Object.keys(req.query).forEach((key) => {
          if (originalAllowedFilters.hasOwnProperty(key)) {
            updatedQuery[originalAllowedFilters[key]] = req.query[key];
          }
        });
      }
      var result = [];
      if (
        Object.keys(req.query).length === 1 &&
        req.query.hasOwnProperty("name")
      ) {
        const movies = await MovieDetail.find(searchQuery).skip(skip).limit(10);
        res.json({
          length: movies.length,
          status: "success",
          results: movies,
        });
      } else {
        const movies = await MovieDetail.find(searchQuery);

        var filteredMovies = movies;
        if (req.query.category) {
          const categoryArray = req.query.category.split(",");
          filteredMovies = filteredMovies.filter((movie) => {
            let shouldInclude = false;

            if (movie.category) {
              const MovieCategory = movie.category;
              const movieCategoryArray = Object.values(MovieCategory);

              movieCategoryArray.forEach((category) => {
                Object.entries(category).reduce((acc, [type, value]) => {
                  if (type === "list") {
                    const modifiedCategories = value.map((obj) => obj.name);

                    if (
                      modifiedCategories !== undefined &&
                      modifiedCategories.length > 0
                    ) {
                      result.push(modifiedCategories);

                      if (
                        categoryArray.some((element) =>
                          modifiedCategories.includes(element)
                        )
                      ) {
                        shouldInclude = true;
                      }
                    }
                  }
                }, {});
              });
            }

            return shouldInclude;
          });
        }

        if (req.query.year) {
          const yearArray = req.query.year.split(",");

          filteredMovies = filteredMovies.filter((movie) => {
            let shouldInclude = false;
            if (movie.category) {
              const movieCategoryArray = Object.values(movie.category);

              movieCategoryArray.forEach((category) => {
                Object.entries(category).reduce((acc, [type, value]) => {
                  if (type === "list") {
                    const modifiedCategories = value.map((obj) => obj.name);
                    if (
                      modifiedCategories !== undefined &&
                      modifiedCategories.length > 0
                    ) {
                      result.push(modifiedCategories);
                      if (
                        yearArray.some((element) =>
                          modifiedCategories.includes(element)
                        )
                      ) {
                        shouldInclude = true;
                      }
                    }
                  }
                }, {});
              });
            }

            return shouldInclude;
          });
          if (req.query.country) {
            const countryArray = req.query.country.split(",");

            filteredMovies = filteredMovies.filter((movie) => {
              let shouldInclude = false;

              if (movie.category) {
                const movieCategoryArray = Object.values(movie.category);

                movieCategoryArray.forEach((category) => {
                  Object.entries(category).reduce((acc, [type, value]) => {
                    if (type === "list") {
                      const modifiedCategories = value.map((obj) => obj.name);

                      if (
                        modifiedCategories !== undefined &&
                        modifiedCategories.length > 0
                      ) {
                        result.push(modifiedCategories);

                        // Kiểm tra nếu có ít nhất một phần tử trong yearArray tồn tại trong modifiedCategories
                        if (
                          countryArray.some((element) =>
                            modifiedCategories.includes(element)
                          )
                        ) {
                          shouldInclude = true;
                        }
                      }
                    }
                  }, {});
                });
              }

              return shouldInclude;
            });
          }
        }
        filteredMovies = filteredMovies.slice(skip, skip + limit);
      }

      res.json({
        length: filteredMovies.length,
        status: "success",
        results: filteredMovies,
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
        results: filteredMovies,
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
        results: movies,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Movies();
