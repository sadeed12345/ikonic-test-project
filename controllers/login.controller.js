const bcrypt = require("bcryptjs");
const Logger = require("../handlers/logger");
const customConfigurations = require("../config/customConfigurations");
const {
  handleErrorResponse,
  ErrorHandler,
} = require("../handlers/errorHandler");


exports.registerProcess = async (req, res) => {
  try {
    const db = req.db;

    const role = req.body.role;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const genderId = req.body.genderId;
    const email = req.body.email.toLowerCase();
    const registrationDate = req.body.registrationDate;
    const password = req.body.password;

    // Validate the input
    if (!role || !firstName || !lastName || !genderId || !email || !registrationDate || !password) {
      throw new ErrorHandler(400, "Invalid inputs", true);
    }

    // Check if the email is valid
    var emailRegexp = new RegExp(customConfigurations.emailRegex);
    if (!emailRegexp.test(email)) {
      throw new ErrorHandler(400, "Invalid email", true);
    }

    // Check if email already exists
    const count = await db.Users.count({ where: { email: email } });
    if (count > 0) {
      throw new ErrorHandler(409, "Email already exists", true);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Start database transaction
    const tran = await db.sequelize.transaction();

    try {
      // Create new user
      const newUser = await db.Users.create({
        roleId: role,
        firstName: firstName[0].toUpperCase() + firstName.substring(1),
        lastName: lastName[0].toUpperCase() + lastName.substring(1),
        genderId: genderId,
        email: email,
        registrationDate: registrationDate,
        password: passwordHash
      }, { transaction: tran });

      // Commit the transaction
      await tran.commit();

      Logger.info("registerProcess: User registration successful");

      // Return success response
      return res.send({
        userId: newUser.id,
        userName: email,
        message: "Registration successful"
      });
    } catch (err) {
      // Rollback the transaction in case of error
      await tran.rollback();
      return handleErrorResponse(err, res, "registerProcess: User registration failed");
    }
  } catch (err) {
    return handleErrorResponse(err, res, "registerProcess");
  }
};


exports.loginProcess = async (req, res) => {
  try {
    const db = req.db;

    const userName = req.body.username;
    const password = req.body.password;

    // Validate request
    if (!userName || !password) {
      throw new ErrorHandler(400, "Invalid inputs", true);
    }

    // Fetch user details
    const userDetails = await db.Login.findOne({
      where: { username: userName },
      include: [{
        model: db.Users,
        attributes: ["firstName", "lastName", "roleId"]
      }],
    }).catch((err) => {
      return handleErrorResponse(err, res, "Login: Fetching user failed");
    });

    if (!userDetails) {
      throw new ErrorHandler(401, "Invalid Credentials.", true);
    }

    // Check passwords
    const isPasswordValid = await bcrypt.compare(password, userDetails.password);

    if (isPasswordValid) {
      // Simplified user data to return
      const userData = {
        userId: userDetails.User.id,
        userName: userDetails.username,
        firstName: userDetails.User.firstName,
        lastName: userDetails.User.lastName,
        roleId: userDetails.User.roleId,
      };

      Logger.info("Login: Success for " + userDetails.username);
      return res.send(userData);
    } else {
      throw new ErrorHandler(401, "Invalid Credentials.", true);
    }
  } catch (err) {
    return handleErrorResponse(err, res, "Login");
  }
};




