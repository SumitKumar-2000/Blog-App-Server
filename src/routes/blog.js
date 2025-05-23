const router = require("express").Router();
const controller = require("../controller/blog");
const {Protect} = require("../middleware/index");

router
  .route("/")
  .get(controller.getAllBlogs)
  .post(Protect, controller.createBlog),

  router
  .route("/:id")
  .get(controller.getBlogByIdPublic)
  
router.use(Protect);

router
  .route("/user/blog")
  .get(controller.getAllBlogsByUser);

router
  .route("/:id/user")
  .get(controller.getBlogById)
  .patch(controller.updateBlogById)
  .delete(controller.deleteBlogById);

module.exports = router;
