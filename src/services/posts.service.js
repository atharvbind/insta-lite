
const prisma = require("../db");

async function createPost(data) {
  return prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      ...(data.caption !== undefined && { caption: data.caption }),
      ...(data.location !== undefined && { location: data.location }),
    },
  });
}

async function listPosts() {
  return prisma.post.findMany();
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
  });
}

async function updatePost(id, data) {
  const updateData = {};

  if (data.caption !== undefined) {
    updateData.caption = data.caption;
  }

  if (data.location !== undefined) {
    updateData.location = data.location;
  }

  return prisma.post.update({
    where: { id },
    data: updateData,
  });
}

async function deletePost(id) {
  return prisma.post.delete({
    where: { id },
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
