const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err.name === "CastError") {
    statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    err.message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  if (err.code === 11000) {
    statusCode = 400;
    err.message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { errorHandler };

  
  