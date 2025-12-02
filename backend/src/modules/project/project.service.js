const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require("../../generated/prisma");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const DEFAULT_PROJECT_STRUCTURE = {
  pages: [],
  components: {},
  workflows: {},
  database: {
    tables: [],
    relationships: []
  },
  settings: {
    theme: 'light',
    primaryColor: '#4F46E5',
    fontFamily: 'Inter'
  }
};
exports.getAllProjects = async (userId) => {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      thumbnail: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      pages: false,
      components: false,
      workflows: false,
      database: false,
      settings: false
    }
  });

  return projects;
};

exports.getProjectById = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      userId 
    }
  });

  if (!project) {
    throw new Error("Project not found or you don't have access");
  }

  return project;
};
exports.createProject = async (userId, data) => {
  const { name, description, thumbnail } = data;

  if (!name || name.trim().length === 0) {
    throw new Error("Project name is required");
  }
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      thumbnail: thumbnail || null,
      status: 'draft',
      userId,
      pages: DEFAULT_PROJECT_STRUCTURE.pages,
      components: DEFAULT_PROJECT_STRUCTURE.components,
      workflows: DEFAULT_PROJECT_STRUCTURE.workflows,
      database: DEFAULT_PROJECT_STRUCTURE.database,
      settings: DEFAULT_PROJECT_STRUCTURE.settings
    }
  });

  return project;
};

exports.updateProject = async (projectId, userId, data) => {
  const existing = await this.getProjectById(projectId, userId);
  const { name, description, thumbnail, status } = data;
  
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (thumbnail !== undefined) updateData.thumbnail = thumbnail || null;
  if (status !== undefined) {
    if (!['draft', 'active', 'archived'].includes(status)) {
      throw new Error("Invalid status. Must be: draft, active, or archived");
    }
    updateData.status = status;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: updateData
  });

  return project;
};

exports.deleteProject = async (projectId, userId) => {
  await this.getProjectById(projectId, userId);
  
  await prisma.project.delete({
    where: { id: projectId }
  });

  return true;
};

exports.updateProjectField = async (projectId, userId, field, value) => {
  await this.getProjectById(projectId, userId);
  const validFields = ['pages', 'components', 'workflows', 'database', 'settings'];
  if (!validFields.includes(field)) {
    throw new Error(`Invalid field: ${field}`);
  }
  if (typeof value !== 'object' || value === null) {
    throw new Error(`${field} must be an object or array`);
  }

  const updateData = {
    [field]: value
  };

  const project = await prisma.project.update({
    where: { id: projectId },
    data: updateData
  });

  return project;
};

exports.getProjectStats = async (userId) => {
  const total = await prisma.project.count({
    where: { userId }
  });

  const active = await prisma.project.count({
    where: { 
      userId,
      status: 'active'
    }
  });

  const draft = await prisma.project.count({
    where: { 
      userId,
      status: 'draft'
    }
  });

  const archived = await prisma.project.count({
    where: { 
      userId,
      status: 'archived'
    }
  });

  return {
    total,
    active,
    draft,
    archived
  };
};