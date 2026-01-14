import { SpecuserRepository } from "./repositories.js";

export const SpecuserService = {
  getAll: async () => {
    return await SpecuserRepository.getAll();
  },

  create: async (data) => {
    // Validación opcional: ¿Ya existe esta relación?
    const exists = await SpecuserRepository.findRelation(data.id_user, data.id_specia);
    if (exists) return exists; // Si ya están vinculados, no hacemos nada

    return await SpecuserRepository.create(data);
  },

  update: async (id, data) => {
    const updated = await SpecuserRepository.updateById(id, data);
    if (!updated) throw new Error("Registro no encontrado para actualizar");
    return updated;
  },

  delete: async (id) => {
    const destroyed = await SpecuserRepository.deleteById(id);
    if (!destroyed) throw new Error("Registro no encontrado para eliminar");
    return destroyed;
  },
};

export default SpecuserService;
