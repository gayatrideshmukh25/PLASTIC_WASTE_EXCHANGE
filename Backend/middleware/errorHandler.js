export const errorHandler = (err, req, resp, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;

  resp.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
