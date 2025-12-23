import { User } from '../schemas/schemas.js';

async function findByEmail(email) {
  if (!email) return null;
  return await User.findOne({ where: { correo: email } });
}

export const AuthRepository = {
  findByEmail,
};

export default AuthRepository;
