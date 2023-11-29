const morgan = require("morgan");
const Logger = require("./logger");

// Override the stream method by telling
// Morgan to use our custom logger instead of the console log.
const stream = {
  // Use the http severity
  write: (message) => Logger.http(message),
};

// Skip Morgan http logging if env is not dev
const skip = () => {
  const isDevelopment = process.env.NODE_ENV.includes("dev");
  // return !isDevelopment;
  return false; // http logging enabled always
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format tokens are defined inside the Morgan library.
  ":method :url :status :res[content-length] - :response-time ms",
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

module.exports = morganMiddleware;
