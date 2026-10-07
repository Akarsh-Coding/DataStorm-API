require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // CineStream's Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Establish the Atlas connection before the server starts serving requests
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