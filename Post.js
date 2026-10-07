const mongoose = require('mongoose');

// Strict types so malformed payloads fail at the schema level, not deep in a query
const postSchema = new mongoose.Schema({
  // TMDB identifiers, captured at the moment the movie is added
  movieId: { type: Number, required: true },
  movieTitle: { type: String, required: true },
  moviePoster: String, // TMDB poster_path, e.g. "/abc123.jpg"

  status: { type: String, enum: ['want_to_watch', 'watched'], default: 'want_to_watch' },

  // Only meaningful once status is 'watched'; optional until the user reviews it
  rating: { type: Number, min: 1, max: 10 },
  content: String,

  // Default keeps this out of the client's hands, avoiding spoofed timestamps
  createdAt: { type: Date, default: Date.now },
  // ref lets .populate() hydrate this into a full User document later
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Post', postSchema);
