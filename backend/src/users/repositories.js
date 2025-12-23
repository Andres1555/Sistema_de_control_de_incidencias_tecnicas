import { User } from "../schemas/schemas.js";

async function getAll() {
  return await User.findAll();
}

async function getById(id) {
  if (id === undefined || id === null) return null;
  const byPk = await User.findByPk(id);
  if (byPk) return byPk;
  const byCI = await User.findOne({ where: { C_I: id } });
  return byCI;
}

async function createUser(data) {
  const payload = {
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.email,
    password: data.password,
    ficha: data.ficha,
    telefono: data.telefono,
    C_I: data.ci,
    rol: data.rol,
    extension: data.extension,
  };
  return await User.create(payload);
}
async function updateByCI(ci, data) {
  const user = await User.findOne({ where: { C_I: ci } });
  if (!user) return null;
  const payload = {
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.email,
    ficha: data.ficha,
    telefono: data.telefono,
    rol: data.rol,
    extension: data.extension,
  };
  await user.update(payload);
  return user;
}

async function deleteByIdOrCI(id) {
  if (id === undefined || id === null) return 0;
  let destroyed = await User.destroy({ where: { id } });
  if (destroyed) return destroyed;
  destroyed = await User.destroy({ where: { C_I: id } });
  return destroyed;
}

export const UserRepository = {
  getAll,
  getById,
  createUser,
  updateByCI,
  deleteByIdOrCI,
};
