const mongoose = require("mongoose");
const slugify = require("slugify");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Vui lòng nhập tiêu đề"],
    trim: true,
    maxlength: [100, "Tiêu đề không được quá 100 ký tự"],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, "Vui lòng nhập mô tả ngắn"],
    trim: true,
    maxlength: [200, "Mô tả không được quá 200 ký tự"],
  },
  content: {
    type: String,
    required: [true, "Vui lòng nhập nội dung"],
    trim: true,
  },
  thumbnail: {
    type: String,
    required: [true, "Vui lòng cung cấp ảnh thumbnail"],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

// Tự động tạo slug từ tiêu đề trước khi lưu
BlogSchema.pre("save", function (next) {
  if (!this.isModified("title")) {
    next();
    return;
  }
  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
  });
  next();
});

// Đảm bảo slug là duy nhất
BlogSchema.pre("save", async function (next) {
  if (!this.isModified("slug")) {
    next();
    return;
  }
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  const blogsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (blogsWithSlug.length > 0) {
    this.slug = `${this.slug}-${blogsWithSlug.length + 1}`;
  }
  next();
});

module.exports = mongoose.model("Blog", BlogSchema);
