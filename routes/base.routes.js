const BaseController = require("../controllers/base.controller");
const express = require("express");

const Router = express.Router({
  mergeParams: true,
});

Router.post("/discover", BaseController.getUserFromSession);
Router.post("/discover", BaseController.getUserFromSession);



module.exports = Router;
