const winston = require("winston");

// const isDevelopment = process.env.NODE_ENV.includes("dev");
const isBackendNonHttp = process.env.NODE_ENV === "dev"; // backend env: "dev" means backend is hosted locally

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  // return isDevelopment ? "debug" : "warn";
  return "debug";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms Z" }),
  winston.format.printf(
    (info) => info.timestamp + " - " + info.level + " - " + info.message
  )
);

winston.addColors(colors);

const colorizeFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms Z" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => info.timestamp + " - " + info.level + " - " + info.message
  )
);

const transports = [
  new winston.transports.Console({
    format: isBackendNonHttp ? colorizeFormat : format, // colorizeFormat,
  }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  new winston.transports.File({ filename: "logs/all.log" }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

module.exports = Logger;
