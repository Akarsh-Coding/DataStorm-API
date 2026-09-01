const mongoose = require('mongoose');

// Strict types so malformed payloads fail at the schema level, not deep in a query
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  // Default keeps this out of the client's hands, avoiding spoofed timestamps
  createdAt: { type: Date, default: Date.now },
  // ref lets .populate() hydrate this into a full User document later
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Post', postSchema);
