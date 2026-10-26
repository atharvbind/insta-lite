const prisma = require("../db");

async function getPostLikes(postId) {
  const post = await prisma.post.findUnique({
    where: { id: Number(postId) },
    select: { id: true },
  });

  if (!post) {
    return null;
  }

  return prisma.like.findMany({
    where: { postId: Number(postId) },
    orderBy: {
      user: {
        username: "asc",
      },
    },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
    },
  }).then((likes) => likes.map((like) => like.user));
}

async function userExists(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true },
  });

  return Boolean(user);
}

async function postExists(postId) {
  const post = await prisma.post.findUnique({
    where: { id: Number(postId) },
    select: { id: true },
  });

  return Boolean(post);
}

async function createLike(userId, postId) {
  return prisma.like.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
    },
    select: {
      userId: true,
      postId: true,
      createdAt: true,
    },
  });
}

async function deleteLike(userId, postId) {
  return prisma.like.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

module.exports = {
  getPostLikes,
  userExists,
  postExists,
  createLike,
  deleteLike,
};