const express = require("express");
const router = express.Router();
const controller = require("./canvas.controller");

router.get("/:projectId", controller.getCanvas);
router.post("/:projectId", controller.saveCanvas);

module.exports = router;
