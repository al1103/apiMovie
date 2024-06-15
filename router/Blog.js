const express = require("express");
const router = express.Router();
const BlogController = require("../controller/Blogs");
router.get("/comments/:id", BlogController.getComments);
router.get("/search", BlogController.SearchPosts);
router.put("/updatebanner", BlogController.updateBanner);
router.get("/getbanner", BlogController.getBanner);
router.get("/:slug", BlogController.getOnePosts);
// router.get("/", BlogController.index);

module.exports = router;
