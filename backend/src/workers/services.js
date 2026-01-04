import { WorkerRepository } from './repositories.js';

export const WorkerService = {
  GetallworkersService: async () => {
    try {
      return await WorkerRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener los trabajadores: ' + error.message);
    }
  },

  GetworkerbyfileService: async (file) => {
    try {
      const worker = await WorkerRepository.findByFile(file);
      if (!worker) throw new Error(`El trabajador con ficha ${file} no existe.`);
      return worker;
    } catch (error) {
      throw error;
    }
  },

  // Alias con el nombre en español para compatibilidad con controladores existentes
  GetworkerbyfichaService: async (ficha) => {
    try {
      const worker = await WorkerRepository.findByFicha(ficha);
      if (!worker) throw new Error(`El trabajador con ficha ${ficha} no existe.`);
      return worker;
    } catch (error) {
      throw error;
    }
  },

  CreateworkerService: async (data) => {
    try {
      // VALIDACIÓN: Verificar si la ficha ya existe antes de crear
      const existingWorker = await WorkerRepository.findByFicha(data.ficha);
      if (existingWorker) {
        throw new Error(`La ficha ${data.ficha} ya está registrada por otro trabajador.`);
      }
      return await WorkerRepository.create(data);
    } catch (error) {
      throw error;
    }
  },

  UpdateworkerService: async (id, data) => {
    try {
      const worker = await WorkerRepository.findById(id);
      if (!worker) throw new Error('No se encontró el trabajador para actualizar.');

      // VALIDACIÓN OPCIONAL: Si se intenta cambiar la ficha en el update, 
      // verificar que la nueva ficha no pertenezca a otro ID
      if (data.ficha && data.ficha !== worker.ficha) {
        const checkFicha = await WorkerRepository.findByFicha(data.ficha);
        if (checkFicha) throw new Error('La nueva ficha ya está en uso por otro trabajador.');
      }

      await WorkerRepository.update(id, data);
      return { message: 'Trabajador actualizado con éxito.' };
    } catch (error) {
      throw error;
    }
  },

  DeleteworkerService: async (id) => {
    try {
      const worker = await WorkerRepository.findById(id);
      if (!worker) throw new Error('No se encontró el trabajador con el ID proporcionado.');
      
      await WorkerRepository.delete(id);
      return { message: 'Trabajador eliminado correctamente.' };
    } catch (error) {
      throw error;
    }
  },

  // Nuevo: validar ficha y devolver token
  WorkerLoginService: async (ficha) => {
    try {
      const worker = await WorkerRepository.findByFicha(ficha);
      if (!worker) throw new Error('Ficha no encontrada');
      return worker;
    } catch (error) {
      throw error;
    }
  }
};