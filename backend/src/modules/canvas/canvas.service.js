const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCanvas = async (projectId) => {
  const canvas = await prisma.canvas.findUnique({ where: { projectId: Number(projectId) } });
  if (!canvas) return { layout: [] };
  return canvas;
};

exports.saveCanvas = async (projectId, layout) => {
  const existing = await prisma.canvas.findUnique({ where: { projectId: Number(projectId) } });

  if (existing) {
    return await prisma.canvas.update({
      where: { projectId: Number(projectId) },
      data: { layout },
    });
  }

  return await prisma.canvas.create({
    data: { projectId: Number(projectId), layout },
  });
};
