const User = require("../models/users_model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

class UserController {
  async createUser(req, res) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      if (!email.match(/^\w+@[a-zA-Z\d\-.]+\.[a-zA-Z]{2,}$/)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return res.status(409).json({
          error:
            existingUser.username === username
              ? "Username already exists."
              : "Email already in use.",
        });
      }
      if (
        !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,40}$/)
      ) {
        return res
          .status(400)
          .json({ error: "Password must meet security requirements." });
      }
      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo người dùng mới
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async authenticateUser(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = password === user.password; // Use bcrypt to compare passwords
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },
        "zilong-zhou", // Replace with a secure secret key
        { expiresIn: "7d" }
      );

      res.status(200).json({
        status: 200,
        token,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        }});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async postComment(req, res) {
    try {
      // 1. Check for Authorization Header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing authorization header" });
      }

      // 2. Extract Token
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Invalid token format" });
      }

      // 3. Verify Token
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, "zilong-zhou");
      } catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      // 4. Extract User ID
      const authorId = decodedToken.userId;

      // 5. Get Comment Content
      const { comment } = req.body; // Destructure directly
      if (!comment) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      // 6. Get Movie ID
      const movieId = req.params.id;
      if (!movieId) {
        return res.status(400).json({ error: "Movie ID missing" });
      }

      // 7. Create New Comment
      const newComment = new Comment({
        content: comment,
        User: authorId,
        Movie: movieId,
      });

      // 8. Save Comment
      await newComment.save();

      // 9. Successful Response
      res.status(201).json({
        status: "success",
        message: "Comment created successfully",
        comment: newComment,
      });
    } catch (error) {
      console.error("Error creating comment:", error.message);

      // 10. Generalized Error Response (Avoid leaking sensitive info)
      res.status(500).json({ error: "Internal server error" });
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
        user.password = bcrypt.hashSync(password, 10);
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
  // async deleteUser(req, res) {
  //   try {
  //     const userId = req.params.id;
  //     const user = await User.findByIdAndDelete({
  //       _id: userId,
  //     });
  //     if (!user) {
  //       return res.status(404).json({ error: "User not found" });
  //     }
  //     res.status(200).json({
  //       status: "success",
  //       message: "User deleted successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // }
  // async deleteComment(req, res) {
  //   try {
  //     const commentId = req.params.id;
  //     const comment = await Comment.findByIdAndDelete({
  //       _id: commentId,
  //     });
  //     if (!comment) {
  //       return res.status(404).json({ error: "Comment not found" });
  //     }
  //     res.status(200).json({
  //       status: "success",
  //       message: "Comment deleted successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting comment:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // }
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
}

module.exports = new UserController();
