
const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      ...(data.bio !== undefined && { bio: data.bio }),
    },
  });
}

async function listUsers() {
  return prisma.user.findMany();
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

async function updateUser(id, data) {
  const updateData = {};

  if (data.fullname !== undefined) {
    updateData.fullname = data.fullname;
  }

  if (data.bio !== undefined) {
    updateData.bio = data.bio;
  }

  if (data.isPrivate !== undefined) {
    updateData.isPrivate = data.isPrivate;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  });
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
