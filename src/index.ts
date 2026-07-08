import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', router);

// In production the UI is built into ./public alongside dist/index.js.
// Serve it and fall back to index.html for client-side routing.
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(port, () => {
  console.log(`dogear server running on port ${port}`);
});
