const User = require("./user.model");
const Blog = require("./blog.model");
const Comment = require("./comment.model");
const Category = require("./category.model");

Blog.belongsTo(User, { foreignKey: "user_id", as: "user" });
Blog.hasMany(Comment, { foreignKey: "blog_id", as: "comments" });

Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });
Comment.belongsTo(Blog, { foreignKey: "blog_id", as: "blog" });

Blog.belongsToMany(Category, {
  through: "blog_categories",
  foreignKey: "blog_id",
  otherKey: "category_id",
  as: "categories",
});

Category.belongsToMany(Blog, {
  through: "blog_categories",
  foreignKey: "category_id",
  otherKey: "blog_id",
  as: "blogs",
});

module.exports = {
  User,
  Blog,
  Comment,
  Category,
};
