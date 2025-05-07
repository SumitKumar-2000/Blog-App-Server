const router = require("express").Router();
const controller = require("../controller/user");
const {Protect} = require("../middleware/index");

router.use(Protect);

router.get("/", controller.getAllUser);
router
  .route("/:id")
  .get(controller.getUserById)
  .patch(controller.updateUser)
  .delete(controller.deleteUser);

module.exports = router;
