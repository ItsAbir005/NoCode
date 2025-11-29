const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/passport");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.get("/", (req, res) => res.send("No-Code Platform Backend Running"));
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));