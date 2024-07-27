const express = require("express");
const router = express.Router();
const BlogController = require("../controller/Blogs");
router.get("/getPostsByCategories/:id", BlogController.getPostsByCategoryIds);
router.get(
  "/getNewPostsByCategoryIds/:id",
  BlogController.getNewPostsByCategoryIds
);
router.get("/Album", BlogController.getAllImagesInAlbum);
router.get("/Albums", BlogController.getAllAlbum);
router.post("/Client", BlogController.postClient);
router.post("/translate", BlogController.TextTranslate);
router.put("/Album/:id", BlogController.UpdateAlbum);
router.put("/updatebanner", BlogController.updateBanner);
router.get("/search", BlogController.SearchPosts);
router.get("/getbanner", BlogController.getBanner);
router.get("/Post", BlogController.getAllBlog);
router.get("/Posts", BlogController.getAllBlogMore);
router.get("/getCategories", BlogController.getCategory);
router.get("/get", BlogController.createBanner);
router.get("/:slug", BlogController.getOnePosts);

module.exports = router;
