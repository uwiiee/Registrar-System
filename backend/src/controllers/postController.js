const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.create({
      content,
      department: req.user.department,
      postedBy: req.user._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    if (!req.user.department) {
      return res
        .status(400)
        .json({ message: "Your account is missing a department." });
    }

    let filter;
    if (req.user.role === "student") {
      filter = { department: { $in: [req.user.department, "Registrar"] } };
    } else {
      filter = { department: req.user.department };
    }

    const posts = await Post.find(filter)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 });

    // shape the response so the client gets counts + "did I like/view this" flags,
    // without ever exposing the full list of who liked/viewed
    const shaped = posts.map((p) => ({
      _id: p._id,
      content: p.content,
      department: p.department,
      postedBy: p.postedBy,
      createdAt: p.createdAt,
      likeCount: p.likedBy.length,
      viewCount: p.viewedBy.length,
      likedByMe: p.likedBy.some(
        (id) => id.toString() === req.user._id.toString(),
      ),
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likedBy.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
    } else {
      post.likedBy.push(req.user._id);
    }
    await post.save();

    res.json({ likeCount: post.likedBy.length, likedByMe: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const recordView = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyViewed = post.viewedBy.some(
      (id) => id.toString() === req.user._id.toString(),
    );
    if (!alreadyViewed) {
      post.viewedBy.push(req.user._id);
      await post.save();
    }

    res.json({ viewCount: post.viewedBy.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.department !== req.user.department) {
      return res
        .status(403)
        .json({ message: "Forbidden: not your department's post" });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getPosts, toggleLike, recordView, deletePost };
