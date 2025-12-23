import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthRepository } from './repositories.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son requeridos' });

    const user = await AuthRepository.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password || '');
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const payload = { id: user.id, ci: user.C_I, rol: user.rol };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    return res.status(200).json({ token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo, rol: user.rol } });
  } catch (err) {
    console.error('Auth error', err);
    return res.status(500).json({ message: 'Error en autenticación', error: err.message });
  }
};

export default { LoginController };
