import express from 'express';
import { GetallReportController,CreateReportController,UpdateReportController,DeleteReportController } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.get('/', GetallReportController);
router.post('/', verifyToken, CreateReportController);
router.put('/:id', verifyToken, UpdateReportController);
router.delete('/:id', verifyToken, DeleteReportController);

export default router;