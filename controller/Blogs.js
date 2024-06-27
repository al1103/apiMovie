// const Comment = require("../models/Comment");
const Blogs = require("../models/blog");
const Banner = require("../models/Banner");
const Category = require("../models/category");
const PostCategories = require("../models/PostCategories");

class BlogController {
  async getAllBlog(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 posts per page if not provided
      const skip = (page - 1) * limit; // Calculate the number of documents to skip
      const totalPosts = await Blogs.countDocuments();
      const numberOfPages = Math.ceil(totalPosts / limit);
      const posts = await Blogs.find()
        .populate({
          path: "authorId",
          select: "username", // Select only necessary fields
        })
        .select("-__v") // Exclude the version key from the blog posts
        .skip(skip) // Skip documents for pagination
        .limit(limit); // Limit the number of documents returned

      if (posts.length === 0) {
        return res.status(404).json({
          status: "not found",
          message: "Không tìm thấy bài viết nào",
        });
      }
      res.status(200).json({
        status: 200,
        count: posts.length,
        numberOfPages, // Include total number of posts
        data: posts,
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
        .populate("categoryIds")
        .exec();
      const dataCategory = [];
      data.forEach((postCategory) => {
        postCategory.categoryIds.forEach((category) => {
          dataCategory.push(category);
        });
      });

      res.json({ status: 200, data: { Post, dataCategory } });
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
      console.log(nameQuery);

      // Lọc  theo tên
      let Posts = await Blogs.find(
        { $text: { $search: nameQuery } },
        { score: { $meta: "textScore" } }
      )
        .skip(skip)
        .limit(limit);
      res.json({
        length: Posts.length,
        status: 200,
        data: Posts,
      });
    } catch (error) {
      next(error);
    }
  }
  async getComments(req, res, next) {
    try {
      const id = req.params.id;
      const comments = await Comment.find({ Post: id })
        .populate("User")
        .sort({ createdAt: -1 });
      if (!comments || comments.length === 0) {
        return res
          .status(404)
          .json({ message: "No comments found for this Post" }); // Trả về thông báo lỗi phù hợp nếu không có bình luận nào
      }
      res.status(200).json({
        status: 200,
        data: comments,
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
  async getRelatedArticles(req, res) {
    const id = req.params.id;

    try {
      const currentArticle = await Blogs.findById(id);
      if (!currentArticle) {
        return res.status(404).json({ message: "Article not found" });
      }

      const relatedArticles = await Blogs.find({
        _id: { $ne: id }, // Loại bỏ bài viết hiện tại
      }).limit(4);

      res.json({
        status: 200,
        data: relatedArticles,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching related articles" });
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
    try {
      const posts = await PostCategories.find({
        categoryIds: { $in: req.params.id },
      }).populate("postId");

      res.status(200).json({ status: 200, data: posts });
    } catch (error) {
      console.error("Lỗi khi truy vấn bài viết theo danh mục:", error);

      res.status(500).json({
        status: 500,
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
}

module.exports = new BlogController();