import { SpecializationUsers } from "../schemas/schemas.js";

async function getAll() {
  try {
    return await SpecializationUsers.findAll();
  } catch (error) {
    throw error;
  }
}

async function getById(id) {
  try {
    if (id === undefined || id === null) return null;
    return await SpecializationUsers.findByPk(id);
  } catch (error) {
    throw error;
  }
}

async function create(data) {
  try {
    // data debe contener { id_user, id_specia }
    return await SpecializationUsers.create({
      id_user: data.id_user,
      id_specia: data.id_specia
    });
  } catch (error) {
    throw error;
  }
}

async function findRelation(id_user, id_specia) {
  try {
    return await SpecializationUsers.findOne({
      where: { id_user, id_specia }
    });
  } catch (error) {
    throw error;
  }
}

async function updateById(id, data) {
  try {
    const item = await SpecializationUsers.findByPk(id);
    if (!item) return null;
    await item.update(data);
    return item;
  } catch (error) {
    throw error;
  }
}

async function deleteById(id) {
  try {
    if (id === undefined || id === null) return 0;
    return await SpecializationUsers.destroy({ where: { id } });
  } catch (error) {
    throw error;
  }
}

// Exportamos todas las funciones dentro del objeto
export const SpecuserRepository = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
  findRelation,
};