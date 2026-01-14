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

  createCompleteUser: async (data) => {
    try {
      // 1. Crear el usuario base
      const newUser = await UserRepository.createUser(data);
      const userId = newUser.id;

      // 2. Si viene número de máquina, crearla
      if (data.nro_maquina) {
        await Machine.create({
          id_user: userId,
          nro_maquina: Number(data.nro_maquina)
        });
      }

      // 3. Procesar especializaciones (vienen como array desde el controlador)
      if (data.especializaciones && data.especializaciones.length > 0) {
        for (const nombre of data.especializaciones) {
          // Buscar o crear la especialidad
          const [spec] = await Specialization.findOrCreate({
            where: { nombre: nombre.toLowerCase().trim() },
            defaults: { nombre: nombre.toLowerCase().trim() }
          });

          // Vincular en la tabla intermedia
          await SpecializationUsers.create({
            id_user: userId,
            id_specia: spec.id
          });
        }
      }

      return newUser;
    } catch (error) {
      throw error;
    }
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



