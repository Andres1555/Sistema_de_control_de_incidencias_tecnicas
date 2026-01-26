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

 update: async (ciOriginal, data) => {
    try {
      // 1. Actualizamos el usuario base (Capa de Repositorio)
      const user = await UserRepository.updateByCI(ciOriginal, data);
      if (!user) throw new Error("Usuario no encontrado");

      // 2. GESTIÓN DE MÁQUINA: CORREGIR LA LÍNEA EXISTENTE
      if (data.nro_maquina !== undefined) {
        const nroNuevo = data.nro_maquina !== null && data.nro_maquina !== undefined ? String(data.nro_maquina).trim() : "";

        if (nroNuevo !== "") {
          // Buscamos si ESTE usuario ya tiene alguna máquina asignada en la tabla
          const machineRow = await Machine.findOne({ where: { id_user: user.id } });

          if (machineRow) {
            // Actualizamos la máquina existente con el nuevo identificador (string)
            await machineRow.update({ nro_maquina: nroNuevo });
          } else {
            // SI EL USUARIO NO TENÍA NINGUNA FILA:
            // Verificamos si ese identificador de máquina ya existe
            const globalMachine = await Machine.findOne({ where: { nro_maquina: nroNuevo } });

            if (globalMachine) {
              // Si la máquina existe, le asignamos este dueño
              await globalMachine.update({ id_user: user.id });
            } else {
              // Si el identificador es totalmente nuevo, creamos la fila
              await Machine.create({ nro_maquina: nroNuevo, id_user: user.id });
            }
          }
        } else {
          // Si el campo viene vacío, desvinculamos al usuario de su máquina actual
          await Machine.update({ id_user: null }, { where: { id_user: user.id } });
        }
      }

      // 3. Gestión de Especializaciones (Many-to-Many)
      if (data.especializacion !== undefined) {
        const nombresArr = data.especializacion.split(",")
          .map(s => s.trim().toLowerCase())
          .filter(s => s !== "");

        const specInstances = await Promise.all(
          nombresArr.map(async (n) => {
            const [s] = await Specialization.findOrCreate({ where: { nombre: n } });
            return s;
          })
        );
        await user.setSpecializations(specInstances);
      }

      return user;
    } catch (error) {
      console.error("Error en UserService.update:", error.message);
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



