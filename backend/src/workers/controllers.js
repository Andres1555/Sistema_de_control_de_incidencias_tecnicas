import jwt from 'jsonwebtoken';
import { WorkerService } from './services.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const GetallworkersController = async (req, res) => {
  try {
    const data = await WorkerService.GetallworkersService();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const GetworkerbyfileController = async (req, res) => {
  try {
    const { ficha } = req.params;
    const data = await WorkerService.GetworkerbyfichaService(ficha);
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};

export const CreateworkerController = async (req, res) => {
  try {
    const data = await WorkerService.CreateworkerService(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const UpdateworkerController = async (req, res) => {
  try {
    const { id } = req.params; // Cambiado de CI a ID según tu solicitud
    const data = await WorkerService.UpdateworkerService(id, req.body);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const DeleteworkerController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await WorkerService.DeleteworkerService(id);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};

// Nuevo: login por ficha → firma un JWT y devuelve token si existe
export const WorkerLoginController = async (req, res) => {
  try {
    const { ficha } = req.body;
    if (!ficha) return res.status(400).json({ status: 'error', message: 'La ficha es requerida' });
    const worker = await WorkerService.GetworkerbyfichaService(ficha);
    // worker puede ser un objeto Sequelize
    const payload = { id: worker.id, ficha: worker.ficha, rol: 'worker' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    return res.status(200).json({ token, user: { id: worker.id, ficha: worker.ficha } });
  } catch (error) {
    return res.status(404).json({ status: 'error', message: error.message });
  }
};