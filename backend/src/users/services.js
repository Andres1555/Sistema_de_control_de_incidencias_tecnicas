import { UserRepository } from "./repositories.js";

export const UserService = {
  getAll: async () => {
    return await UserRepository.getAll();
  },

  getbyid: async (id) => {
    const user = await UserRepository.getById(id);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  },

  create: async (data) => {
    return await UserRepository.createUser(data);
  },

  update: async (ci, data) => {
    const updated = await UserRepository.updateByCI(ci, data);
    if (!updated) throw new Error("Usuario no encontrado para actualizar");
    return updated;
  },

  delete: async (id) => {
    const destroyed = await UserRepository.deleteByIdOrCI(id);
    if (!destroyed) throw new Error("Usuario no encontrado para eliminar");
    return destroyed;
  },
  SearchUsersService: async (term) => {
    try {
      return await UserRepository.findBySearch(term);
    } catch (error) {
      throw new Error('Error al buscar usuarios: ' + error.message);
    }
  }
};



