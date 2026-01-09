import { WorkerService } from './services.js';

export const GetallworkersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await WorkerService.GetallworkersService(page);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const GetworkerbyidController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await WorkerService.GetWorkerByIdService(id);
    
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};


export const WorkerLoginController = async (req, res) => {
  try {
    const { ficha } = req.body
    const data = await WorkerService.LoginworkerService(ficha);
    
    res.status(200).json(data);
  } catch (error) {
    res.status(401).json({ status: 'error', message: error.message });
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
    const { id } = req.params; 
    // Llamamos al servicio pasando ID y los datos del body del Form
    const result = await WorkerService.UpdateworkerService(id, req.body);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const DeleteworkerController = async (req, res) => {
  try {
    const { id } = req.params;
    // Llamamos al servicio para eliminar
    const result = await WorkerService.DeleteworkerService(id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};