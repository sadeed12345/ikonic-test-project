const LoginController = require("../controllers/login.controller.js");

const express = require("express");

const Router = express.Router({
  mergeParams: true,
});



// ***********************************************************************************************************
// ***************************************************Version2************************************************

// Log user in.
Router.post("/login", LoginController.loginProcess);

Router.post("/register", LoginController.registerProcess);

// ***********************************************************************************************************
// ***************************************************Version2************************************************


module.exports = Router;
