import express from 'express';
import { GetallReportController,CreateReportController,UpdateReportController,DeleteReportController,Getbycasecontroller,Getbyidworkereportcontroller } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/search', Getbyidworkereportcontroller);
router.get('/', GetallReportController);
router.post('/', verifyToken, CreateReportController);
router.put('/:id', verifyToken, UpdateReportController);
router.delete('/:id', verifyToken, DeleteReportController);
router.get('/search', Getbycasecontroller);

export default router;