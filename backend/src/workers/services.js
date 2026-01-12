import { WorkerRepository } from './repositories.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

export const WorkerService = {

  GetallworkersService: async (page = 1) => {
    try {
      const limit = 12; // <--- 12 por página
      const offset = (page - 1) * limit;

      const { count, rows } = await WorkerRepository.findAllPaged(limit, offset);

      return {
        workers: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        itemsPerPage: limit
      };
    } catch (error) {
      throw new Error('Error en el servicio: ' + error.message);
    }
  },
  // 2. Obtener un trabajador por ID (Para el Perfil)
  GetWorkerByIdService: async (id) => {
    try {
      const worker = await WorkerRepository.findById(id);
      if (!worker) {
        throw new Error('Trabajador no encontrado');
      }
      return worker;
    } catch (error) {
      throw error;
    }
  },

  // 3. Crear un nuevo trabajador (Admin)
  CreateworkerService: async (data) => {
    try {
      // 1. Validar que la ficha sea un número válido
      if (isNaN(data.ficha) || data.ficha === null) {
        throw new Error("La ficha debe ser un número válido.");
      }

      // 2. Verificar si la ficha ya existe
      const existingWorker = await WorkerRepository.findByFicha(data.ficha);
      if (existingWorker) {
        throw new Error(`La ficha ${data.ficha} ya está registrada.`);
      }

      // 3. Crear en el repositorio
      return await WorkerRepository.create(data);
    } catch (error) {
      throw error;
    }
  },


  UpdateworkerService: async (id, data) => {
    try {
      // 1. Verificar si el trabajador existe
      const worker = await WorkerRepository.findById(id);
      if (!worker) throw new Error('Trabajador no encontrado en el sistema');

      // 2. Si el usuario intenta cambiar la ficha, validar que la nueva no esté ocupada
      if (data.ficha && Number(data.ficha) !== worker.ficha) {
        const existingFicha = await WorkerRepository.findByFicha(data.ficha);
        if (existingFicha) throw new Error(`La ficha ${data.ficha} ya pertenece a otro trabajador`);
      }

      // 3. Ejecutar actualización
      await WorkerRepository.update(id, data);
      
      return { message: 'Datos del trabajador actualizados correctamente' };
    } catch (error) {
      throw error;
    }
  },

  DeleteworkerService: async (id) => {
    try {
      // 1. Verificar si existe antes de borrar
      const worker = await WorkerRepository.findById(id);
      if (!worker) throw new Error('El trabajador ya no existe o ya fue eliminado');

      // 2. Ejecutar eliminación
      await WorkerRepository.delete(id);
      
      return { message: 'Trabajador eliminado con éxito' };
    } catch (error) {
      throw error;
    }
  },

  LoginworkerService: async (ficha) => {
    try {
      const worker = await WorkerRepository.findByFicha(ficha);

      if (!worker) {
        throw new Error('Ficha inválida o trabajador no registrado');
      }

      // Generar Token JWT incluyendo ID y FICHA
      const token = jwt.sign(
        { id: worker.id, ficha: worker.FICHA },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Devolvemos la estructura que el Frontend (WorkersLogin.jsx) espera recibir
      return {
        token,
        user: {
          id: worker.id,
          nombre: worker.NOMBRES,
          ficha: worker.FICHA
        }
      };
    } catch (error) {
      throw error;
    }
  },

  SearchWorkersService: async (term) => {
    try {
      return await WorkerRepository.findBySearch(term);
    } catch (error) {
      throw new Error('Error al buscar trabajadores: ' + error.message);
    }
  }
};




  
