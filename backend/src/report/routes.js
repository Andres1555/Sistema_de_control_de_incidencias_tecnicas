import express from 'express';
import { GetallReportController,CreateReportController,UpdateReportController,DeleteReportController } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.get('/', GetallReportController);
router.post('/', verifyToken, CreateReportController);
router.put('/:id', UpdateReportController);
router.delete('/:id', DeleteReportController);

export default router;