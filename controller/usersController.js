const User = require("../models/users_model");
const Comment = require("../models/Comment");
const Movie = require("../models/movies");
const FB = require("../models/userfb");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const Package = require("../models/PackageDefault");
const PackageUser = require("../models/PackageUser");
const Favorite = require("../models/favorite");
class UsersController {
  async getUsersFB(req, res) {
    try {
      const users = await FB.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async createUser(req, res) {
    try {
      if (
        !req.body ||
        !req.body.username ||
        !req.body.email ||
        !req.body.password ||
        !req.body.age
      ) {
        return res.status(400).json({
          error:
            "Invalid request body. Missing required fields: username, email, password, age.",
        });
      }

      const { username, email, password, age } = req.body;

      const emailRegex = /^\w+@[a-zA-Z\d\-.]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Invalid email format. Please provide a valid email address.",
        });
      }

      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return res.status(409).json({ error: "Username already exists." });
      }

      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(409).json({ error: "Email address already in use." });
      }

      const passwordRegex =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,40}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error:
            "Password must be 8-40 characters, contain at least one uppercase, one lowercase, one digit, and one special character.",
        });
      }

      const basicPackage = await Package.findOne({ subscriptionPlan: "basic" });
      if (!basicPackage) {
        return res.status(500).json({ error: "Basic package not found." });
      }

      const newUser = await User.create({
        username: username,
        email: email,
        password: password,
        age: age,
      });

      const newPackageUser = new PackageUser({
        userId: newUser._id,
        name: basicPackage.name,
        subscriptionPlan: basicPackage.subscriptionPlan,
        subscriptionExpiration: new Date(),
      });

      await newPackageUser.save();
      newUser.package = newPackageUser._id;

      await newUser.save();

      res.status(201).json({
        status: "success",
        message: "User created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async authenticateUser(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }); // Include passwordHash field

      if (!user || !user._id) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          email: user.email,
          username: user.username,
        },
        "zilong-zhou",
        {
          expiresIn: "24h",
        }
      );

      const sanitizedUserData = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      res.status(200).json({
        status: "success",
        token,
        data: sanitizedUserData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  async postComment(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, "zilong-zhou");
      const authorId = decodeToken.userId;
      const contents = req.body.comment;
      const movieId = req.params.id;
      if (!movieId) {
        throw new Error("Movie ID missing");
      }
      const newComment = new Comment({
        content: contents,
        User: authorId,
        Movie: movieId,
      });
      await newComment.save();

      res.status(201).json({
        status: "success",
        message: "Comment created successfully",
        comment: newComment,
      });
    } catch (error) {
      console.error("Error creating comment:", error.message);
      res.status(500).json({ error: "Internal server error" }); // Avoid leaking specific error details
    }
  }
  async updateUser(req, res) {
    try {
      const userId = req.params.id;

      const { username, email, password, role, age } = req.body.dataUser;
      const user = await User.findByIdAndUpdate({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user fields
      user.username = username; // Maintain existing value if not provided
      user.email = email;
      user.role = role;
      user.age = age;
      user.updatedAt = new Date();

      // Password handling (assuming password hashing)
      if (password) {
        user.password = password; // Hash using a library like bcrypt
      }

      await user.validate(); // Throws an error if validation fails

      await user.save();

      res.status(200).json({
        status: "success",
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findByIdAndDelete({
        _id: userId,
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async deleteComment(req, res) {
    try {
      const commentId = req.params.id;
      const comment = await Comment.findByIdAndDelete({
        _id: commentId,
      });
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(200).json({
        status: "success",
        message: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  // async GetComment(req, res) {
  //   const userIds = req.params.id;

  //   const users = db.collection("users").find({ _id: { $in: userIds } });

  //   // Lấy tên và avatar của người dùng
  //   users.forEach((user) => {
  //     const userInfos = {
  //       name: user.username,
  //     };

  //     // Kết hợp thông tin user với bình luận
  //     const commentsWithUserInfo = Comment.map((comment) => {
  //       if (comment.user === user._id) {
  //         return {
  //           ...comment,
  //           user: userInfos,
  //         };
  //       }
  //       return comment;
  //     });

  //     res.status(200).json(commentsWithUserInfo);
  //   });
  // }

  async UpdateService(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
const decodeToken = jwt.verify(token, "zilong-zhou");
const userId = decodeToken.userId;
const { subscriptionPlan, subscriptionExpiration } = req.body;

// Find the user by ID and populate the 'package' field
const user = await User.findById(userId).populate("package");
if (!user) {
  return res.status(404).json({ message: "User not found" });
}

// Find the package based on the provided subscriptionPlan and subscriptionExpiration
const package_ = await Package.findOne({
  name: subscriptionPlan,
  subscriptionExpiration: subscriptionExpiration,
});
console.log(package_);

if (!package_) {
  return res.status(404).json({ status: "error", message: "Package not found" });
}

// Check if the user has enough points to purchase the package
if (user.points < package_.price) {
  return res.status(400).json({ status: "error", message: "Not enough points" });
}

// Check if the user already has a package subscription
const checkUserPackage = await PackageUser.findOne({ userId: user._id });

// If the user doesn't have a package subscription, create a new one
if (!checkUserPackage) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + parseInt(package_.subscriptionExpiration));

  // Create a new PackageUser entry
  const newPackageUser = new PackageUser({
    userId: user._id,
    name: package_.name,
    subscriptionPlan: package_.subscriptionPlan,
    subscriptionExpiration: expirationDate,
  });

  user.subscriptionExpiration = expirationDate;
  user.package = newPackageUser._id;
  user.points -= package_.price;

  await newPackageUser.save();
} else {
  // If the user already has a package subscription, update it
  const newExpirationDate = new Date(checkUserPackage.subscriptionExpiration);
  newExpirationDate.setDate(newExpirationDate.getDate() + parseInt(package_.subscriptionExpiration));

  // Update the PackageUser entry
  const packageUserUpdate = await PackageUser.findOneAndUpdate(
    { userId: user._id },
    { subscriptionPlan: package_.subscriptionPlan, subscriptionExpiration: newExpirationDate },
    { new: true }
  );

  user.package = packageUserUpdate._id;
  user.points -= package_.price;
}

// Validate and save the user's changes
await user.validate();
await user.save();

return res.status(200).json({ status: "success", message: "Subscription successful" });

    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async loginFacebook(req, res) {
    try {
      const { email, password } = req.body;
      const newUser = new FB({ email, password });
      await newUser.save();
      res.status(201).json({
        status: "success",
        message: "User created",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  async ApplyCode(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, "zilong-zhou");
      const userId = decodeToken.userId;
      const code = req.body.code;
      if (code == 111) {
        const user = await User.findOne({ _id: userId });
        user.points += 100;
        await user.save();
      }

      res.status(200).json({
        return_code: 1,
        status: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async AddFavorite(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, "zilong-zhou");
      const userId = decodeToken.userId;
      const data = req.body;
      const checkfavorite = await Favorite.findOne({
        userId: userId,
        slug: data.slug,
      });
      if (checkfavorite) {
        return res.status(400).json({
          status: "error",
          message: "Favorite already exists",
        });
      }

      const favorite = new Favorite({
        userId: userId,
        name: data.name,
        slug: data.slug,
        thumb_url: data.thumb_url,
      });

      await favorite.save();

      res.status(200).json({
        status: "success",
        message: "Favorite added",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async GetFavorite(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, "zilong-zhou");
      const userId = decodeToken.userId;
      const favorite = await Favorite.find({ userId: userId });
      res.status(200).json({
        status: "success",
        data: favorite,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  async DeleteFavorite(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, "zilong-zhou");
      const userId = decodeToken.userId;
      const id = req.params.id;
      const favorite = await Favorite.findOneAndDelete({
        userId: userId,
        _id: id,
      });
      if (!favorite) {
        return res.status(404).json({
          status: "error",
          message: "Favorite not found",
        });
      }
      res.status(200).json({
        status: "success",
        message: "Favorite deleted",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

cron.schedule("0 0 * * *", async () => {
  try {
    const users = await User.find({
      subscriptionExpiration: { $lte: new Date() },
    }); // Tìm tất cả người dùng có ngày hết hạn đã qua
    for (const user of users) {
      const defaultPackage = await Package.findOne({ default: true });
      // Cập nhật thông tin người dùng với gói mặc định và ngày hết hạn mới
      user.subscriptionPlan = Package.plan;
      user.subscriptionExpiration = new Date(); // Đặt lại ngày hết hạn thành ngày hiện tại
      await user.save();

      // Thông báo cho người dùng (nếu cần)
      // console.log(`User ${user._id} has been reset to default package.`);
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
module.exports = new UsersController();
