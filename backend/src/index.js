const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/passport");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/project/project.routes");
const aiRoutes = require('./modules/ai/ai.routes');

const app = express();

// CORS Configuration - Allow both development and production URLs
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative local port
  'https://no-code-sigma.vercel.app', // Your Vercel production URL
  process.env.CLIENT_URL             // From environment variable
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get("/", (req, res) => res.send("No-Code Platform Backend Running"));

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use('/ai', aiRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});