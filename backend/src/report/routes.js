import express from 'express';
import { GetallReportController,GetByFilterController,CreateReportController,UpdateReportController,DeleteReportController,Getbycasecontroller,Getbyidworkereportcontroller, EscalateReportController } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/by-worker', verifyToken, Getbyidworkereportcontroller);
router.get('/', verifyToken, GetallReportController);
router.post('/', verifyToken, CreateReportController);
router.put('/:id', verifyToken, UpdateReportController);
router.patch('/:id/escalate', verifyToken, EscalateReportController);
router.delete('/:id', verifyToken, DeleteReportController);
router.get('/search', verifyToken, Getbycasecontroller);
router.get('/filter', verifyToken, GetByFilterController);


export default router;