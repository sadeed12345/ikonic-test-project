require("dotenv").config(); // for accessing variables from .env file from anywhere in the project

// If 'db' variable doesn't exist
if (typeof db === "undefined") {
  // Connect to the database
  var db = require("./models/index");
}

const express = require("express");

const expressSession = require("express-session");
const SessionStore = require("express-session-sequelize")(expressSession.Store);
const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const swaggerFile = require("./swagger_output.json");
const bodyParser = require("body-parser");

const env = process.env.NODE_ENV;

let routePrefix = "/" + env;

const isBackendNonHttp = env === "dev"; // backend env: "dev" means backend is hosted on http
const port = process.env.PORT || 8090;

const Logger = require("./handlers/logger");
const morganMiddleware = require("./handlers/morganMiddleware");
const authenticationHandler = require("./handlers/authenticationHandler");

const loginRoutes = require("./routes/login.routes");

const customConfigurations = require("./config/customConfigurations");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(morganMiddleware); // for logging all API requests
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);


const sevenDays = 1000 * 60 * 60 * 24 * 7;
const sequelizeSessionStore = new SessionStore({
  db: db.sequelize,
});

// We use expressSession for the rest of the project
app.use(
  expressSession({
    name: `ddbnhm`,
    secret: customConfigurations.expressSessionSecret,
    resave: false,
    //resave: true, // true > refreshes session timeout on subsequent API calls.
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // blocks javascript interaction with cookie.
      secure: !isBackendNonHttp, // When true, session will only work with HTTPS.
      maxAge: sevenDays,
      sameSite: isBackendNonHttp ? "lax" : "none", // When none, secure option must be true.
    },
    store: sequelizeSessionStore,
  })
);

// No route prefix in dev environments
if (routePrefix.includes("dev")) {
  routePrefix = "";
}

// Attach cache control headers for cookies to all http requests
app.all("*", (req, res, next) => {
  Logger.info("req.url: " + req.url);
  res.set("Cache-Control", "no-cache='Set-Cookie, Set-Cookie2'");
  req.db = db; // DB connection around the app
  next();
});

// Store the session cookie in a temp variable
app.use((req, res, next) => {
  // Store a copy of the session cookie in a temporary variable
  req.tempSession = req.session.userInfo;
  next();
});




// ** AUTHENTICATION NOT Required ** //
app.use(routePrefix + "/user", loginRoutes);

// app.use(routePrefix + "/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
// ** AUTHENTICATION Required for below Routes ** //
app.use(authenticationHandler.validateSession);

app.use(routePrefix + "/", baseRoutes);

app.use(routePrefix + "/user", userRoutes);




// If No route matches then handle invalid requests here
app.all("*", (req, res) => {
  res.status(404).send({
    message: "The resource you are looking for does not exist.",
  });
});

app.listen(port);

Logger.info("server started on port :" + port);

(async () => {
  try {
    await db.sequelize.authenticate();
    db.sequelize.connectionManager.initPools();
    console.log("DB connected successfully");
  } catch (err) {
    Logger.info("DB connection error: " + err.message);
    db.sequelize = db.loadSequelize();
  }
})();