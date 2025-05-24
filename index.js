// index.js (root)
import dotenv from 'dotenv';

// Load env variables from .env at the very start
dotenv.config();

console.log('Env check:', {
  GITHUB_REPO_OWNER: process.env.GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ? '***' : undefined,
});

import express from 'express';
import bodyParser from 'body-parser';

// Pastikan semua import controller dan middleware benar path-nya dan sudah export dengan benar
import { fromPath, fromUrl } from './api/controllers/uploadResource.js';
import { byPath, bySha } from './api/controllers/deleteResource.js';
import { list } from './api/controllers/listResources.js';
import environmentCheck from './api/controllers/environmentCheck.js';
import { apiKeyAuth } from './api/middlewares/auth.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
// Middleware to check if environment variables are properly set
app.use(environmentCheck);
// Middleware for API key authentication
app.use(apiKeyAuth);

// Routes
app.post('/api/upload/path', fromPath);
app.post('/api/upload/url', fromUrl);

app.delete('/api/delete/path', byPath);
app.delete('/api/delete/sha', bySha);

app.get('/api/list', list);

// Health check route (optional but useful)
app.get('/', (req, res) => {
  res.send('CDNPine API is up and running!');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 CDNPine API running on http://localhost:${port}`);
});
