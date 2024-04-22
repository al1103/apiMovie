const User = require("../models/users_model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

class syntheticController {
  index(req, res, next) {
    try {
      res.json({ message: "Hello World" });
    } catch (err) {
      next(err);
    }
  }
  async changePassword(req, res, next) {
    try {
      const { email, password, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user || !user._id) {
        return res.status(401).json("Invalid email or password");
      }
      const isPasswordValid = newPassword;
      if (!isPasswordValid || user.password !== password) {
        return res.status(401).json("Invalid email or password");
      }
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        "zilong-zhou",
        {
          expiresIn: "24h",
        }
      );
      if (token) {
        user.password = newPassword;
        await user.save();
      }

      res.status(200).json({
        status: "success",
      });
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
      console.log(decodedToken);
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
