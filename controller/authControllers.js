const User = require("../models/users_model");
const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const client = require("../models/client");
const album = require("../models/album");
const Banner = require("../models/Banner");
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

      const {
        title,
        slug,
        categoryId,
        content,
        featured,
        description,
        thumbnail,
      } = req.body;

      // Check if slug exists
      const checkSlug = await Blogs.findOne({ slug });
      if (checkSlug) {
        return res.status(400).json({
          status: "fail",
          message: "Slug đã tồn tại",
        });
      }

      // Check if title exists
      const checkTitle = await Blogs.findOne({ title });
      if (checkTitle) {
        return res.status(400).json({
          status: "fail",
          message: "Tiêu đề đã tồn tại",
        });
      }

      // Check if category exists
      const categoryDoc = await Category.findById(categoryId);
      if (!categoryDoc) {
        return res.status(400).json({
          status: "fail",
          message: "Category không tồn tại",
        });
      }

      const userId = decoded.userId;

      const newBlog = new Blogs({
        title,
        slug,
        categoryId,
        description,
        content,
        thumbnail,
        featured: featured || false,
        authorId: userId,
      });

      await newBlog.validate();
      const savedBlog = await newBlog.save();

      await Category.findByIdAndUpdate(categoryId, {
        $push: { blog: savedBlog._id },
      });

      res.status(201).json({
        status: "success",
        message: "Bài viết được tạo thành công",
        data: {
          blog: savedBlog,
        },
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: "fail",
          message: "Validation Error - " + error.message,
        });
      }
      if (error.name === "MongoServerError" && error.code === 11000) {
        return res.status(409).json({
          status: "fail",
          message: "Lỗi khóa trùng lặp - " + error.message,
        });
      }
      res.status(500).json({
        status: "error",
        message: "Lỗi máy chủ nội bộ",
      });
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
  async UpdateBlog(req, res, next) {
    try {
      const { slug } = req.params;
      const update = req.body;

      // Find the original blog post
      const originalBlog = await Blogs.findOne({ slug });
      if (!originalBlog) {
        return res.status(404).json({
          status: "fail",
          message: "Không tìm thấy bài viết",
        });
      }

      // If category is being updated, check if the new category exists
      if (update.categoryId) {
        const categoryDoc = await Category.findById(update.categoryId);
        if (!categoryDoc) {
          return res.status(400).json({
            status: "fail",
            message: "Category không tồn tại",
          });
        }
      }

      // Update the blog post
      const updatedBlog = await Blogs.findOneAndUpdate({ slug }, update, {
        new: true,
        runValidators: true,
      });

      if (!updatedBlog) {
        return res.status(404).json({
          status: "fail",
          message: "Không tìm thấy bài viết",
        });
      }

      // If category has changed, update the category documents
      if (
        update.categoryId &&
        update.categoryId !== originalBlog.categoryId.toString()
      ) {
        // Remove blog from old category
        await Category.findByIdAndUpdate(originalBlog.categoryId, {
          $pull: { blog: originalBlog._id },
        });

        // Add blog to new category
        await Category.findByIdAndUpdate(update.categoryId, {
          $push: { blog: updatedBlog._id },
        });
      }

      res.status(200).json({
        status: "success",
        message: "Bài viết đã được cập nhật",
        data: {
          blog: updatedBlog,
        },
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: "fail",
          message: "Validation Error - " + error.message,
        });
      }
      if (error.name === "MongoServerError" && error.code === 11000) {
        return res.status(409).json({
          status: "fail",
          message: "Lỗi khóa trùng lặp - " + error.message,
        });
      }
      console.error("Lỗi khi cập nhật bài viết:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi máy chủ nội bộ",
      });
      next(error);
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
        status: 200,
        data: users,
        currentPage,
        totalPage,
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
  async deleteClient(req, res) {
    try {
      const id = req.params.id;

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          status: 400,
          error: "Invalid client ID format",
        });
      }

      const deletedClient = await client.findByIdAndDelete(id);
      if (!deletedClient) {
        return res.status(404).json({
          status: 404,
          error: "Client not found",
        });
      }

      res.status(200).json({
        status: 200,
        message: "Client deleted successfully",
        deletedClient: {
          id: deletedClient._id,
          email: deletedClient.email,
        },
      });
    } catch (error) {
      console.error("Error in deleteClient:", error);
      res.status(500).json({
        status: 500,
        error: "Internal server error",
        message: error.message,
      });
    }
  }
  async getClients(req, res) {
    try {
      const clients = await Client.find().select("-__v"); // Loại bỏ trường __v nếu không cần thiết

      if (clients.length === 0) {
        return res.status(204).json({ message: "No clients found" });
      }

      res.status(200).json({
        status: 200,
        count: clients.length,
        data: clients,
      });
    } catch (error) {
      console.error("Error in getClients:", error);
      res.status(500).json({
        status: 500,
        error: "Internal server error",
        message: error.message,
      });
    }
  }

  async deleteAlbum(req, res) {
    try {
      const id = req.params.id;
      const Image = album.findOne({ _id: id });
      if (!Image) {
        return res.status(404).json({ error: "Image not found" });
      }
      await Image.remove();
      res.status(200).json({ status: 200 });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async UpdateAlbum(req, res) {
    try {
      const { id } = req.params; // Album ID from route parameter
      const { title, images } = req.body;
      const Album = await album.findOne({ _id: id });
      if (!album) {
        return res.status(404).send({ message: "Album not found" });
      }
      Album.title = title;
      Album.images = images;

      const result = await Album.save();

      res.status(200).json({
        status: 200,
        message: "Album đã được cập nhật",
        data: result,
      });
    } catch (error) {
      res.status(500).send({ message: "Error updating album", error });
    }
  }

  async deleteUser(req, res) {
    try {
      const _id = req.params.id;

      const deletedUser = await client.findByIdAndDelete(_id);

      if (deletedUser) {
        res.status(200).json({
          status: 200,
          message: "Người dùng đã được xóa",
          data: deletedUser,
        });
      } else {
        res.status(404).json({
          status: "fail",
          message: "Người dùng không tồn tại",
        });
      }
    } catch (error) {
      // Xử lý lỗi chung
      console.error(error); // Ghi log lỗi để dễ debug sau này
      res.status(500).json({
        // Trả về lỗi server
        status: "error",
        message: "Đã xảy ra lỗi khi xóa người dùng",
      });
    }
  }

  async postToAlbum(req, res) {
    try {
      const { title, images } = req.body;
      console.log(title);
      if (!title) {
        return res.status(400).json({
          status: "error",
          message: "Invalid input data",
        });
      }

      const newAlbum = new album({ title, images });
      await newAlbum.save();

      res.status(201).json({
        status: 200,
        data: newAlbum,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
}

module.exports = new AuthController();
