const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const authMiddleware = require("../../middlewares/auth");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

/**
 * @route  Post api/v1/posts
 * @desc   Create a post
 * @access Private
 */
router.post(
  "/",
  [authMiddleware, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id);

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);
/**
 * @route  Get api/v1/posts
 * @desc   Get all posts
 * @access Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/**
 * @route  Get api/v1/posts
 * @desc   Get post by ID
 * @access Private
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post was not found" });
    }
    res.json(post);
    return;
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

/**
 * @route   Delete api/v1/posts/:id
 * @desc    Delete post
 * @access  Private
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check user
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "User not Authorized",
      });
    }
    await post.remove();
    return res.json({ message: "Post deleted succesfully!" });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(500).send("Server Error");
  }
});

/**
 * @route   Put api/v1/posts/like/:id
 * @desc    Like a Post
 * @access  Private
 */
router
  .put("/like/:id", authMiddleware,  async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ message: "Post already liked" });
    }
    await post.likes.unshift({user: req.user.id});
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

/**
 * @route   Put api/v1/posts/unlike/:id
 * @desc    Like a Post
 * @access  Private
 */
router
  .put("/unlike/:id", authMiddleware,  async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ message: "Post has not yet been liked" });
    }
   const removeIndex = post.likes.map( like => like.user.toString()).indexOf( req.user.id);
     post.likes.splice(removeIndex, 1);
    await  post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

/**
 * @route  Post api/v1/posts/comment/:id
 * @desc   Create a post
 * @access Private
 */
router.post(
  "/comment/:id",
  [authMiddleware, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id);
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route  DELETE api/v1/posts/comment/:id/:commentId
 * @desc   Delete comment
 * @access Private
 */
router
  .delete('/comment/:id/:commentId', authMiddleware, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      // pull out comment
      const comment = post.comments.find(comment => comment.id === req.params.commentId);
      // make sure comment exists
      if(!comment){
        return res.status(404).json({ message: 'Comment does not exist!'});
      }
      // check user
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({message: 'User not authorized'});
      }
      const removeIndex = post.comments.map( comment => comment.user.toString()).indexOf( req.user.id);
     post.comments.splice(removeIndex, 1);
    await  post.save();
    res.json(post.comments);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });



module.exports = router;
