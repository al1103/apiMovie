const mongoose = require("mongoose");
const Blogs = require("../models/blog");
const Category = require("../models/category");
const Client = require("../models/client");
const Albums = require("../models/album");
const poster = require("../models/poster");
const Banner = require("../models/banner");

async function getAllBlog(req, res) {
  try {
    const { results, page, pagination, sortOrder, sortField, filters } =
      req.query;
    const currentPage = parseInt(page) || parseInt(pagination?.current) || 1;
    const pageSize = parseInt(results) || parseInt(pagination?.pageSize) || 10;
    const offset = (currentPage - 1) * pageSize;

    const sort = buildSortObject(sortField, sortOrder);
    const filter = buildFilterObject(filters);

    const totalPosts = await Blogs.countDocuments(filter);
    const numberOfPages = Math.ceil(totalPosts / pageSize);

    const posts = await fetchPosts(filter, sort, offset, pageSize);

    if (posts.length === 0) {
      return sendNotFoundResponse(res);
    }

    const categories = await Category.find().select("title");

    sendSuccessResponse(res, posts, categories, {
      current: currentPage,
      pageSize,
      total: totalPosts,
      pages: numberOfPages,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy bài viết blog");
  }
}

function buildSortObject(sortField, sortOrder) {
  const sort = {};
  const order = sortOrder === "ascend" ? 1 : -1;
  (sortField || ["createdAt"]).forEach((field) => {
    sort[field === "categoryId" ? "categoryId.title" : field] = order;
  });
  return sort;
}

function buildFilterObject(filters) {
  const filter = {};
  if (filters?.title) {
    filter.title = { $regex: filters.title, $options: "i" };
  }
  return filter;
}

async function fetchPosts(filter, sort, offset, pageSize) {
  return Blogs.find(filter)
    .select("-__v")
    .populate({
      path: "categoryId",
      select: "title",
    })
    .sort(sort)
    .skip(offset)
    .limit(pageSize)
    .lean();
}

function sendNotFoundResponse(res) {
  return res.status(404).json({
    status: "không tìm thấy",
    message: "Không tìm thấy bài viết nào",
  });
}

function sendSuccessResponse(res, posts, categories, pagination) {
  res.status(200).json({
    data: posts,
    categories,
    pagination,
  });
}

function handleError(res, error, message) {
  console.error(message, error);
  res.status(500).json({
    status: "lỗi",
    message: "Đã xảy ra lỗi",
  });
}

class BlogController {
  async getAllBlog(req, res) {
    await getAllBlog(req, res);
  }

  async getAllBlogMore(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const totalPosts = await Blogs.countDocuments();

      const posts = await Blogs.find().limit(limit); // Giới hạn số lượng tài liệu trả về
      if (posts.length === 0) {
        return res.status(404).json({
          status: "không tìm thấy",
          message: "Không tìm thấy bài viết nào",
        });
      }

      res.status(200).json({
        content: posts,
        pagination: {
          totalPage: Math.ceil(totalPosts / limit),
        },
      });
    } catch (error) {
      console.error("Lỗi khi lấy bài viết blog:", error);
      res.status(500).json({
        status: "lỗi",
        message: "Đã xảy ra lỗi khi lấy danh sách bài viết",
      });
    }
  }

  async getOnePosts(req, res, next) {
    try {
      const slug = req.params.slug.toString();
      const { limit = 5 } = req.query;

      const data = await Blogs.findOne({ slug }).populate(
        "categoryId",
        "title"
      );

      if (!data) {
        return res.status(404).json({
          status: "thất bại",
          message: "Bài viết không tồn tại",
        });
      }

      const relatedPosts = await Blogs.find({
        categoryId: data.categoryId,
        _id: { $ne: data._id }, // Loại trừ bài viết hiện tại
      })
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo, mới nhất trước
        .select("title slug thumbnail description createdAt");

      res.status(200).json({
        status: 200,
        data,
        relatedPosts,
      });
    } catch (error) {
      console.error("Lỗi trong getOnePosts:", error);
      res.status(500).json({
        status: "lỗi",
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
      let updatedBanner = await Banner.findOneAndUpdate(
        { id: "1" },
        { $set: { images: newImages } },
        { new: true }
      );

      if (!updatedBanner) {
        // Nếu không tìm thấy banner, tạo mới
        const newBanner = new Banner({ id: "1", images: newImages });
        updatedBanner = await newBanner.save();
        return res.status(201).json({
          status: 201,
          message: "Banner đã được tạo mới thành công",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Banner đã được cập nhật thành công",
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật hoặc tạo mới banner:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  }

  async getBanner(req, res, next) {
    try {
      const banners = await Banner.find();

      if (!banners || banners.length === 0) {
        return res
          .status(200)
          .json({ message: "Không tìm thấy banner", data: [] });
      }
      return res.status(200).json(banners);
    } catch (error) {
      console.error("Lỗi khi lấy banner:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  }

  async updatePoster(req, res, next) {
    try {
      const newImages = req.body.images;
      console.log(newImages);

      // Tìm poster đầu tiên trong cơ sở dữ liệu
      let currentPoster = await poster.findOne();

      if (!currentPoster) {
        // Nếu không tìm thấy poster, tạo mới
        currentPoster = new poster({ images: newImages });
        await currentPoster.save();
        return res.status(201).json({
          status: 201,
          message: "Poster đã được tạo thành công",
        });
      } else {
        // Nếu tìm thấy poster, cập nhật
        currentPoster.images = newImages;
        await currentPoster.save();
        return res.status(200).json({
          status: 200,
          message: "Poster đã được cập nhật thành công",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật poster:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  }

  async getPoster(req, res, next) {
    try {
      const banners = await Banner.find();

      if (!banners || banners.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy banner" });
      }
      return res.status(200).json(banners);
    } catch (error) {
      console.error("Lỗi khi lấy banner:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
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
        .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
    }
  }

  async postClient(req, res) {
    try {
      const { name, phone, email, question } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!name || !phone || !email || !question) {
        return res.status(400).json({
          status: 400,
          message: "Tất cả các trường là bắt buộc",
        });
      }

      // Tạo khách hàng mới
      const newClient = new Client({
        name,
        phone,
        email,
        question,
      });

      // Lưu khách hàng vào cơ sở dữ liệu
      await newClient.save();

      // Trả về phản hồi thành công
      res.status(201).json({
        status: 201,
        message: "Khách hàng đã được tạo thành công",
      });
    } catch (error) {
      // Xử lý lỗi xác thực
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          status: 400,
          message: "Xác thực thất bại",
          details: validationErrors,
        });
      }

      // Xử lý các lỗi khác
      console.error("Lỗi khi lưu khách hàng:", error);
      res.status(500).json({
        status: 500,
        message: "Lỗi máy chủ nội bộ",
      });
    }
  }

  async getAllImagesInAlbum(req, res) {
    try {
      const id = req.query.id;
      const totalImages = await Albums.countDocuments();
      const images = await Albums.find({ _id: id });
      console.log(images);
      res.status(200).json({
        status: 200,
        data: images,
        total: totalImages,
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }

  async getAllAlbum(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const albums = await Albums.find().skip(skip).limit(limit);
      const totalAlbums = await Albums.countDocuments();

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
      console.error("Lỗi trong getAllAlbum:", error);
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }

  async getAlbumById(req, res) {
    try {
      const { id } = req.params; // Giả sử ID album được truyền qua tham số đường dẫn

      const albumData = await Albums.findById(id);

      if (!albumData) {
        return res
          .status(404)
          .json({ status: 404, error: "Không tìm thấy album" });
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
      console.error("Lỗi trong getAlbumById:", error);
      res.status(500).json({ status: 500, error: "Lỗi máy chủ nội bộ" });
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
        .then(() => console.log("Banner đã được lưu thành công"))
        .catch((err) => console.error("Lỗi khi lưu banner:", err));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async UpdateAlbum(req, res) {
    try {
      const { id } = req.params;
      const { title, images } = req.body;

      const updatedAlbum = await Albums.findByIdAndUpdate(
        id,
        { title, images },
        { new: true, runValidators: true }
      );

      if (!updatedAlbum) {
        return res
          .status(404)
          .json({ status: 404, message: "Không tìm thấy album" });
      }

      res.status(200).json({
        status: 200,
        message: "Album đã được cập nhật thành công",
      });
    } catch (error) {
      console.error("Lỗi trong UpdateAlbum:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ status: 400, message: error.message });
      }

      if (error.name === "CastError" && error.kind === "ObjectId") {
        return res
          .status(400)
          .json({ status: 400, message: "Định dạng ID album không hợp lệ" });
      }

      res.status(500).json({ status: 500, message: "Lỗi máy chủ nội bộ" });
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
      res.status(500).json({ error: "Dịch thất bại" });
    }
  }

  async getCategoryPosts(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10, featured } = req.query;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          status: "thất bại",
          message: "Danh mục không tồn tại",
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

      // Chỉ thêm featured vào truy vấn nếu nó được chỉ định
      if (featured) {
        query.featured = featured === "true"; // Chuyển đổi featured thành boolean
      }

      const posts = await Blogs.find(query)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit);

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
      console.error("Lỗi trong getCategoryPosts:", error);
      res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
      next(error);
    }
  }

  async postBanner(req, res, next) {
    try {
      const images = req.body.images;
      console.log(images);

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          status: "thất bại",
          message: "Vui lòng cung cấp một mảng các URL hình ảnh cho banner",
        });
      }

      const newBanner = new Banner({
        images: images.map((url) => ({ url })),
      });

      const savedBanner = await newBanner.save();

      res.status(201).json({
        status: "thành công",
        message: "Đã tạo banner thành công",
        data: savedBanner,
      });
    } catch (error) {
      console.error("Lỗi trong postBanner:", error);
      res.status(500).json({
        status: "lỗi",
        message: "Lỗi máy chủ nội bộ",
      });
      next(error);
    }
  }

  async createCategory(req, res) {
    try {
      const { title } = req.body;

      if (!title) {
        return res
          .status(400)
          .json({ status: 400, message: "Tiêu đề danh mục là bắt buộc" });
      }

      const existingCategory = await Category.findOne({ title });
      if (existingCategory) {
        return res
          .status(409)
          .json({ status: 409, message: "Danh mục này đã tồn tại" });
      }

      const newCategory = new Category({ title });
      await newCategory.save();

      res.status(201).json({
        status: 201,
        message: "Đã tạo danh mục thành công",
        data: newCategory,
      });
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      res.status(500).json({ status: 500, message: "Lỗi máy chủ nội bộ" });
    }
  }
}

module.exports = new BlogController();
