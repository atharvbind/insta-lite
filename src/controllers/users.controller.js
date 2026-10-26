const usersService = require("../services/users.service");
const {
  getPagination,
  isValidId,
} = require("../utils/pagination");

const USER_SORT_FIELDS = ["createdAt", "username", "fullname"];

function sendPrismaError(res, error) {
  if (error.code === "P2002") {
    return res.status(409).json({ error: "Username or email already exists" });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ error: "User not found" });
  }

  if (error.code === "P2003") {
    return res.status(404).json({ error: "Related record not found" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
}

async function createUser(req, res) {
  const { username, email, fullname } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const user = await usersService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function getUsers(req, res) {
  const pagination = getPagination(req.query);

  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order || "desc";

  if (!USER_SORT_FIELDS.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, username, fullname",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  if (
    req.query.isPrivate !== undefined &&
    !["true", "false"].includes(req.query.isPrivate)
  ) {
    return res.status(400).json({
      error: "isPrivate must be true or false",
    });
  }

  if (
    req.query.hasPosts !== undefined &&
    !["true", "false"].includes(req.query.hasPosts)
  ) {
    return res.status(400).json({
      error: "hasPosts must be true or false",
    });
  }

  try {
    const result = await usersService.getUsers({
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

async function getUserById(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function updateUser(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    return res.status(200).json(user);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function deleteUser(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await usersService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function getUserPosts(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = getPagination(req.query);

  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.getUserPosts(
      req.params.id,
      pagination
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return sendPrismaError(res, error);
  }
}

async function getUserLikedPosts(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = getPagination(req.query);

  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await usersService.getUserLikedPosts(
      req.params.id,
      pagination
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    return sendPrismaError(res, error);
  }
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