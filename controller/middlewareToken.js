const jwt = require('jsonwebtoken');


function authenToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];

  const token = authorizationHeader && authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid Token" });
  }
  try {
    
    const decodedToken = jwt.verify(token, "zilong-zhou");  

    console.log(decodedToken)
    const userRole = decodedToken.role;
    if (userRole === "admin") {
      req.userRole = "admin";
    } else if (userRole === "user") {
      req.userRole = "user";
    } else {
      return res.status(403).json({ error: "Unauthorized role" });
    }
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Invalid token signature" });
    } else {
      console.error(e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = authenToken;
