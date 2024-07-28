// const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const Banner = require("../models/Banner");
const Category = require("../models/category");
const Client = require("../models/client");
const album = require("../models/album");
const { translate } = require("../router/translator");

class BlogController {
  async getAllBlog(req, res) {
    try {
      const currentPage = parseInt(req.query.pagination?.current) || 1;
      const pageSize = parseInt(req.query.pagination?.pageSize) || 10;
      const sortOrder = req.query.sortOrder === "ascend" ? 1 : -1;
      const sortField = req.query.sortField || ["createdAt"];
      const offset = (currentPage - 1) * pageSize;

      // Build the sort object
      const sort = {};
      sortField.forEach((field) => {
        if (field === "categoryId") {
          sort["categoryId.name"] = sortOrder;
        } else {
          sort[field] = sortOrder;
        }
      });

      // Build the filter object
      const filter = {};
      if (req.query.filters?.title) {
        filter.title = { $regex: req.query.filters.title, $options: "i" };
      }

      const totalPosts = await Blogs.countDocuments(filter);
      const numberOfPages = Math.ceil(totalPosts / pageSize);

      const posts = await Blogs.find(filter)
        .select("-content -__v")
        .populate("categoryId")
        .populate({
          path: "authorId",
          select: "username",
        })
        .sort(sort)
        .skip(offset)
        .limit(pageSize);

      if (posts.length === 0) {
        return res.status(404).json({
          status: "not found",
          message: "Không tìm thấy bài viết nào",
        });
      }

      res.status(200).json({
        data: posts,
        pagination: {
          current: currentPage,
          pageSize: pageSize,
          total: totalPosts,
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
      const slug = req.params.slug.toString();
      const { limit = 5 } = req.query;

      // Tìm bài viết hiện tại
      const data = await Blogs.findOne({ slug })
        .populate("categoryId", "title")
        .populate("authorId", "username");

      if (!data) {
        return res.status(404).json({
          status: "fail",
          message: "Bài viết không tồn tại",
        });
      }

      const relatedPosts = await Blogs.find({
        categoryId: data.categoryId,
        _id: { $ne: data._id }, // Loại trừ bài viết hiện tại
      })
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo, mới nhất trước
        .populate("authorId", "username")
        .select("title slug thumbnail description createdAt authorId");

      res.status(200).json({
        status: 200,
        data,
        relatedPosts,
      });
    } catch (error) {
      console.error("Error in getOnePosts:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi máy chủ nội bộ",
      });
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
        return res.status(200).json({
          status: 200,
          message: "Banner updated successfully",
        });
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

  async postClient(req, res) {
    try {
      const { name, phone, email, question } = req.body;

      if (!name || !phone || !email || !question) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const newClient = new Client({
        name,
        phone,
        email,
        question,
      });

      const savedClient = await newClient.save();

      res
        .status(201)
        .json({ status: 201, message: "Client created successfully" });
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res
          .status(400)
          .json({ error: "Validation failed", details: validationErrors });
      }
      console.error("Error saving client:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllImagesInAlbum(req, res) {
    try {
      const id = req.query.id;
      const totalImages = await album.countDocuments();
      const images = await album.find({ _id: id });
      console.log(images);
      res.status(200).json({
        status: 200,
        data: images,
        total: totalImages,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async getAllAlbum(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const albums = await album.find().skip(skip).limit(limit);
      const totalAlbums = await album.countDocuments();

      const data = albums.map((e) => {
        return {
          _id: e._id,
          title: e.title,
          images: e.images.length > 0 ? e.images[0] : null,
          total: e.images.length,
        };
      });

      res.status(200).json({
        status: 200,
        data: data,
        currentPage: page,
        totalPages: Math.ceil(totalAlbums / limit),
      });
    } catch (error) {
      console.error("Error in getAllAlbum:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async getAlbumById(req, res) {
    try {
      const { id } = req.params; // Assuming the album ID is passed as a route parameter

      const albumData = await album.findById(id);

      if (!albumData) {
        return res.status(404).json({ status: 404, error: "Album not found" });
      }

      const totalImages = await Image.countDocuments({ albumId: id });

      const images = await Image.find({ albumId: id });

      res.status(200).json({
        status: 200,
        data: {
          images,
        },
        totalImages: totalImages,
      });
    } catch (error) {
      console.error("Error in getAlbumById:", error);
      res.status(500).json({ status: 500, error: "Internal server error" });
    }
  }

  async createBanner(req, res) {
    try {
      const bannerData = {
        images: [
          { url: "https://example.com/banner1.jpg" },
          { url: "https://example.com/banner2.png" },
          { url: "https://example.com/banner3.gif" },
        ],
      };

      // Tạo một instance của model Banner

      const newBanner = new Banner(bannerData);

      // Lưu vào database
      newBanner
        .save()
        .then(() => console.log("Banner saved successfully"))
        .catch((err) => console.error("Error saving banner:", err));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  async UpdateAlbum(req, res) {
    try {
      const { id } = req.params;
      const { title, images } = req.body;

      const updatedAlbum = await album.findByIdAndUpdate(
        id,
        { title, images },
        { new: true, runValidators: true }
      );

      if (!updatedAlbum) {
        return res
          .status(404)
          .json({ status: 404, message: "Album not found" });
      }

      res.status(200).json({
        status: 200,
        message: "Album updated successfully",
      });
    } catch (error) {
      console.error("Error in UpdateAlbum:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ status: 400, message: error.message });
      }

      if (error.name === "CastError" && error.kind === "ObjectId") {
        return res
          .status(400)
          .json({ status: 400, message: "Invalid album ID format" });
      }

      res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }
  async TextTranslate(req, res) {
    try {
      const { text, targetLanguage, sourceLanguage } = req.body;
      const translatedText = await translate(
        text,
        targetLanguage,
        sourceLanguage
      );
      res.json({ translatedText });
    } catch (error) {
      res.status(500).json({ error: "Translation failed" });
    }
  }
  async getCategoryPosts(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10, featured } = req.query;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          status: "fail",
          message: "Category không tồn tại",
        });
      }

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }, // Sắp xếp theo ngày tạo, mới nhất trước
      };

      const query = {
        categoryId: categoryId,
      };

      // Only add featured to the query if it's specified
      if (featured) {
        query.featured = featured === "true"; // Convert featured to boolean
      }

      const posts = await Blogs.find(query)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .populate({ path: "authorId", select: "name" });

      const totalPosts = await Blogs.countDocuments(query);

      res.status(200).json({
        status: 200,
        message: "Danh sách bài viết",
        data: posts,
        pagination: {
          current: parseInt(page, 10),
          pageSize: parseInt(limit, 10),
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit),
        },
      });
    } catch (error) {
      console.error("Error in getCategoryPosts:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi máy chủ nội bộ",
      });
      next(error);
    }
  }
}
module.exports = new BlogController();
