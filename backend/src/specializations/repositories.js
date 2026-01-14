import { Specialization } from "../schemas/schemas.js";

async function getAll() {
  return await Specialization.findAll();
}

async function getById(id) {
  return await Specialization.findByPk(id);
}

// CAMBIO: Ahora busca por nombre antes de crear
async function findOrCreate(nombre) {
  // findOrCreate devuelve un array: [instancia, creado(bool)]
  const [specialization, created] = await Specialization.findOrCreate({
    where: { nombre: nombre.toLowerCase().trim() },
    defaults: { nombre: nombre.toLowerCase().trim() }
  });
  return specialization;
}

export const SpecializationRepository = {
  getAll,
  getById,
  findOrCreate, // Cambiamos create por findOrCreate
  updateById: async (id, data) => {
    const spec = await Specialization.findByPk(id);
    if (spec) return await spec.update(data);
    return null;
  },
  deleteById: async (id) => {
    return await Specialization.destroy({ where: { id } });
  }
};