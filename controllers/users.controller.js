
const Logger = require("../handlers/logger");
const snsHandler = require("../handlers/snsHandler");

const {
  handleErrorResponse,
  ErrorHandler,
} = require("../handlers/errorHandler");


exports.logoutProcess = (req, res) => {
  const db = req.db;

  const _token = req.body.token ? req.body.token : "";

  db.userDeviceTokens.destroy({
    where: { token: _token },
  });

  snsHandler.deleteEndPoint(db, _token);

  // Destroy Express Session and return response in callback
  req.session.destroy(() => {
    Logger.info("logout: Success");
    res.clearCookie("ddbnhm", { path: "/" });
    return res.send({
      message: "Success",
    });
  });
};

// Retrieve User by Id
exports.getUserById = (req, res) => {
  try {
    const db = req.db;

    const userId = req.body.userId;

    // Validate request
    if (isNaN(userId) || userId < 1) {
      throw new ErrorHandler(400, "Invalid inputs", true);
    }

    // Fetch basic user details
    db.Users.findByPk(userId, {
      attributes: ["firstName", "lastName", "email", "roleId", "genderId", "createdAt"], // Adjust attributes as needed
      include: [
        {
          model: db.Roles,
          attributes: ["roleName"],
        },
        {
          model: db.genders,
          attributes: ["name"],
        }
      ],
      raw: true,
    })
    .then((data) => {
      if (!data) {
        throw new ErrorHandler(404, "User not found", true);
      }
      return res.send(data);
    })
    .catch((err) => {
      return handleErrorResponse(err, res, "getUser");
    });
  } catch (err) {
    return handleErrorResponse(err, res, "getUser");
  }
};

