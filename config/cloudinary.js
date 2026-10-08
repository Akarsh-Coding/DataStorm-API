const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  // Not fatal — the rest of the API works fine without it, only image uploads will fail
  console.warn('Cloudinary env vars are not fully set. Image uploads will fail until they are.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Wraps Cloudinary's stream-based upload (which takes a callback) in a Promise
// so route handlers can just `await` it like any other async call.
function streamUpload(buffer, folder = 'cinestream') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

module.exports = { cloudinary, streamUpload };
