const { catchAsync, AppError } = require("../utils/appError");
const {deleteImage, uploadBase64} = require("../utils/cloudnary");
const Status = require("../utils/statusCodes");
const Model = require("../models/index");

const getBlogFromUser = async (id, user_id) => {
  return await Model.Blog.findOne({
    where: { id, user_id },
    raw: true,
  });
};

exports.createBlog = catchAsync(async (req, res, next) => {
  const user_id = req.user?.id;
  const { title, description, image } = req.body;

  if (!title || !description) {
    return next(new AppError("Title and Description required", 400));
  }

  let imageUrl = "", public_id = "";

  if (image) {
    const upload = await uploadBase64(image, "blogs");
    imageUrl = upload.url;
    public_id = upload.public_id;
  }

  const newBlog = await Model.Blog.create({
    title,
    description,
    image: imageUrl,
    image_public_id: public_id,
    user_id,
  });

  res.status(Status.CREATED).json({
    status: "success",
    message: "Blog created successfully.",
    data: newBlog,
  });
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = page * limit;

  const blogs = await Model.Blog.findAll({
    limit,
    offset,
    raw: true,
    order: [["created_at", "DESC"]],
  });

  res.status(Status.OK).json({
    status: "success",
    message: "All blogs fetched successfully.",
    data: blogs,
  });
});

exports.getAllBlogsByUser = catchAsync(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = page * limit;

  const user_id = req.user?.id;

  if (!user_id) {
    return next(new AppError("Invalid user. Please log in again.", Status.UNAUTHORIZED));
  }

  const whereCondition = { user_id };

  const blogs = await Model.Blog.findAll({
    where: whereCondition,
    limit,
    offset,
    raw: true,
    order: [["created_at", "DESC"]],
  });

  res.status(Status.OK).json({
    status: "success",
    message: "Blog fetched successfully.",
    data: blogs,
  });
});

exports.getBlogById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  if (!id) {
    return next(new AppError("Blog ID is required.", Status.UNAUTHORIZED));
  }

  const blog = await getBlogFromUser(id, user_id);

  if (!blog) {
    return next(new AppError("Blog not found", Status.NOT_FOUND));
  }

  res.status(Status.OK).json({
    status: "success",
    message: "Blog fetched successfully.",
    data: blog,
  });
});

exports.updateBlogById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user?.id;
  const { title, description, image } = req.body;

  const blog = await getBlogFromUser(id, user_id);

  if (!blog) {
    return next(new AppError("Blog not found", Status.NOT_FOUND));
  }

  let imageUrl = blog.image;
  let public_id = blog.image_public_id;

  if (image) {
    if (public_id) await deleteImage(public_id);
    const upload = await uploadBase64(image, "blogs");
    imageUrl = upload.url;
    public_id = upload.public_id;
  }

  await Model.Blog.update(
    { title, description, image: imageUrl, image_public_id: public_id },
    { where: { id, user_id } }
  );

  res.status(Status.CREATED).json({
    status: "success",
    message: "Blog updated successfully.",
  });
});

exports.deleteBlogById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  if (!id) {
    return next(new AppError("Blog ID is required for deletion.", Status.BAD_REQUEST));
  }

  const blog = await getBlogFromUser(id, user_id);

  if (!blog) {
    return next(new AppError("Blog not found.", Status.NOT_FOUND));
  }

  let public_id = blog.image_public_id;
  if (public_id) await deleteImage(public_id);

  await Model.Blog.destroy({ where: { id, user_id } });

  res.status(Status.OK).json({
    status: "success",
    message: "Blog deleted successfully.",
  });
});
