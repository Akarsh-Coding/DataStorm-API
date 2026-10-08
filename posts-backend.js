const express = require('express');
const multer = require('multer');
const router = express.Router();
const Post = require('./models/Post');
const { streamUpload } = require('./config/cloudinary');

// Memory storage — the file buffer never touches disk, it's held in memory just
// long enough to stream straight to Cloudinary. Nothing binary ever reaches MongoDB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// upload.single('image') only activates for multipart/form-data requests — a plain
// JSON POST (Content-Type: application/json) passes straight through untouched,
// so this route still works exactly as before when no image is attached.
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const payload = { ...req.body };

    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      payload.moviePoster = result.secure_url; // only the URL is stored, never the file itself
    }

    const post = await Post.create(payload);
    res.status(201).json(post);
  } catch (error) {
    // 400: bad payload, not a server fault
    res.status(400).json({ error: error.message });
  }
});

// Catches multer-specific failures (oversized file, wrong type) so they come back
// as a clean JSON 400 instead of Express's default HTML error page.
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
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
