require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const app = express();
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
