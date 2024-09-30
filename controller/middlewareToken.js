const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    return res.status(401).json({ error: "Thiếu token xác thực" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "zilong-zhou");
    
    if (!decodedToken.role) {
      return res.status(403).json({ error: "Token không chứa thông tin vai trò" });
    }

    switch (decodedToken.role) {
      case "admin":
      case "user":
        req.user = {
          id: decodedToken.userId,
          role: decodedToken.role
        };
        break;
      default:
        return res.status(403).json({ error: "Vai trò không được phép" });
    }

    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Chữ ký token không hợp lệ" });
    } else if (e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token đã hết hạn" });
    } else {
      console.error("Lỗi xác thực token:", e);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  }
}

module.exports = authenticateToken;
