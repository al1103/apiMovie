const User = require("../models/users_model");
const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const Client = require("../models/client");
const Album = require("../models/album");
const Banner = require("../models/banner");

class AuthController {
  async createPost(req, res, next) {
    try {
      const {
        title,
        slug,
        categoryId,
        content,
        featured,
        description,
        thumbnail,
      } = req.body;

      await AuthController.checkExistingBlog(slug, title);
      await AuthController.checkCategory(categoryId);

      const newBlog = await AuthController.createNewBlog({
        title,
        slug,
        categoryId,
        description,
        content,
        thumbnail,
        featured,
      });

      await AuthController.updateCategory(categoryId, newBlog._id);

      res.status(201).json({
        status: "thành công",
        message: "Bài viết đã được tạo thành công",
        data: { blog: newBlog },
      });
    } catch (error) {
      AuthController.handleError(error, res, next);
    }
  }

  async deleteBlog(req, res) {
    try {
      const result = await Blogs.deleteOne({ slug: req.params.slug });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Bài viết không tồn tại" });
      }
      res.json({ status: 200, message: "Bài viết đã được xóa" });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async UpdateBlog(req, res, next) {
    try {
      const { slug } = req.params;
      const update = req.body;

      const originalBlog = await Blogs.findOne({ slug });
      if (!originalBlog) {
        return res.status(404).json({
          status: "thất bại",
          message: "Không tìm thấy bài viết",
        });
      }

      if (update.categoryId) {
        await AuthController.checkCategory(update.categoryId);
      }

      const updatedBlog = await AuthController.updateBlogDocument(slug, update);

      if (
        update.categoryId &&
        update.categoryId !== originalBlog.categoryId.toString()
      ) {
        await AuthController.updateBlogCategories(originalBlog, updatedBlog);
      }

      res.status(200).json({
        status: "thành công",
        message: "Bài viết đã được cập nhật",
        data: { blog: updatedBlog },
      });
    } catch (error) {
      AuthController.handleError(error, res, next);
    }
  }

  async getOneBlogAdmin(req, res) {
    try {
      const blogDetail = await Blogs.findById(req.params.id);
      if (!blogDetail) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      res.status(200).json({ status: 200, data: blogDetail });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async getListUsers(req, res) {
    try {
      const { users, total, currentPage, totalPages } =
        await AuthController.getPaginatedUsers(req.query.page);

      res.status(200).json({
        status: "thành công",
        data: users,

        pagination: {
          currentPage,
          totalPages,
          total,
          usersPerPage: users.length,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async getComments(req, res) {
    try {
      const comments = await Comment.find({ User: req.params.id });
      if (!comments || comments.length === 0) {
        return res
          .status(404)
          .json({ message: "Người dùng chưa có bình luận nào" });
      }
      res.json({ status: 200, data: comments });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async deleteClient(req, res) {
    try {
      const id = req.params.id;
      if (!AuthController.isValidObjectId(id)) {
        return res.status(400).json({
          status: 400,
          error: "Định dạng ID khách hàng không hợp lệ",
        });
      }

      const deletedClient = await Client.findByIdAndDelete(id);
      if (!deletedClient) {
        return res.status(404).json({
          status: 404,
          error: "Không tìm thấy khách hàng",
        });
      }

      res.status(200).json({
        status: 200,
        message: "Đã xóa khách hàng thành công",
        deletedClient: {
          id: deletedClient._id,
          email: deletedClient.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async getClients(req, res) {
    try {
      const clients = await Client.find().select("-__v");
      if (clients.length === 0) {
        return res.status(200).json({
          status: 200,
          message: "Không có khách hàng nào",
          count: 0,
          data: [],
        });
      }
      res.status(200).json({
        status: 200,
        count: clients.length,
        data: clients,
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async deleteAlbum(req, res) {
    try {
      const image = await Album.findByIdAndDelete(req.params.id);
      if (!image) {
        return res.status(404).json({ error: "Không tìm thấy hình ảnh" });
      }
      res
        .status(200)
        .json({ status: 200, message: "Đã xóa hình ảnh thành công" });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async UpdateAlbum(req, res) {
    try {
      const { id } = req.params;
      const { title, images } = req.body;
      const updatedAlbum = await Album.findByIdAndUpdate(
        id,
        { title, images },
        { new: true, runValidators: true }
      );
      if (!updatedAlbum) {
        return res.status(404).json({ message: "Không tìm thấy album" });
      }
      res.status(200).json({
        status: 200,
        message: "Album đã được cập nhật",
        data: updatedAlbum,
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const deletedUser = await Client.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({
          status: "thất bại",
          message: "Người dùng không tồn tại",
        });
      }
      res.status(200).json({
        status: 200,
        message: "Người dùng đã được xóa",
        data: deletedUser,
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async postToAlbum(req, res) {
    try {
      const { title, images } = req.body;
      if (!title) {
        return res.status(400).json({
          status: "lỗi",
          message: "Dữ liệu đầu vào không hợp lệ",
        });
      }

      const newAlbum = await Album.create({ title, images });
      res.status(201).json({
        status: 200,
        message: "Đã tạo album mới thành công",
        data: newAlbum,
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async FeaturedBlogPost(req, res) {
    try {
      const { id } = req.params;
      const { featured } = req.body;
      const blog = await Blogs.findByIdAndUpdate(
        id,
        { featured },
        { new: true }
      );
      if (!blog) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      res.status(200).json({
        status: 200,
        message: featured
          ? "Bài viết đã được đưa vào danh sách nổi bật"
          : "Bài viết đã được loại khỏi danh sách nổi bật",
        data: blog,
      });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async getFeaturedBlogPost(req, res) {
    try {
      const blog = await Blogs.findById(req.params.id).select(
        "_id title featured"
      );
      if (!blog) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      res.status(200).json({ status: 200, data: blog });
    } catch (error) {
      return res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  // Helper methods
  extractToken(req) {
    const authHeader = req.headers.authorization;
    return authHeader && authHeader.split(" ")[1];
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, "zilong-zhou");
    } catch (err) {
      return null;
    }
  }

  static async checkExistingBlog(slug, title) {
    const existingBlog = await Blogs.findOne({ $or: [{ slug }, { title }] });
    if (existingBlog) {
      throw new Error(
        existingBlog.slug === slug ? "Slug đã tồn tại" : "Tiêu đề đã tồn tại"
      );
    }
  }

  static async checkCategory(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }
  }

  static async createNewBlog(blogData) {
    const newBlog = new Blogs(blogData);
    await newBlog.validate();
    return await newBlog.save();
  }

  static async updateCategory(categoryId, blogId) {
    await Category.findByIdAndUpdate(categoryId, {
      $push: { blogPosts: blogId },
    });
  }

  static async updateBlogDocument(slug, update) {
    return await Blogs.findOneAndUpdate({ slug }, update, {
      new: true,
      runValidators: true,
    });
  }

  static async updateBlogCategories(originalBlog, updatedBlog) {
    await Category.findByIdAndUpdate(originalBlog.categoryId, {
      $pull: { blog: originalBlog._id },
    });
    await Category.findByIdAndUpdate(updatedBlog.categoryId, {
      $push: { blog: updatedBlog._id },
    });
  }

  static async getPaginatedUsers(page) {
    const currentPage = parseInt(page) || 1;
    const perPage = 8;
    const skip = (currentPage - 1) * perPage;

    if (currentPage < 1) {
      throw new Error("Số trang không hợp lệ");
    }

    const users = await Client.find({})
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo, mới nhất lên đầu
      .skip(skip)
      .limit(perPage);
    const total = await Client.countDocuments();
    const totalPages = Math.ceil(total / perPage);

    return { users, total, currentPage, totalPages };
  }

  static isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static handleError(error, res, next) {
    console.error("Lỗi:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "thất bại",
        message: "Lỗi xác thực - " + error.message,
      });
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(409).json({
        status: "thất bại",
        message: "Lỗi trùng lặp - " + error.message,
      });
    }
    res.status(500).json({
      status: "lỗi",
      message: "Lỗi máy chủ nội bộ",
    });
    if (next) next(error);
  }
}

module.exports = new AuthController();
