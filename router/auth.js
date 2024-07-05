const express = require("express");
const router = express.Router();
const Blog = require("../controller/Blogs");
const authController = require("../controller/authControllers");

// User Management
router.get("/Post/:id", authController.getOneBlogAdmin);
router.put("/Post/:slug", authController.UpdateBlog);
router.delete("/Post/:slug", authController.deleteBlog);
router.get("/users", authController.getListUsers);
router.post("/Post", authController.createPost);
router.delete("/Client", authController.deleteClient);
router.get("/Client", authController.getClients);
router.delete("/Album", authController.deleteImagesInAlbum);

module.exports = router;
