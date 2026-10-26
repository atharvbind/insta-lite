const express = require("express");
const postsController = require("../controllers/posts.controller");
const likesController = require("../controllers/likes.controller");

const router = express.Router();

router.get("/", postsController.getPosts);
router.post("/", postsController.createPost);

// Like routes must be registered before the general "/:id" routes.
router.get("/:id/likes", likesController.getPostLikes);
router.post("/:id/likes", likesController.createLike);
router.delete("/:id/likes/:userId", likesController.deleteLike);

router.get("/:id", postsController.getPostById);
router.patch("/:id", postsController.updatePost);
router.put("/:id", postsController.updatePost);
router.delete("/:id", postsController.deletePost);

module.exports = router;