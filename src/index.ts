import 'dotenv/config';
import express from 'express';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`dogear server running on port ${port}`);
});
