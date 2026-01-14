import { Machine, User, Worker } from "../schemas/schemas.js";

async function getAll() {
  try {
    return await Machine.findAll({
      // Incluimos los modelos relacionados para saber a quién pertenece la máquina
      include: [
        { model: User, attributes: ["nombre", "apellido"] },
        { model: Worker, attributes: ["nombres", "apellidos"] }
      ]
    });
  } catch (error) {
    throw error;
  }
}

async function getById(id) {
  try {
    if (id === undefined || id === null) return null;
    return await Machine.findByPk(id, {
      include: [
        { model: User, attributes: ["nombre", "apellido"] },
        { model: Worker, attributes: ["nombres", "apellidos"] }
      ]
    });
  } catch (error) {
    throw error;
  }
}

async function getByNro(nro_maquina) {
  try {
    return await Machine.findOne({ 
      where: { nro_maquina: Number(nro_maquina) },
      include: [
        { model: User, attributes: ["nombre", "apellido"] },
        { model: Worker, attributes: ["nombres", "apellidos"] }
      ]
    });
  } catch (error) {
    throw error;
  }
}

async function createMachine(data) {
  const payload = {
    id_user: data.id_user || null,
    id_workers: data.id_workers || null,
    nro_maquina: data.nro_maquina,
  };
  return await Machine.create(payload);
}

async function updateById(id, data) {
  const machine = await Machine.findByPk(id);
  if (!machine) return null;
  const payload = {
    id_user: data.id_user !== undefined ? data.id_user : machine.id_user,
    nro_maquina: data.nro_maquina !== undefined ? data.nro_maquina : machine.nro_maquina,
    id_workers: data.id_workers !== undefined ? data.id_workers : machine.id_workers,
  };
  await machine.update(payload);
  return machine;
}

async function deleteById(id) {
  if (id === undefined || id === null) return 0;
  return await Machine.destroy({ where: { id } });
}

export const MachineRepository = {
  getAll,
  getById,
  createMachine,
  updateById,
  deleteById,
  getByNro,
};