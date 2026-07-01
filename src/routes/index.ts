import { Router } from 'express';
import booksRouter from './books';
import goalsRouter from './goals';

const router = Router();

router.use('/books', booksRouter);
router.use('/goals', goalsRouter);

export default router;
