const Movie = require("../models/movies");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer"); //
const User = require("../models/users_model");
const MovieDetailService = require("../models/moviedetails");
const Comment = require("../models/Comment");

class AuthController {
  async addMovie(req, res, next) {
    const categoryGroup = req.body.category;

    const list = categoryGroup.map((category) => {
      return { name: category };
    });
    console.log(list);
    const category = {
      1: {
        group: {
          name: "Định dạng",
        },
        list: [
          {
            name: "Phim lẻ",
          },
        ],
      },
      2: {
        group: {
          name: "Thể loại",
        },
        list: list,
      },
      3: {
        group: {
          name: "Năm",
        },
        list: [
          {
            name: "2002",
          },
        ],
      },
      4: {
        group: {
          name: "Quốc gia",
        },
        list: [
          {
            name: "Mỹ",
          },
        ],
      },
    };

    req.body.category = category;
    const movie = new MovieDetailService(req.body);
    try {
      const existingMovie = await MovieDetailService.findOne({
        $or: [{ name: req.body.name }, { slug: req.body.slug }],
      });
      if (existingMovie) {
        return res
          .status(409)
          .json({ message: "Tên phim hoặc slug đã tồn tại" });
      }

      await movie.save();
      if (list.map((category) => category.name).includes("kinh dị")) {
        const usersOver18 = await User.aggregate([
          { $match: { age: { $gte: 18 } } }, // Filter users over 18
          { $project: { email: 1 } }, // Extract only email field
        ]);

        const emailList = usersOver18.map((user) => user.email).join(","); // Use map to extract emails
        const mailOptions = {
          from: "Zilong",
          to: emailList, // Use individual email from the list
          subject: "Phim Mới Đã Có!",
          html: `
              <p>Có phim mới thuộc thể loại kinh dị đã được thêm vào hệ thống: ${movie.name}</p>
              <p>Xem phim tại: http://localhost:3000/movie/${movie.slug}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
      }

      res.status(201).json({
        status: "success",
        message: "Phim đã được tạo thành công",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMovie(req, res) {
    try {
      const data = await MovieDetailService.deleteOne({ _id: req.params.id });
      if (data.deletedCount === 0) {
        return res.status(404).json({ message: "Phim không tồn tại" });
      }
      res.json({ status: "success", message: "Phim đã được xóa" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }
  async UpdateMovie(req, res) {
    try {
      const data = await MovieDetailService.updateOne(
        { _id: req.params.id },
        req.body
      );
      if (data.nModified === 0) {
        return res.status(404).json({ message: "Phim không tồn tại" });
      }
      res.json({ status: "success", message: "Phim đã được cập nhật" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }
  async getOneMovieAdmin(req, res) {
    try {
      const id = req.params.id;

      const movieDetail = await MovieDetailService.find({ _id: id });
      console.log(movieDetail);

      if (!movieDetail) {
        return res.status(404).json({ message: "Movie not found" }); // Handle not found case
      }

      res.status(200).json({
        status: "success",
        data: movieDetail,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async getListUsers(req, res) {
    try {
      const currentPage = parseInt(req.query.page) || 1;
      const perPage = 8;

      const skip = (currentPage - 1) * perPage + 1;

      if (currentPage < 1) {
        return res.status(400).json({ error: "Invalid page number" });
      }

      const users = await User.find({}).skip(skip).limit(perPage);
      const totalUsers = await User.countDocuments();
      const totalPage = Math.ceil(totalUsers / perPage);
      const hasQuery = Object.keys(req.query).length > 0;

      if (hasQuery) {
        return res.json({
          status: "success",
          users,
          currentPage,
          totalPage,
        });
      } else {
        return res.json({
          status: "success",
          totalUsers: totalUsers,
          data: users,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "An error occurred." }); // More specific message
    }
  }

  async getComments(req, res) {
    try {
      const comments = await Comment.find({ User: req.params.id });

      if (!comments) {
        return res.status(404).json({ message: "User chưa từng comment" });
      }

      // Return the user's comments
      res.json({
        status: "success",
        data: comments,
      });
    } catch (error) {
      console.error(error);
      if (error.name === "CastError") {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
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
