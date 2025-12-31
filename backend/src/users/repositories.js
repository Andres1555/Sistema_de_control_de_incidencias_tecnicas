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
  const payload = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.apellido !== undefined) payload.apellido = data.apellido;
  if (data.email !== undefined) payload.correo = data.email; // map email -> correo
  if (data.ficha !== undefined) payload.ficha = data.ficha;
  if (data.telefono !== undefined) payload.telefono = data.telefono;
  if (data.rol !== undefined) payload.rol = data.rol;
  if (data.extension !== undefined) payload.extension = data.extension;
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
