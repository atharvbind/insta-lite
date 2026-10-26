const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      bio: data.bio ?? null,
      isPrivate: data.isPrivate ?? false,
    },
  });
}

async function getUsers(query) {
  const where = {};

  if (query.isPrivate !== undefined) {
    where.isPrivate = query.isPrivate === "true";
  }

  if (query.search !== undefined && query.search !== "") {
    where.OR = [
      {
        username: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        fullname: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.hasPosts === "true") {
    where.posts = { some: {} };
  } else if (query.hasPosts === "false") {
    where.posts = { none: {} };
  }

  const page = query.page;
  const limit = query.limit;
  const skip = query.skip;

  const sortBy = query.sortBy || "createdAt";
  const order = query.order || "desc";

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

async function updateUser(id, data) {
  const allowedData = {};

  for (const field of ["username", "email", "fullname", "bio", "isPrivate"]) {
    if (data[field] !== undefined) {
      allowedData[field] = data[field];
    }
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: allowedData,
  });
}

async function deleteUser(id) {
  return prisma.user.delete({
    where: { id: Number(id) },
  });
}

async function getUserPosts(id, pagination) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  const where = { authorId: Number(id) };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

async function getUserLikedPosts(id, pagination) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  const where = {
    likes: {
      some: {
        userId: Number(id),
      },
    },
  };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
};