const express = require("express");
const router = express.Router();
const Blog = require("../controller/Blogs");
const authController = require("../controller/authControllers");

// User Management
router.get("/Post/:id", authController.getOneBlogAdmin);
router.put("/Post/:slug", authController.UpdateBlog);
router.delete("/Post/:slug", authController.deleteBlog);
router.delete("/Client/:id", authController.deleteClient);
router.delete("/Album/:id", authController.deleteAlbum);
router.put("/Album/:id", authController.UpdateAlbum);
router.get("/users", authController.getListUsers);
router.post("/Post", authController.createPost);
router.get("/Client", authController.getClients);
router.post("/Album", authController.postToAlbum);
router.post("/FeaturedBlogPost/:id", authController.FeaturedBlogPost);

module.exports = router;
