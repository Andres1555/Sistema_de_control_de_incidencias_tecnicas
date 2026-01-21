import express from 'express';
import { GetallReportcaseController,CreateReportcaseController,GetbyuserReportcaseController,UpdateReportcaseController, DeleteReportcaseController, GetallReportuserController } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/search',  GetbyuserReportcaseController);
router.get('/',  GetallReportcaseController);
router.get('/user/:id', GetallReportuserController);
router.post('/', verifyToken, CreateReportcaseController);
router.put('/:id',  UpdateReportcaseController);
router.delete('/:id',DeleteReportcaseController);

export default router;