const express = require("express");
const router = express.Router();
const BlogController = require("../controller/Blogs");
router.get("/comments/:id", BlogController.getComments);
router.get("/search", BlogController.SearchPosts);
router.put("/updatebanner", BlogController.updateBanner);
router.get("/getbanner", BlogController.getBanner);
router.get("/Post", BlogController.getAllBlog);
router.get("/:slug", BlogController.getOnePosts);
router.get("/related-articles/:id", BlogController.getRelatedArticles);
router.get("/getCategories", BlogController.getCategory);
router.get("/getPostsByCategories/:id", BlogController.getPostsByCategoryIds);

module.exports = router;
