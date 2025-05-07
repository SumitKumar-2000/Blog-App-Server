const { AppError, catchAsync } = require("../utils/appError");
const { verifyJwtToken } = require("../utils/jwt");
const Status = require("../utils/statusCodes");

module.exports = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new AppError("You are not logged in", Status.UNAUTHORIZED));
  }

  const decoded = verifyJwtToken(token);
  req.user = decoded.user;
  next();
});
