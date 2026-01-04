import { WorkerService } from './services.js';

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