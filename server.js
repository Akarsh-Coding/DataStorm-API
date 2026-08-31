require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const postsRouter = require('./routes/posts');

const app = express();
app.use(express.json());

// Try to establish the Atlas connection, but do not crash the API if Mongo is unavailable.
connectDB().catch((err) => {
  console.error('DB startup warning:', err.message);
});

app.get('/', (req, res) => {
  res.send('The Data Hub API is running');
});

app.use('/posts', postsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
