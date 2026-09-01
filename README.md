# DataStorm API

DataStorm — An Express + MongoDB Atlas backend that replaces in-memory mock data with a live, persistent database, using Mongoose as the ODM.

## Stack

- Node.js / Express
- MongoDB Atlas (M0 Sandbox)
- Mongoose

## Project Structure

```
.
├── config/
│   └── db.js           # Mongoose connection to Atlas
├── models/
│   ├── Post.js          # Post schema (title, content, createdAt, authorId ref)
│   └── User.js           # User schema (name, email)
├── routes/
│   ├── posts.js          # /posts CRUD + /posts/recent aggregation
│   └── users.js           # /users create + list
├── DataStorm-API.postman_collection.json (Postman)
├── server.js
├── package.json
└── .env                 # not committed — see Setup
```

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file in the project root:
   ```
   MONGO_URI="your_atlas_connection_string"
   PORT=5000
   ```
3. In MongoDB Atlas, under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so both your local machine and any deployment host can connect.
4. Start the server:
   ```
   npm run dev
   ```
   You should see `MongoDB Atlas connected successfully` in the console.

## API Reference

### Posts

| Method | Route | Description |
|---|---|---|
| POST | `/posts` | Create a post |
| GET | `/posts` | List all posts (author populated) |
| GET | `/posts/recent` | Top 3 most recent posts (author populated) |
| GET | `/posts/:id` | Get a single post by ID (author populated) |
| PUT | `/posts/:id` | Update a post |
| DELETE | `/posts/:id` | Delete a post |

**Post fields:** `title` (String), `content` (String), `createdAt` (Date, auto-set), `authorId` (ObjectId, ref: `User`)

### Users

| Method | Route | Description |
|---|---|---|
| POST | `/users` | Create a user |
| GET | `/users` | List all users |

**User fields:** `name` (String), `email` (String)

## Testing

Import `postman/DataStorm-API.postman_collection.json` into Postman. It runs the full CRUD cycle against `/posts` (create → list → get → update → delete → confirm 404), using a collection variable to pass the real `_id` between requests.

To test population, create a user first, then create a post with that user's `_id` as `authorId` — `GET /posts` and `GET /posts/:id` will return the full user object instead of a raw ID.

## Submission

This project is submitted via GitHub only — no live deployment. `.env` is gitignored and not included in the repo; anyone running this locally needs to create their own `.env` with a valid `MONGO_URI` (see Setup above).

If you deploy this later (Render/Railway), remember `MONGO_URI` must be set as an environment variable in the host's dashboard, not committed in code.

## Notes

- Credentials live only in `.env` (local) or the host's environment variable settings (deployed) — never in source.
- DNS is pinned to `1.1.1.1` / `8.8.8.8` in `config/db.js` to avoid SRV record resolution failures on some networks.
