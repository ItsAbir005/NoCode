// backend/src/modules/auth/auth.controller.js
const service = require("./auth.service");

exports.signup = async (req, res) => {
  try {
    const user = await service.signup(req.body);
    res.json({ message: "User created", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await service.login(req.body);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await service.getUser(req.headers.authorization);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
