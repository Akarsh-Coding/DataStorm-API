require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const app = express();

// In production, set CLIENT_ORIGIN on Render to your live frontend URL
// (e.g. https://cinestream-zeq2.onrender.com or your Vercel domain).
// Falls back to the local CineStream dev server when unset.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('The Data Hub API is running');
});

app.use('/posts', postsRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
