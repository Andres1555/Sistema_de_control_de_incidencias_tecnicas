import express from 'express';
import { LoginController } from './controllers.js';

const router = express.Router();

router.post('/login', LoginController);

export default router;
