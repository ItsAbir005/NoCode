// backend/src/modules/auth/auth.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/me", controller.getUser);

module.exports = router;
