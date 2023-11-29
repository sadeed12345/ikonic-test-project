const usersController = require("../controllers/users.controller.js");
const express = require("express");

const Router = express.Router({
  mergeParams: true,
});



// ***********************************************************************************************************
// ***************************************************Version2************************************************

// Logout a user
Router.post("/logout", usersController.logoutProcess);
// retrieve  User by id
Router.post("/getUser", usersController.getUserById);

// ***********************************************************************************************************
// ***************************************************Version2************************************************

module.exports = Router;
