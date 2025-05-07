const Model = require("../models/index");
const bcrypt = require("bcryptjs");
const Status = require("../utils/statusCodes");
const { signJwtToken } = require("../utils/jwt");
const { AppError, catchAsync } = require("../utils/appError");
const { isValidateEmail, isValidatePassword } = require("../utils/validators");

exports.registerUser = catchAsync(async (req, res, next) => {
  const { full_name, email, password } = req.body;

  if (!isValidateEmail(email)) {
    return next(
      new AppError("Please provide a valid email address (e.g. user@example.com)", Status.BAD_REQUEST)
    );
  }

  if (!isValidatePassword(password)) {
    return next(
      new AppError("Password must be at least 8 characters long and include at least one number and one special character (e.g., !@#$%^&*)", Status.BAD_REQUEST)
    );
  }

  const existingEmail = await Model.User.findOne({ where: { email } });
  if (existingEmail) {
    return next(new AppError("Email already in use", Status.CONFLICT));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Model.User.create({
    full_name,
    email,
    password: hashedPassword,
    profile_image: ""
  });

  res.status(Status.CREATED).json({
    status: "success",
    message: `Registered successfully`,
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return next(
      new AppError("Please provide email and password", Status.BAD_REQUEST)
    );
  }
  const whereCondition = {};
  if (email) {
    whereCondition.email = email;
  }

  const user = await Model.User.findOne({
    where: whereCondition,
    raw: true,
  });

  if (!user) {
    return next(new AppError("Invalid credentials", Status.UNAUTHORIZED));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", Status.UNAUTHORIZED));
  }

  const loggedInUser = { ...user };
  delete loggedInUser.password;

  const token = signJwtToken(loggedInUser);

  res.status(Status.OK).json({
    status: "success",
    message: "Login successful",
    user: loggedInUser,
    token,
  });
});
