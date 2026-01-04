import express from 'express';
import { GetallworkersController, GetworkerbyfileController, CreateworkerController, UpdateworkerController, DeleteworkerController } from './controllers.js';

const router = express.Router();


router.get('/', GetallworkersController);
router.get('/:ficha', GetworkerbyfileController)
router.post('/', CreateworkerController);
router.put('/:id', UpdateworkerController);
router.delete('/:id', DeleteworkerController);

export default router;