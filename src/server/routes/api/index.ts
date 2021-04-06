import { Router } from 'express';
import pizzaRouter from './pizza';

const router = Router();

router.use('/pizza', pizzaRouter);

export default router;