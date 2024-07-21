// const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const Banner = require("../models/Banner");
const Category = require("../models/category");
const PostCategories = require("../models/PostCategories");
const Client = require("../models/client");
const album = require("../models/album");

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
          content: posts,
          pagination: {
            current: page,
            pageSize: pageSize,

            pages: numberOfPages,
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
          content: posts,
          pagination: {
            totalPage: totalPosts / limit,
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
      const post = await Blogs.findOne({ slug: req.params.slug })
        .populate({
          path: "authorId",
          select: "username",
        })
        .exec();

      if (!post) {
        return res.status(404).json({ message: "Không tìm thấy bài viết" });
      }

      const postCategories = await PostCategories.find({ postId: post._id });
      const categoryIds = postCategories.map((item) => item.categoryIds);

      const categories = await Category.find({ _id: { $in: categoryIds } });

      const relatedPosts = await PostCategories.find({ blogId: post._id })
        .populate({
          path: "categoryIds",
        })
        .populate({
          path: "postId",
          select: "-content", // Exclude the 'content' field from postId
        })
        .limit(8)
        .exec();

      const relatedArticles = relatedPosts.map((item) => item.postId);

      res.json({ status: 200, data: { post, categories, relatedArticles } });
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
      const newImages = req.body.images;
      const updatedBanner = await Banner.findOneAndUpdate(
        { id: "1" },
        { $set: { images: newImages } },
        { new: true }
      );
      if (updatedBanner) {
        return res.status(200).json(
          {
             status: 200,
             message: "Banner updated successfully" }
          
        );
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
      const { name, phone, email, question } = req.body;
  
      // Kiểm tra xem có đầy đủ thông tin cần thiết không
      if (!name || !phone || !email || !question) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // Kiểm tra xem email đã tồn tại chưa
      const existingClient = await Client.findOne({ email });
  
      if (existingClient) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Tạo client mới với đầy đủ thông tin
      const newClient = new Client({
        name,
        phone,
        email,
        question
      });
  
      // Lưu client mới vào database
      const savedClient = await newClient.save();
      
      res.status(201).json({ status: 200, message: "Client created successfully" });
    } catch (error) {
      // Xử lý lỗi validation của Mongoose
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async getAllImagesInAlbum(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const totalImages = await album.countDocuments();

      const images = await album.find().skip(skip).limit(limit);
      res.status(200).json({
          status: 200,
          data: images,
          currentPage: page,
          totalPage: Math.ceil(totalImages / limit),
        
    });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async  getAlbumById(req, res) {
    try {
      const { id } = req.params; // Assuming the album ID is passed as a route parameter
  
      const albumData = await Album.findById(id);
  
      if (!albumData) {
        return res.status(404).json({ status: 404, error: "Album not found" });
      }
  
      // Count total images in this album
      const totalImages = await Image.countDocuments({ albumId: id });
  
      const images = await Image.find({ albumId: id })
  
      res.status(200).json({
        status: 200,
        data: {
          images
        },
          totalImages: totalImages,
      });
    } catch (error) {
      console.error('Error in getAlbumById:', error);
      res.status(500).json({ status: 500, error: "Internal server error" });
    }
  }
  
  async createBanner(req, res) {
    try {
      const bannerData = {
        images: [
          { url: "https://example.com/banner1.jpg" },
          { url: "https://example.com/banner2.png" },
          { url: "https://example.com/banner3.gif" }
        ]
      };
      
      // Tạo một instance của model Banner

      const newBanner = new Banner(bannerData);
      
      // Lưu vào database
      newBanner.save()
        .then(() => console.log("Banner saved successfully"))
        .catch(err => console.error("Error saving banner:", err));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async  UpdateAlbum(req, res) {
    try {
      const { id } = req.params;
      const { title, images } = req.body;
  
      const updatedAlbum = await album.findByIdAndUpdate(
        id,
        { title, images },
        { new: true, runValidators: true }
      );
  
      if (!updatedAlbum) {
        return res.status(404).json({ status: 404, message: "Album not found" });
      }
  
      res.status(200).json({
        status: 200,
        message: "Album updated successfully",
      });
    } catch (error) {
      console.error('Error in UpdateAlbum:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ status: 400, message: error.message });
      }
      
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).json({ status: 400, message: "Invalid album ID format" });
      }
      
      res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  
}

module.exports = new BlogController();
