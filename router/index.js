const Movie = require("./movie");
const authRouter = require("./auth");
const MovieDetail = require("./moviedetail");

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
  app.use("/auth", authenToken,  authorize(["admin"]) , authRouter);
  app.use("/movie", MovieDetail);
  app.use("/",   Movie);


  
}

module.exports = routes;
