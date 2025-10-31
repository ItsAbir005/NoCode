const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createProject = async (userId, { name }) =>
  prisma.project.create({ data: { name, userId } });

exports.getProjects = async (userId) =>
  prisma.project.findMany({
    where: { userId },
    include: { workflows: true },
  });

exports.deleteProject = async (userId, id) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== userId)
    throw new Error("Not authorized");
  await prisma.project.delete({ where: { id } });
};

exports.createWorkflow = async (projectId, userId, { name, description }) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.userId !== userId) throw new Error("Not authorized");
  return prisma.workflow.create({ data: { name, description, projectId } });
};

exports.getWorkflows = async (projectId) =>
  prisma.workflow.findMany({ where: { projectId } });
