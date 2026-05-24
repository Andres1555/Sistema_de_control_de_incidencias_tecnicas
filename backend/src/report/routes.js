import express from 'express';
import { GetallReportController,GetByFilterController,CreateReportController,UpdateReportController,DeleteReportController,Getbycasecontroller,Getbyidworkereportcontroller, EscalateReportController, ClaimReportController } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/by-worker', verifyToken, Getbyidworkereportcontroller);
router.get('/', verifyToken, GetallReportController);
router.post('/', verifyToken, CreateReportController);
router.put('/:id', verifyToken, UpdateReportController);
router.patch('/:id/escalate', verifyToken, EscalateReportController);
router.patch('/:id/claim', verifyToken, ClaimReportController);
router.delete('/:id', verifyToken, DeleteReportController);
router.get('/search', verifyToken, Getbycasecontroller);
router.get('/filter', verifyToken, GetByFilterController);


export default router;