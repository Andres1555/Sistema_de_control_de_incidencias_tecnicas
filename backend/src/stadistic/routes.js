import express from 'express';
import { GetallstadisticController, GetstadisticbynameController, GetstadisticasesbynameController, GetallstadisticaseController, DeletestadisticController } from './controllers.js';

const router = express.Router();


router.get('/', GetallstadisticController);
router.get('/:id', GetstadisticbynameController);
router.get('/', GetallstadisticaseController);
router.get('/:id', GetstadisticasesbynameController);

export default router;