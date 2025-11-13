const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET;

exports.signup = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already exists");

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash },
  });

  return { id: user.id, email: user.email };
};

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "7d" });
  return token;
};
exports.googleLogin = async ({ googleId, name, email }) => {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        provider: "google",
        providerId: googleId,
      },
    });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "7d" });
  return token;
};
exports.getUser = async (authHeader) => {
  if (!authHeader) throw new Error("Missing token");
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  return { id: user.id, email: user.email, name: user.name };
};
