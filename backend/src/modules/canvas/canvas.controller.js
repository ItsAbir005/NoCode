const service = require("./canvas.service");

exports.getCanvas = async (req, res) => {
  try {
    const { projectId } = req.params;
    const canvas = await service.getCanvas(projectId);
    res.json({ canvas });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.saveCanvas = async (req, res) => {
  try {
    const { projectId } = req.params;
    const layout = req.body.layout;
    const canvas = await service.saveCanvas(projectId, layout);
    res.json({ message: "Canvas saved successfully", canvas });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
