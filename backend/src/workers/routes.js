import express from 'express';
import {  GetallworkersController, GetworkerbyidController, CreateworkerController, UpdateworkerController, DeleteworkerController, WorkerLoginController } from './controllers.js';

const router = express.Router();

router.get('/', GetallworkersController);
router.get('/:id', GetworkerbyidController); 
router.post('/login', WorkerLoginController);
router.post('/', CreateworkerController);
router.put('/:id', UpdateworkerController);
router.delete('/:id', DeleteworkerController);

export default router;