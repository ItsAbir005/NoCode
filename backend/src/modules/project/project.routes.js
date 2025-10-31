const express = require("express");
const router = express.Router();
const controller = require("./project.controller");
const auth = require("../../middleware/authMiddleware");

router.post("/", auth, controller.createProject);
router.get("/", auth, controller.getProjects);
router.delete("/:id", auth, controller.deleteProject);

router.post("/:id/workflow", auth, controller.createWorkflow);
router.get("/:id/workflows", auth, controller.getWorkflows);

module.exports = router;
