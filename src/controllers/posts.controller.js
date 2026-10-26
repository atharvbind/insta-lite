const postsService = require("../services/posts.service");
const {
  getPagination,
  isValidId,
} = require("../utils/pagination");

const POST_SORT_FIELDS = ["createdAt", "updatedAt", "likes"];

function sendPrismaError(res, error) {
  if (error.code === "P2002") {
    return res.status(409).json({ error: "Already exists" });
  }

  if (error.code === "P2003") {
    return res.status(404).json({ error: "User not found" });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ error: "Post not found" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

async function createPost(req, res) {
  const { imageUrl, authorId } = req.body;

  if (
    !imageUrl ||
    authorId === undefined ||
    authorId === null ||
    authorId === ""
  ) {
    return res.status(400).json({
      error: "imageUrl and authorId are required",
    });
  }

  if (!Number.isInteger(Number(authorId)) || Number(authorId) <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const post = await postsService.createPost(req.body);
    return res.status(201).json(post);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }

    return sendPrismaError(res, error);
  }
}

async function getPosts(req, res) {
  const pagination = getPagination(req.query);

  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order || "desc";

  if (!POST_SORT_FIELDS.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt, likes",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  if (
    (req.query.from !== undefined && !isValidDate(req.query.from)) ||
    (req.query.to !== undefined && !isValidDate(req.query.to))
  ) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  try {
    const result = await postsService.getPosts({
      ...req.query,
      ...pagination,
      sortBy,
      order,
    });

    return res.status(200).json(result);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function getPostById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function updatePost(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.updatePost(req.params.id, req.body);
    return res.status(200).json(post);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function deletePost(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    await postsService.deletePost(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};