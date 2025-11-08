const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/project/project.routes");
const canvasRoutes = require("./modules/canvas/canvas.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const workflowRoutes = require('./modules/workflow/workflow.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("No-Code Platform Backend Running"));
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/canvas", canvasRoutes);
app.use("/ai", aiRoutes);
app.use('/', workflowRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));