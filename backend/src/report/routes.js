import express from 'express';
import { GetallReportController,GetByFilterController,CreateReportController,UpdateReportController,DeleteReportController,Getbycasecontroller,Getbyidworkereportcontroller } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/by-worker', verifyToken, Getbyidworkereportcontroller);
router.get('/', GetallReportController);
router.post('/', verifyToken, CreateReportController);
router.put('/:id', verifyToken, UpdateReportController);
router.delete('/:id', verifyToken, DeleteReportController);
router.get('/search', Getbycasecontroller);
router.get('/filter', GetByFilterController);


export default router;