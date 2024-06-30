// const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const Banner = require("../models/Banner");
const Category = require("../models/category");
const PostCategories = require("../models/PostCategories");
const Client = require("../models/client");

class BlogController {
  async getAllBlog(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const currentPage = parseInt(req.query.pagination.current) || 1;
      const pageSize = parseInt(req.query.pagination.pageSize) || 10;
      const offset = (currentPage - 1) * pageSize;
      const limit = pageSize;
      const totalPosts = await Blogs.countDocuments();
      const numberOfPages = Math.ceil(totalPosts / pageSize);

      const posts = await Blogs.find()
        .populate({
          path: "authorId",
          select: "username", // Chỉ chọn những trường cần thiết
        })
        .skip(offset) // Bỏ qua các tài liệu để phân trang
        .limit(limit); // Giới hạn số lượng tài liệu trả về
      if (posts.length === 0) {
        return res.status(404).json({
          status: "not found",
          message: "Không tìm thấy bài viết nào",
        });
      }

      res.status(200).json({
        data: {
          content: posts,
          pagination: {
            current: page,
            pageSize: pageSize,
            total: totalPosts,
            pages: numberOfPages,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({
        status: "error",
        message: "Đã xảy ra lỗi khi lấy danh sách bài viết",
      });
    }
  }
  async getAllBlogMore(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const totalPosts = await Blogs.countDocuments();

      const posts = await Blogs.find()
        .populate({
          path: "authorId",
          select: "username", // Chỉ chọn những trường cần thiết
        })
        .limit(limit); // Giới hạn số lượng tài liệu trả về
      if (posts.length === 0) {
        return res.status(404).json({
          status: "not found",
          message: "Không tìm thấy bài viết nào",
        });
      }

      res.status(200).json({
        data: {
          content: posts,
          pagination: {
            total: totalPosts,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({
        status: "error",
        message: "Đã xảy ra lỗi khi lấy danh sách bài viết",
      });
    }
  }

  async getOnePosts(req, res, next) {
    try {
      const Post = await Blogs.findOne({ slug: req.params.slug })
        .populate("authorId")
        .exec();

      if (!Post) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }
      const data = await PostCategories.find({ blogId: Post._id })
        .populate({
          path: "categoryIds",
          select: "", // Exclude all fields in categoryIds
        })
        .populate({
          path: "postId",
          select: "-content", // Exclude the 'content' field from postId
          populate: {
            path: "authorId", // Populate authorId within postId
            select: "username _id avatar", // Include only specific fields from authorId
          },
        })
        .limit(8)
        .exec();

      const relatedArticles = data.map((item) => {
        return item.postId;
      });
      res.json({ status: 200, data: { Post, relatedArticles } });
    } catch (error) {
      next(error);
    }
  }

  async SearchPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const nameQuery = req.query.query ? req.query.query.trim() : "";
      let totalPosts = await Blogs.countDocuments({
        $text: { $search: nameQuery },
      });

      let Posts = await Blogs.find(
        { $text: { $search: nameQuery } },
        { score: { $meta: "textScore" } }
      )
        .skip(skip)
        .limit(limit);
      res.json({
        numberOfPages: Math.ceil(totalPosts / limit),
        count: Posts.length,
        status: 200,
        data: Posts,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBanner(req, res, next) {
    try {
      const newImages = req.body; // Lấy dữ liệu ảnh mới từ body request
      // Tìm và cập nhật banner đầu tiên
      const updatedBanner = await Banner.findOneAndUpdate(
        {}, // Điều kiện tìm kiếm: không có điều kiện, tìm phần tử đầu tiên
        { $set: { images: newImages } },
        { new: true }
      );

      if (updatedBanner) {
        return res.status(200).json(updatedBanner);
      } else {
        console.log("No banner found to update.");
        return res.status(404).json({ message: "Banner not found" });
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async getBanner(req, res, next) {
    try {
      const banners = await Banner.find();

      if (!banners || banners.length === 0) {
        return res.status(404).json({ message: "Banner not found" });
      }
      return res.status(200).json(banners);
    } catch (error) {
      console.error("Error fetching banner:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCategory(req, res) {
    try {
      const categories = await Category.find();

      res.status(200).json({
        status: 200,
        data: categories,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
  async getPostsByCategoryIds(req, res) {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    try {
      const posts = await PostCategories.find({
        categoryIds: { $in: req.params.id },
      })
        .populate("postId")
        .limit(limit)
        .skip((page - 1) * limit);
      const Posts = posts.map((postCategory) => postCategory.postId);
      res.status(200).json({ status: 200, data: Posts });
    } catch (error) {
      console.error("Lỗi khi truy vấn bài viết theo danh mục:", error);

      res.status(500).json({
        status: 500,
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }

  async postClient(req, res) {
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const existingClient = await Client.findOne({ email });

      if (existingClient) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const newClient = new Client({ email });
      const savedClient = await newClient.save();
      res.status(201).json({ status: 200 });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getClients(req, res) {
    try {
      const dataClient = await Client.find();
      res.status(200).json({ status: 200, data: dataClient });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new BlogController();
