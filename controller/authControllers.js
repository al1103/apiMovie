const Movie = require("../models/movies");
const jwt = require("jsonwebtoken");

class AuthController {

  async addMovie(req, res, next) {
    const movie = new Movie(req.body);
    try {
      const checkNameAlready = await Movie.findOne({ name: req.body.name });
      if (checkNameAlready) {
        return res.status(409).json({ message: "Tên phim đã tồn tại" });
      }

      const checkSlugAlready = await Movie.findOne({ slug: req.body.slug });
      if (checkSlugAlready) {
        return res.status(409).json({ message: "Slug đã tồn tại" });
      }

      await movie.save();
      res.status(201).json({ message: "Phim đã được tạo thành công" });
    } catch (error) {
      next(error);
    }
  }

  async editMovie(req, res, next) {
    try {
      await Movie.updateOne({ slug: req.params.slug }, req.body).then(() =>
        res.json({ message: "Phim đã được cập nhật" })
      );
    } catch (error) {
      next(error);
    }
  }


 
  async listMovie(req, res) {
    try {
      const currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;

      // Lấy dữ liệu cho trang hiện tại
      const skip = (currentPage - 1) * perPage;
      const movies = await Movie.find({}).skip(skip).limit(perPage);

      // Đếm tổng số items
      const totalMovies = await Movie.countDocuments();

      // Xác định có truyền query hay không
      const hasQuery = Object.keys(req.query).length > 0;

      // Tạo response
      let response;
      if (hasQuery) {
        // Có query, trả về movies và totalPage
        const totalPage = Math.ceil(totalMovies / perPage);
        response = { movies, currentPage, totalPage };
      } else {
        // Không có query, chỉ trả về totalMovies
        response = { totalMovies };
      }

      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deleteMovie(req, res) {
    try {
      const result = await Movie.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Phim không tồn tại" });
      }
      res.json({ message: "Phim đã được xóa" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }
  async UpdateMovie(req, res) {
    try {
      const result = await Movie.updateOne({ _id: req.params.id }, req.body);
      if (result.nModified === 0) {
        return res.status(404).json({ message: "Phim không tồn tại" });
      }
      res.json({ message: "Phim đã được cập nhật" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }
 
}
module.exports = new AuthController();
