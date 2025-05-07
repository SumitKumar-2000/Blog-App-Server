const router = require("express").Router();
const controller = require("../controller/comment");
const { Protect } = require("../middleware/index");

router
  .route("/blog/:id")
  .get(controller.getCommentsByBlog)
  .post(Protect, controller.createComment);

router.route("/:id").delete(Protect, controller.deleteComment);

module.exports = router;
