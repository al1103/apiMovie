const User = require("../models/users_model");
const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const jwt = require("jsonwebtoken");

class AuthController {
  async createPost(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = jwt.verify(token, "zilong-zhou"); // Add type assertion for clarity

      if (!token) {
        return res.status(401).json({
          status: "fail",
          message: "Unauthorized - Missing token",
        });
      }

      const id = decoded.userId;
      const newBlog = new Blogs({
        ...req.body,
        authorId: id, // Use the userId from the decoded token
      });

      await newBlog.save(); // Await the save operation and get the result

      res.status(201).json({
        status: 200,
        message: "Blog created successfully",
      });
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
  async deleteBlog(req, res) {
    try {
      const data = await Blogs.deleteOne({ slug: req.params.slug });
      if (data.deletedCount === 0) {
        return res.status(404).json({ message: "không tồn tại" });
      }
      res.json({ status: 200, message: "đã được xóa" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    } 
  }
  async UpdateBlog(req, res) {
    try {
      const data = await Blogs.updateOne({ _id: req.params.id }, req.body);
      if (data.nModified === 0) {
        return res.status(404).json({ message: "không tồn tại" });
      }
      res.json({ status: 200, message: "đã được cập nhật" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }
  async getOneBlogAdmin(req, res) {
    try {
      const id = req.params.id;

      const BlogDetail = await Blogs.find({ _id: id });
      console.log(BlogDetail);

      if (!BlogDetail) {
        return res.status(404).json({ message: "Blog not found" }); // Handle not found case
      }

      res.status(200).json({
        status: 200,
        data: BlogDetail,
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
          status: 200,
          users,
          currentPage,
          totalPage,
        });
      } else {
        return res.json({
          status: 200,
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
        status: 200,
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

module.exports = new AuthController();
