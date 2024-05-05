const Movie = require("./movie");
const authRouter = require("./auth");
const MovieDetail = require("./moviedetail");
const usersRouter = require("./users");
const syntheticRouter = require("./synthetic");
const Pay = require("./pay");
const bodyParser = require('body-parser');

const authenToken = require("../controller/middlewareToken");

function authorize(roles) {
  return (req, res, next) => {
    if (roles.includes(req.userRole)) {
      next();
    } else {
      return res.status(403).json({ error: "Unauthorized" });
    }
  };
}
function routes(app) {
  app.use("/auth", authenToken, authorize(["admin"]), authRouter);
  app.use("/movie", MovieDetail);
  app.use("/users", usersRouter);
  app.use("/synthetic", syntheticRouter);
  app.use("/Pay", Pay);
  app.use("/", Movie);
}

module.exports = routes;
