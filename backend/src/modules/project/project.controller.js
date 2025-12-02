const service = require("./project.service");
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await service.getAllProjects(req.user.id);
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await service.getProjectById(req.params.id, req.user.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = await service.createProject(req.user.id, req.body);
    res.status(201).json({ 
      message: "Project created successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await service.updateProject(
      req.params.id, 
      req.user.id, 
      req.body
    );
    res.json({ 
      message: "Project updated successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await service.deleteProject(req.params.id, req.user.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePages = async (req, res) => {
  try {
    const project = await service.updateProjectField(
      req.params.id,
      req.user.id,
      "pages",
      req.body.pages
    );
    res.json({ 
      message: "Pages updated successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateComponents = async (req, res) => {
  try {
    const project = await service.updateProjectField(
      req.params.id,
      req.user.id,
      "components",
      req.body.components
    );
    res.json({ 
      message: "Components updated successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateWorkflows = async (req, res) => {
  try {
    const project = await service.updateProjectField(
      req.params.id,
      req.user.id,
      "workflows",
      req.body.workflows
    );
    res.json({ 
      message: "Workflows updated successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateDatabase = async (req, res) => {
  try {
    const project = await service.updateProjectField(
      req.params.id,
      req.user.id,
      "database",
      req.body.database
    );
    res.json({ 
      message: "Database schema updated successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const project = await service.updateProjectField(
      req.params.id,
      req.user.id,
      "settings",
      req.body.settings
    );
    res.json({ 
      message: "Settings updated successfully", 
      project 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};