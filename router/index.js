const authRouter = require("./auth");
const usersRouter = require("./users");
const syntheticRouter = require("./synthetic");
const Blogs = require("./Blog");
const authenticateToken = require("../controller/middlewareToken"); // Điều chỉnh dựa trên cách xuất của bạn

function authorize(allowedRoles) {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Không có token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Token không hợp lệ" });
      }

      req.user = user;
      const userRole = user.role;

      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        return res.status(403).json({ error: "Không được phép truy cập" });
      }
    });
  };
}

function routes(app) {
  app.use("/auth", authenticateToken, authRouter); // Các route xác thực, không cần ủy quyền ở đây
  app.use("/users", authenticateToken, usersRouter);
  app.use(
    "/synthetic",
    authenticateToken,
    authorize(["admin"]),
    syntheticRouter
  );
  app.use("/", Blogs);
}

module.exports = routes;
