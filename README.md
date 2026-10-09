# DataStorm API

DataStorm — An Express + MongoDB Atlas backend that replaces in-memory mock data with a live, persistent database, using Mongoose as the ODM. It powers the watchlist and review features of **[CineStream](https://github.com/Akarsh-Coding/CineStream)**, stores uploaded thumbnails on Cloudinary, and is deployed on Render.

**Live API:** `<add your Render URL here>`  
**Frontend (CineStream):** https://cinestream-zeq2.onrender.com/

## Stack

- Node.js / Express
- MongoDB Atlas (M0 Sandbox)
- Mongoose
- `cors` for cross-origin access from the frontend
- `multer` for parsing `multipart/form-data` uploads
- Cloudinary for image hosting
- Render for deployment

## Project Structure

```
.
├── config/
│   ├── db.js            # Mongoose connection to Atlas
│   └── cloudinary.js    # Cloudinary config + streaming upload helper
├── models/
│   ├── Post.js          # Post schema (movie reference, status, rating, review)
│   └── User.js          # User schema (name, email)
├── routes/
│   ├── posts.js         # /posts CRUD + /posts/recent aggregation + image upload
│   └── users.js         # /users create + list
├── DataStorm-API.postman_collection.json (Postman)
├── server.js
├── package.json
├── .env.example         # variable names only — copy to .env
└── .env                 # not committed — see Setup
```

## Setup

1. Clone the repo and install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file in the project root (see `.env.example`):
   ```
   MONGO_URI="your_atlas_connection_string"
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. In MongoDB Atlas, under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so both your local machine and Render can connect.
4. Start the server:
   ```
   npm run dev
   ```
   You should see `MongoDB Atlas connected successfully` in the console.

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string. The server exits on startup if it is missing |
| `PORT` | No | Port to listen on. Defaults to `5000` (Render sets this automatically) |
| `CLIENT_ORIGIN` | Yes in production | Exact origin of the frontend allowed by CORS, e.g. `https://cinestream-zeq2.onrender.com`. No trailing slash. Defaults to `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | For image uploads | Found on the Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | For image uploads | Cloudinary dashboard → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | For image uploads | Same page. Treat it like a password |

If the Cloudinary variables are missing, the server still starts and logs a warning. Only image uploads fail.

## API Reference

### Posts

In CineStream, each post is a **watchlist entry** for one movie.

| Method | Route | Description |
|---|---|---|
| POST | `/posts` | Create a post (JSON, or `multipart/form-data` with an image) |
| GET | `/posts` | List all posts (author populated) |
| GET | `/posts/recent` | Top 3 most recent posts (author populated) |
| GET | `/posts/:id` | Get a single post by ID (author populated) |
| PUT | `/posts/:id` | Update a post (e.g. change `status`, add `rating` and `content`) |
| DELETE | `/posts/:id` | Delete a post |

**Post fields:**

| Field | Type | Notes |
|---|---|---|
| `movieId` | Number | **Required.** TMDB movie id |
| `movieTitle` | String | **Required** |
| `moviePoster` | String | TMDB `poster_path`, or a Cloudinary URL if an image was uploaded |
| `status` | String | `want_to_watch` (default) or `watched` |
| `rating` | Number | Optional, 1–10. Meant to be set once `status` is `watched` |
| `content` | String | Optional review text |
| `createdAt` | Date | Auto-set by the server |
| `authorId` | ObjectId | Optional, ref: `User` |

**Create with JSON**

```
POST /posts
Content-Type: application/json

{
  "movieId": 550,
  "movieTitle": "Fight Club",
  "moviePoster": "/abc123.jpg",
  "status": "want_to_watch"
}
```

**Create with an image upload**

```
POST /posts
Content-Type: multipart/form-data

movieId=-1725000000000
movieTitle=My Custom Movie
status=want_to_watch
image=<file>
```

- The file goes in a field named `image`.
- Only `image/*` files are accepted, up to 5 MB. Anything else returns `400` with a JSON error.
- The file is held in memory by `multer`, streamed to Cloudinary, and only the returned `secure_url` is saved in `moviePoster`. No binary data or Base64 is ever stored in MongoDB.
- Plain JSON requests are unaffected. The upload middleware only activates for multipart requests.

### Users

| Method | Route | Description |
|---|---|---|
| POST | `/users` | Create a user |
| GET | `/users` | List all users |

**User fields:** `name` (String), `email` (String)

## CORS

The API only accepts browser requests from the origin set in `CLIENT_ORIGIN`, and allows the `GET`, `POST`, `PUT`, and `DELETE` methods. If the frontend's address does not match exactly (protocol, host, and port), the browser blocks every request. This is the most common cause of a deployed frontend that cannot reach the API.

## Testing

Import `DataStorm-API.postman_collection.json` into Postman. It runs the full CRUD cycle against `/posts` (create → list → get → update → delete → confirm 404), using a collection variable to pass the real `_id` between requests.

> The request bodies in the collection predate the watchlist schema. Update the create body to include the required `movieId` and `movieTitle` fields (see the JSON example above), otherwise validation will return `400`.

To test population, create a user first, then create a post with that user's `_id` as `authorId`. `GET /posts` and `GET /posts/:id` will return the full user object instead of a raw ID.

To test an upload, use a `POST /posts` request with body type **form-data**, add text fields for `movieId`, `movieTitle`, and `status`, and add a field named `image` with type **File**.

## Deployment (Render)

Deploy as a **Web Service** on Render.

| Setting | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `npm start` |

Set these in the service's **Environment** tab. Never commit them:

- `MONGO_URI`
- `CLIENT_ORIGIN` (the live CineStream URL)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Render provides `PORT` automatically.

Quick checks after deploying:

1. Visit the service root URL. It should respond with `The Data Hub API is running`.
2. From the live frontend, `fetch('<api-url>/posts')` in the browser console should return data, not a CORS error.
3. Create, update, delete, and upload from the live frontend, hard refreshing between steps to confirm data persists.

> Render's free tier spins down after inactivity, so the first request can take 30–50 seconds.

## Notes

- Credentials live only in `.env` (local) or the host's environment variable settings (deployed). They are never in source, and `.env` is gitignored.
- DNS is pinned to `1.1.1.1` / `8.8.8.8` in `config/db.js` to avoid SRV record resolution failures on some networks.
- Documents created before the watchlist schema change (with only `title` and `content`) lack `movieId` and `movieTitle`. Delete them from the collection so they do not appear alongside new entries.
