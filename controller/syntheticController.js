const User = require("../models/users_model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
class syntheticController {
  async getUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.id });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Destructure user._doc to remove password from response
      const { password, ...userData } = user._doc;

      res.status(200).json({
        status: "success",
        data: userData, // Use a different variable name to avoid conflicts
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  index(req, res, next) {
    try {
      res.json({ message: "Hello World" });
    } catch (err) {
      next(err);
    }
  }
  async changePassword(req, res, next) {
    try {
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Find the user by email

  async forgotPassword(req, res) {
    try {
      // Find the user by email (remove redundant ".email")
      const user = await User.findOne({ email: req.body.email.email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate a password reset token and set its expiration date
      const token = jwt.sign({ id: user._id }, "zilong-zhou", {
        expiresIn: "1h",
      });
      user.passwordResetToken = token;
      user.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Construct reset URL
      const resetUrl = `http://localhost:3000/synthetic/resetPassword?token=${token}`;

      // Prepare email content with the reset URL
      const mailOptions = {
        from: "Zilong",
        to: user.email,
        subject: "Password Reset",
        html: `
          <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" target="_blank">Reset Password</a>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: "Password reset email sent" });
    } catch (err) {
      console.error("Failed to send password reset email:", err);
      res.status(500).json({ error: "Failed to send password reset email" });
    }
  }
  async resetPassword(req, res) {
    try {
      const token = req.body.token;
      const decodedToken = jwt.verify(token, "zilong-zhou");
      const user = await User.findOne({
        _id: decodedToken.id,
      });
      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid or expired password reset token" });
      }

      // Hash the new password before saving
      user.password = await bcrypt.hash(req.body.password, 10);
      await user.save();

      // Send confirmation email (handle potential errors)
      const mailOptions = {
        from: "Zilong",
        to: user.email,
        subject: "Password Reset Confirmation",
        html: `
        <p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>
      `,
      };

      await transporter.sendMail(mailOptions);
      res.json({
        status: "200",
        message: "Password reset successful",
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      res.status(500).json({ error: "Failed to reset password" }); // Generic error message for security
    }
  }
  async UpdateUser(req, res) {
    try {
      const _id = req.params.id;
      const data = req.body;
      const updatedUser = await User.findByIdAndUpdate(_id, data, {
        new: true,
      });

      if (!updatedUser) {
        return res.status(404).json({
          status: "fail",
          message: "Người dùng không tồn tại",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Thông tin người dùng đã được cập nhật",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Lỗi máy chủ nội bộ",
        error: error.message,
      });
    }
  }
  async deleteUser(req, res) {
    // Sử dụng async function cho rõ ràng
    try {
      const _id = req.params.id;


      const deletedUser = await User.findByIdAndDelete(_id);

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
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "phamtuan72az@gmail.com",
    pass: "fljm hapz doac rtzu",
  },
});

module.exports = new syntheticController();
