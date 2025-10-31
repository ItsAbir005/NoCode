const service = require("./project.service");

exports.createProject = async (req, res) => {
  try {
    const project = await service.createProject(req.user.id, req.body);
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await service.getProjects(req.user.id);
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await service.deleteProject(req.user.id, parseInt(req.params.id));
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createWorkflow = async (req, res) => {
  try {
    const workflow = await service.createWorkflow(
      parseInt(req.params.id),
      req.user.id,
      req.body
    );
    res.json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWorkflows = async (req, res) => {
  try {
    const workflows = await service.getWorkflows(parseInt(req.params.id));
    res.json(workflows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
