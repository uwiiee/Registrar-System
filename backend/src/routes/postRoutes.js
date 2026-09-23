const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  toggleLike,
  recordView,
  deletePost,
} = require("../controllers/postController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getPosts);
router.post("/", protect, authorize("admin"), createPost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/view", protect, recordView);
router.delete("/:id", protect, authorize("admin"), deletePost);

module.exports = router;
