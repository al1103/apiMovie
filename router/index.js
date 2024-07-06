const authRouter = require("./auth");
const usersRouter = require("./users");
const syntheticRouter = require("./synthetic");
const Blogs = require("./Blog");
const authenticateToken = require("../controller/middlewareToken"); // Adjust based on your export

function authorize(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.isRole; // Get userRole from authenticateToken middleware
    if (userRole.includes(userRole)) {
      next(); // Role is allowed, proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  };
}

function routes(app) {
  app.use("/auth", authenticateToken, authorize("admin"), authRouter); // Authentication routes, no need for authorization here
  app.use("/users", usersRouter);
  app.use("/synthetic", authorize("admin"), syntheticRouter); // Require authentication and specific role
  app.use("/", Blogs);
}

module.exports = routes;
