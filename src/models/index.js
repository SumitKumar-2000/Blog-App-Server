const User = require("./user.model");
const Blog = require("./blog.model");
const Comment = require("./comment.model");
const Category = require("./category.model");

// Blog associations
Blog.belongsTo(User, { foreignKey: "user_id" });
Blog.hasMany(Comment, { foreignKey: "blog_id" });

// Comment associations
Comment.belongsTo(User, { foreignKey: "user_id" });
Comment.belongsTo(Blog, { foreignKey: "blog_id" });

// Category many-to-many with Blog
Blog.belongsToMany(Category, {
  through: "blog_categories",
  foreignKey: "blog_id",
});
Category.belongsToMany(Blog, {
  through: "blog_categories",
  foreignKey: "category_id",
});

module.exports = {
  User,
  Blog,
  Comment,
  Category,
};
