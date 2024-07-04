const User = require("../models/users_model");
const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const jwt = require("jsonwebtoken");
const BlogPost = require("../models/PostCategories");
const category = require("../models/category");
const PostCategories = require("../models/PostCategories");
const client = require("../models/client");
class AuthController {
  async createPost(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          status: "fail",
          message: "Unauthorized - Missing token",
        });
      }

      const token = authHeader.split(" ")[1];
      let decoded;

      try {
        decoded = jwt.verify(token, "zilong-zhou");
      } catch (err) {
        return res.status(401).json({
          status: "fail",
          message: "Unauthorized - Invalid token",
        });
      }
      const checkSlug = await Blogs.findOne({ slug: req.body.slug });
      if (checkSlug) {
        return res.status(400).json({
          status: "fail",
          message: "Slug already exists",
        });
      }
      const checkTitle = await Blogs.findOne({ title: req.body.title });
      if (checkTitle) {
        return res.status(400).json({
          status: "fail",
          message: "Title already exists",
        });
      }
      const userId = decoded.userId;
      const newBlog = new Blogs({
        ...req.body,
        authorId: userId,
      });

      await newBlog.validate();

      await newBlog.save();

      const categoryIds = req.body.category;
      if (!categoryIds) {
        return res.status(400).json({
          status: "fail",
          message: "Category should be an array of IDs",
        });
      }

      const newBlogPost = new PostCategories({
        postId: newBlog._id,
        categoryIds: categoryIds,
      });
      await newBlogPost.save();
      res.status(201).json({
        status: "201",
        message: "Blog created successfully",
      });
    } catch (error) {
      next(error);
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
      const { slug } = req.params;
      const update = req.body;

      const originalBlog = await Blogs.findOne({ slug: slug });
      if (!originalBlog) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      const updatedBlog = await Blogs.findOneAndUpdate({ slug: slug }, update, {
        new: true,
      });

      if (!updatedBlog) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      if (update.category) {
        await PostCategories.findOneAndUpdate(
          { postId: updatedBlog._id },
          { categoryIds: update.category },
          { new: true }
        );

        console.log("Updated categories for blog post:", updatedBlog._id);
      }

      res
        .status(200)
        .json({ message: "Bài viết đã được cập nhật", updatedBlog });
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }

  async getOneBlogAdmin(req, res) {
    try {
      const id = req.params.id;

      const BlogDetail = await Blogs.find({ _id: id });
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

      const skip = (currentPage - 1) * perPage;

      if (currentPage < 1) {
        return res.status(400).json({ error: "Invalid page number" });
      }

      const users = await client.find({}).skip(skip).limit(perPage);
      const totalUsers = await client.countDocuments();
      const totalPage = Math.ceil(totalUsers / perPage);

      res.json({
        data: {
          status: 200,
          totalUsers: totalUsers,
          users: users,
          currentPage,
          totalPage,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "An error occurred." });
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
