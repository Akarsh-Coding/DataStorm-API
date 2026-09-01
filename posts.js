const express = require('express');
const router = express.Router();
const Post = require('./models/Post');

router.post('/', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    // 400: bad payload, not a server fault
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    // Hydrates authorId into the full User document, not just the raw ref
    const posts = await Post.find().populate('authorId');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Must come before /:id — otherwise Express treats "recent" as an :id value
router.get('/recent', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(3).populate('authorId');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('authorId');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // new: true returns the post after the update, not before
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
