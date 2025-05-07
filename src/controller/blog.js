const { catchAsync, AppError } = require("../utils/appError");
const {deleteImage, uploadBase64} = require("../utils/cloudnary");
const sequelize = require("../config/database");
const Status = require("../utils/statusCodes");
const helper = require("../utils/helper");
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

  const { count, rows: blogs } = await Model.Blog.findAndCountAll({
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Model.User,
        as: "user",
        attributes: ["full_name"],
      },
    ],
    attributes: {
      include: [
        [sequelize.literal(helper.rawQueryFormatDate("blogs.created_at","DD Mon YYYY HH12:MI AM")), "formatted_created_at"],
      ],
    },
  });

  const lastPage = Math.ceil(count / limit);

  res.status(Status.OK).json({
    status: "success",
    message: "All blogs fetched successfully.",
    data: blogs,
    pagination: {
      currentPage: page + 1,
      lastPage,
      totalItems: count,
    },
  });
});


exports.getAllBlogsByUser = catchAsync(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = page * limit;

  const user_id = req.user?.id;
  console.log("user_id: ", user_id)
  
  if (!user_id) {
    return next(new AppError("Invalid user. Please log in again.", Status.UNAUTHORIZED));
  }

  const whereCondition = { user_id };

  const { count, rows: blogs } = await Model.Blog.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Model.User,
        as: "user",
        attributes: ["full_name"],
      },
    ],
    attributes: {
      include: [
        [
          sequelize.literal(
            helper.rawQueryFormatDate("blogs.created_at", "DD Mon YYYY HH12:MI AM")
          ),
          "formatted_created_at",
        ],
      ],
    },
  });

  const lastPage = Math.ceil(count / limit);

  res.status(Status.OK).json({
    status: "success",
    message: "Blogs fetched successfully.",
    data: blogs || [],
    pagination: {
      currentPage: page + 1,
      lastPage,
      totalItems: count,
    },
  });
});

exports.getBlogByIdPublic = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("Blog ID is required.", Status.BAD_REQUEST));
  }

  const blog = await Model.Blog.findOne({
    where: { id },
    include: [
      {
        model: Model.User,
        as: "user",
        attributes: ["id", "full_name"],
      },
      {
        model: Model.Comment,
        as: "comments",
        attributes: ["id", "content", "created_at"],
        include: [
          {
            as: "user",
            model: Model.User,
            attributes: ["id", "full_name"],
          },
        ]
      },
    ],
    attributes: {
      include: [
        [sequelize.literal(helper.rawQueryFormatDate("blogs.created_at","DD Mon YYYY HH12:MI AM")), "formatted_created_at"],
      ],
    },
  });

  if (!blog) {
    return next(new AppError("Blog not found", Status.NOT_FOUND));
  }

  res.status(Status.OK).json({
    status: "success",
    message: "Blog fetched successfully.",
    data: blog,
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
