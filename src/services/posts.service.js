const prisma = require("../db");

const postRelations = {
  author: {
    select: {
      id: true,
      username: true,
      fullname: true,
    },
  },
  _count: {
    select: {
      likes: true,
    },
  },
};

async function createPost(data) {
  return prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      authorId: Number(data.authorId),
      caption: data.caption ?? null,
      location: data.location ?? null,
    },
  });
}

async function getPosts(query) {
  const where = {};

  if (query.location !== undefined && query.location !== "") {
    where.location = {
      equals: query.location,
      mode: "insensitive",
    };
  }

  if (query.search !== undefined && query.search !== "") {
    where.caption = {
      contains: query.search,
      mode: "insensitive",
    };
  }

  if (query.from !== undefined || query.to !== undefined) {
    where.createdAt = {};

    if (query.from !== undefined) {
      where.createdAt.gte = new Date(query.from);
    }

    if (query.to !== undefined) {
      where.createdAt.lt = new Date(query.to);
    }
  }

  const sortBy = query.sortBy || "createdAt";
  const order = query.order || "desc";

  let orderBy;

  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip: query.skip,
      take: query.limit,
      include: postRelations,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    include: postRelations,
  });
}

async function updatePost(id, data) {
  const allowedData = {};

  for (const field of ["imageUrl", "caption", "location"]) {
    if (data[field] !== undefined) {
      allowedData[field] = data[field];
    }
  }

  // authorId is intentionally ignored during updates.
  return prisma.post.update({
    where: { id: Number(id) },
    data: allowedData,
    include: postRelations,
  });
}

async function deletePost(id) {
  return prisma.post.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};