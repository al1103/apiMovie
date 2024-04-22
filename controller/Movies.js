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

      res.status(200).json({
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
            console.log(movie.category);
            if (movie.category) {
              const movieCategoryArray = Object.values(movie.category);

              movieCategoryArray.forEach((category) => {
                Object.entries(category).reduce((acc, [type, value]) => {
                  if (type === "list") {
                    const modifiedCategories = value.map((obj) => obj.name);
                    console.log(value);
                    if (
                      modifiedCategories !== undefined &&
                      modifiedCategories.length > 0
                    ) {
                      result.push(modifiedCategories);
                      console.log(modifiedCategories);
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
}

module.exports = new Movies();
