import express from 'express';
import { GetallReportcaseController,CreateReportcaseController, UpdateReportcaseController, DeleteReportcaseController } from './controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.get('/',  GetallReportcaseController);
router.post('/', verifyToken, CreateReportcaseController);
router.put('/',  UpdateReportcaseController);
router.delete('/',DeleteReportcaseController);

export default router;