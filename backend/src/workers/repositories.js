import { Worker } from '../schemas/schemas.js';

export const WorkerRepository = {

  findAllPaged: async (limit, offset) => {
    try {
      return await Worker.findAndCountAll({
        limit: limit,
        offset: offset,
        order: [['id', 'ASC']] // Ordenados por ID
      });
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    
    return await Worker.findByPk(id);
  },

  findByFicha: async (ficha) => {
    // Buscamos un registro donde la columna FICHA coincida
    return await Worker.findOne({ where: { FICHA: ficha } });
  },
  create: async (data) => {
    return await Worker.create(data);
  },

  update: async (id, data) => {
    
    return await Worker.update(data, { where: { id } });
  },

  delete: async (id) => {
    return await Worker.destroy({ where: { id } });
  }
};