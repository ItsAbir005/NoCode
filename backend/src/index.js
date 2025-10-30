const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./modules/auth/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send(" No-Code Platform Backend Running"));
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
