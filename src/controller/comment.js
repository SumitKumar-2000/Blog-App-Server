const { catchAsync, AppError } = require("../utils/appError");
const Status = require("../utils/statusCodes");
const Model = require("../models/index");

exports.createComment = catchAsync(async (req, res, next) => {
  const user_id = req.user?.id;
  const { content } = req.body;
  const { id: blog_id } = req.params;

  if (!content) {
    return next(new AppError("Content is required.", Status.BAD_REQUEST));
  }

  const blogExists = await Model.Blog.findByPk(blog_id);
  if (!blogExists) {
    return next(new AppError("Blog not found.", Status.NOT_FOUND));
  }

  const newComment = await Model.Comment.create({
    blog_id,
    user_id,
    content,
  });

  res.status(Status.CREATED).json({
    status: "success",
    message: "Comment added successfully.",
    data: newComment,
  });
});

exports.getCommentsByBlog = catchAsync(async (req, res, next) => {
  const { id: blog_id } = req.params;

  const comments = await Model.Comment.findAll({
    where: { blog_id },
    include: [{ model: Model.User, attributes: ["id", "full_name", "email"] }],
    order: [["created_at", "ASC"]],
  });

  res.status(Status.OK).json({
    status: "success",
    message: "Comments fetched successfully.",
    data: comments,
  });
});

// Delete a comment
exports.deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  const comment = await Model.Comment.findByPk(id);
  if (!comment) {
    return next(new AppError("Comment not found.", Status.NOT_FOUND));
  }

  if (comment.user_id !== user_id) {
    return next(new AppError("Unauthorized to delete this comment.", Status.FORBIDDEN));
  }

  await Model.Comment.destroy({ where: { id } });

  res.status(Status.OK).json({
    status: "success",
    message: "Comment deleted successfully.",
  });
});
