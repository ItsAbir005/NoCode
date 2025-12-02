const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const controller = require("./project.controller");
router.use(authMiddleware);

router.get("/", controller.getAllProjects);
router.get("/:id", controller.getProjectById);
router.post("/", controller.createProject);
router.put("/:id", controller.updateProject);
router.delete("/:id", controller.deleteProject);

router.put("/:id/pages", controller.updatePages);
router.put("/:id/components", controller.updateComponents);
router.put("/:id/workflows", controller.updateWorkflows);
router.put("/:id/database", controller.updateDatabase);
router.put("/:id/settings", controller.updateSettings);

module.exports = router;