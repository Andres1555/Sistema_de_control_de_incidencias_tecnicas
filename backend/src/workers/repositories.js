import { Worker } from '../schemas/schemas.js';

export const WorkerRepository = {
  findAll: async () => {
    return await Worker.findAll();
  },

  findByFicha: async (ficha) => {
    return await Worker.findOne({ where: { ficha } });
  },

  findById: async (id) => {
    return await Worker.findByPk(id);
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