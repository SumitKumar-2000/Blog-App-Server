const Model = require("../models/index");
const bcrypt = require("bcryptjs");
const Status = require("../utils/statusCodes");
const { isValidatePassword } = require("../utils/validators");
const {deleteImage, uploadBase64} = require("../utils/cloudnary");
const { catchAsync, AppError } = require("../utils/appError");

exports.getAllUser = catchAsync(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = page * limit;

  const { full_name, email } = req.query;

  const whereCondition = {};
  if (full_name) {
    whereCondition.full_name = full_name;
  }
  if (email) {
    whereCondition.email = email;
  }

  const users = await Model.User.findAll({
    where: whereCondition,
    limit,
    offset,
    raw: true,
    attributes: { exclude: ["password"] },
  });

  if (users.length === 0) {
    return next(new AppError("No Users Found", Status.NOT_FOUND));
  }

  res.status(Status.OK).json({
    status: "success",
    data: users,
    message: "Users fetched successfully",
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await Model.User.findByPk(id, {
    attributes: [
      "id",
      "email",
      "full_name"
    ],
    raw: true,
  });

  if (!user) {
    return next(new AppError("User not found", Status.NOT_FOUND));
  }

  res.status(Status.OK).json({
    status: "success",
    data: user,
    message: "User fetched successfully",
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { full_name, profile_image } = req.body;

  const user = await Model.User.findByPk(id);

  if (!user) return next(new AppError("User not found", Status.NOT_FOUND));

  let imageUrl = user.profile_image;
  let public_id = user.image_public_id;

  if (profile_image) {
    if (public_id) await deleteImage(public_id);
    const upload = await uploadBase64(profile_image, "users");
    imageUrl = upload.url;
    public_id = upload.public_id;
  }

  await Model.User.update(
    { full_name, profile_image: imageUrl, image_public_id: public_id },
    { where: { id } }
  );

  res.status(Status.CREATED).json({
    status: "success",
    message: "Profile updated.",
  });
});


exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("User ID is required", Status.BAD_REQUEST));
  }

  const deleted = await Model.User.destroy({
    where: { id },
  });

  if (!deleted) {
    return next(new AppError("User not found or already deleted", Status.NOT_FOUND));
  }

  res.status(Status.OK).json({
    status: "success",
    message: "User deleted successfully",
  });
});
