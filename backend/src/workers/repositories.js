import { Worker } from '../schemas/schemas.js';
import { Op } from 'sequelize'


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
  },

  findBySearch: async (term) => {
    try {
      if (!term) return await Worker.findAll();

      const cleanTerm = term.trim();
      const isNumber = !isNaN(cleanTerm) && cleanTerm !== "";

      return await Worker.findAll({
        where: {
          [Op.or]: [
            // 1. Si es número, buscamos coincidencia EXACTA en la ficha
            // Usamos el nombre del campo en el objeto JS ('ficha'), Sequelize lo traduce a 'FICHA'
            ...(isNumber ? [{ ficha: Number(cleanTerm) }] : []),
            
            // 2. Búsqueda parcial en nombres (LIKE)
            { nombres: { [Op.like]: `%${cleanTerm}%` } },
            
            // 3. Búsqueda parcial en apellidos (LIKE)
            { apellidos: { [Op.like]: `%${cleanTerm}%` } }
          ]
        },
        order: [['nombres', 'ASC']]
      });
    } catch (error) {
      console.error("Error en findBySearch:", error);
      throw error;
    }
  }
};
