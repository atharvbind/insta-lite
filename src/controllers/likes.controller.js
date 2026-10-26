const likesService = require("../services/likes.service");
const { isValidId } = require("../utils/pagination");

async function getPostLikes(req, res) {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const likes = await likesService.getPostLikes(req.params.id);

    if (likes === null) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(likes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createLike(req, res) {
  const { userId } = req.body;

  // 1. Check userId first.
  if (
    userId === undefined ||
    userId === null ||
    userId === "" ||
    !isValidId(userId)
  ) {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!isValidId(req.params.id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    // 2. Check the post.
    const postFound = await likesService.postExists(req.params.id);

    if (!postFound) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 3. Check the user.
    const userFound = await likesService.userExists(userId);

    if (!userFound) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Insert the like. The composite primary key prevents duplicates.
    const like = await likesService.createLike(userId, req.params.id);

    // 5. Return the new like.
    return res.status(201).json(like);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }

    if (error.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteLike(req, res) {
  const { id, userId } = req.params;

  if (!isValidId(id)) {
    return res.status(404).json({ error: "Like not found" });
  }

  if (!isValidId(userId)) {
    return res.status(404).json({ error: "Like not found" });
  }

  try {
    await likesService.deleteLike(userId, id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getPostLikes,
  createLike,
  deleteLike,
};