const express = require("express");
const router = express.Router();
const BlogController = require("../controller/Blogs");

router.get("/getCategoryPosts/:categoryId", BlogController.getCategoryPosts);
router.get("/search", BlogController.SearchPosts);
router.get("/getbanner", BlogController.getBanner);
router.get("/getCategories", BlogController.getCategory);
router.get("/get", BlogController.createBanner);
router.get("/Album", BlogController.getAllImagesInAlbum);
router.get("/Albums", BlogController.getAllAlbum);
router.get("/Post", BlogController.getAllBlog);
router.get("/Poster", BlogController.getPoster);
router.get("/Posts", BlogController.getAllBlogMore);
router.get("/:slug", BlogController.getOnePosts);
router.post("/Client", BlogController.postClient);
router.post("/translate", BlogController.TextTranslate);
router.post("/postbanner", BlogController.postBanner);
router.put("/Album/:id", BlogController.UpdateAlbum);
router.put("/updatebanner", BlogController.updateBanner);
router.put("/updatePoster", BlogController.updatePoster);
router.post("/categories", BlogController.createCategory);

module.exports = router;
