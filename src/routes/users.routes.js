const express = require("express");
const usersController = require("../controllers/users.controller");

const router = express.Router();

router.get("/", usersController.getUsers);
router.post("/", usersController.createUser);

// Specific routes must be registered before "/:id".
router.get("/:id/posts", usersController.getUserPosts);
router.get("/:id/liked-posts", usersController.getUserLikedPosts);

router.get("/:id", usersController.getUserById);
router.patch("/:id", usersController.updateUser);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

module.exports = router;