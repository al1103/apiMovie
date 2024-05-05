const User = require("../models/users_model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

class syntheticController {
  async getUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.id }).populate(
        "package"
      );
      console.log(user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userData } = user._doc;

      res.status(200).json({
        status: "success",
        result: userData,
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
      user.password = req.body.password;
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
      const { password, newPassword } = req.body.dataUser;
      console.log(password, newPassword);
      const user = await User.findOne({ _id });

      if (!user) {
        return res
          .status(401)
          .json("Người dùng không tồn tại hoặc không có quyền truy cập");
      }
      // console.log(user.password, password, newPassword)
      if (newPassword) {
        // console.log(user.password, password, newPassword)
        if (user.password !== password) {
          return res.status(401).json("Mật khẩu cũ không chính xác");
        }
        user.password = newPassword;
      }

      const result = await User.updateOne({ _id }, user);

      if (result.nModified === 0) {
        return res
          .status(404)
          .json({
            message: "Không tìm thấy người dùng hoặc không có sự thay đổi",
          });
      }

      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        "zilong-zhou",
        {
          expiresIn: "24h",
        }
      );

      res.status(200).json({
        status: "success",
        token: token,
        message: "Thông tin người dùng đã được cập nhật",
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
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
