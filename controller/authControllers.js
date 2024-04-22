const Movie = require("../models/movies");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer"); //
class AuthController {
  async addMovie(req, res, next) {
    const movie = new Movie(req.body);
    try {
      const existingMovie = await Movie.findOne({
        $or: [{ name: req.body.name }, { slug: req.body.slug }],
      });
      if (existingMovie) {
        return res
          .status(409)
          .json({ message: "Tên phim hoặc slug đã tồn tại" });
      }

      await movie.save();

      // Send email to users over 18 if movie is R-rated
      if (movie.category === "hoat-hinh") {
        const usersOver18 = await User.aggregate([
          { $match: { age: { $gte: 18 } } }, // Filter users over 18
          { $project: { email: 1 } }, // Extract only email field
        ]);

        // Extract email addresses from the results
        const emailList = usersOver18.map((user) => user.email).join(","); // Use map to extract emails

        // Send emails to each user using a loop
        const mailOptions = {
          from: "Zilong",
          to: emailList, // Use individual email from the list
          subject: "Phim Mới Đã Có!",
          html: `
              <p>Có phim mới thuộc thể loại 18+ đã được thêm vào hệ thống: ${movie.name}</p>
              <p>Xem phim tại: http://localhost:3000/movie/${movie.slug}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
      }

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
  async pushMovie(req, res) {
    // Find the user by email (remove redundant ".email")
  }
  catch(err) {
    console.error("Failed to send password reset email:", err);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "phamtuan72az@gmail.com",
    pass: "fljm hapz doac rtzu",
  },
});

module.exports = new AuthController();
