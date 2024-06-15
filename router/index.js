const authRouter = require("./auth");
const usersRouter = require("./users");
const syntheticRouter = require("./synthetic");

const authenToken = require("../controller/middlewareToken");
const Blogs = require("./Blog");

// function authorize(roles) {
//   return (req, res, next) => {
//     if (roles.includes(req.userRole)) {
//       next();
//     } else {
//       return res.status(403).json({ error: "Unauthorized" });
//     }
//   };
// }
function routes(app) {
  app.use("/auth",  authRouter);
  app.use("/users", usersRouter);
  app.use("/synthetic", syntheticRouter);
  app.use("/", Blogs);
}

module.exports = routes;
