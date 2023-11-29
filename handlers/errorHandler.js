const Logger = require("./logger");

class ErrorHandler extends Error {
  constructor(statusCode, message, isCustomError) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.isCustomError = isCustomError;
  }
}

const handleErrorResponse = (err, res, errorOrigin) => {
  const {
    statusCode = 500, // default value
    message = "something went wrong", // default value
    isCustomError = false, // default value
  } = err;

  Logger.error(errorOrigin + ": " + err.message);

  // const listStatusCodes = {
  //   OK: 200,
  //   Created: 201,
  //   Bad_Request: 400,
  //   Unauthorized: 401,
  //   Forbidden: 403,
  //   Not_Found: 404,
  //   Internal_Server_Error: 500,
  // };

  // res.status(listStatusCodes[statusCode]).json({
  return res.status(statusCode).json({
    // status: "error",
    // statusCode: statusCode,
    message: isCustomError ? message : "something went wrong.",
  });
};

module.exports = {
  ErrorHandler,
  handleErrorResponse,
};
