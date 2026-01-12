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
    const { ficha, nombres, apellidos, anio_nac, mes_nac, dia_nac, dpto, gcia } = req.body;

    // CONVERSIÓN EXPLÍCITA: Forzamos que los campos numéricos sean Números
    // Si no vienen, les asignamos null o 0 para evitar el mismatch
    const sanitizedData = {
      ficha: ficha ? Number(ficha) : null,
      nombres: String(nombres),
      apellidos: String(apellidos),
      anio_nac: anio_nac ? Number(anio_nac) : null,
      mes_nac: mes_nac ? Number(mes_nac) : null,
      dia_nac: dia_nac ? Number(dia_nac) : null,
      dpto: dpto ? String(dpto) : "",
      gcia: gcia ? String(gcia) : ""
    };

    const result = await WorkerService.CreateworkerService(sanitizedData);

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error("Error en CreateworkerController:", error.message);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
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

export const GetbyFilecontroller = async (req, res) => {
  try {
    // El frontend envía ?search=...
    const { search } = req.query; 
    
    console.log("Buscando en DB el término:", search); // Debug

    const data = await WorkerService.SearchWorkersService(search);
    
    // IMPORTANTE: Responder con el array de resultados
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};