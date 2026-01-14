import { UserRepository } from "./repositories.js";
import { Machine, Specialization, SpecializationUsers } from "../schemas/schemas.js";
export const UserService = {
  getAll: async (page = 1) => {
    try {
      const limit = 12;
      const offset = (page - 1) * limit;

      const { count, rows } = await UserRepository.getAll(limit, offset);

      return {
        users: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      throw new Error("Error en el servicio al obtener usuarios paginados: " + error.message);
    }
  },

  getbyid: async (id) => {
    const user = await UserRepository.getById(id);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  },

 create: async (data) => {
    // Llama a la función del repositorio que maneja la transacción completa
    return await UserRepository.createCompleteUser(data);
  },

   update: async (ci, data) => {
    try {
      // 1. Buscar al usuario original para obtener su ID real
      const user = await UserRepository.getById(ci); // Usamos tu buscador por CI
      if (!user) throw new Error("Usuario no encontrado");

      // 2. Si viene nro_maquina, actualizar o crear en la tabla Machine
      if (data.nro_maquina !== undefined) {
        const nro = Number(data.nro_maquina);
        if (nro > 0) {
          await Machine.findOrCreate({
            where: { nro_maquina: nro },
            defaults: { nro_maquina: nro, id_user: user.id }
          });
          // Actualizamos el id_user de esa máquina por si era de otro
          await Machine.update({ id_user: user.id }, { where: { nro_maquina: nro } });
        }
      }

      // 3. Si vienen especializaciones (string "redes, sql")
      if (data.especializacion !== undefined) {
        const specs = data.especializacion.split(",").map(s => s.trim()).filter(s => s !== "");
        for (const nombre of specs) {
          const [spec] = await Specialization.findOrCreate({
            where: { nombre: nombre.toLowerCase() }
          });
          await SpecializationUsers.findOrCreate({
            where: { id_user: user.id, id_specia: spec.id }
          });
        }
      }

      // 4. Limpiar campos numéricos para evitar SQLITE_MISMATCH
      const cleanData = { ...data };
      if (cleanData.telefono) cleanData.telefono = Number(cleanData.telefono);
      if (cleanData.extension) cleanData.extension = Number(cleanData.extension);
      if (cleanData.ficha) cleanData.ficha = Number(cleanData.ficha);

      // 5. Actualizar datos básicos en la tabla Users
      return await UserRepository.updateByCI(ci, cleanData);

    } catch (error) {
      throw error;
    }
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



