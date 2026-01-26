import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../Pasantiatest.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath, 
  logging: false
});

export const Worker = sequelize.define('Worker', {
  ficha: { type: DataTypes.INTEGER, field: 'FICHA' },
  nombres: { type: DataTypes.STRING(500), field: 'NOMBRES' },
  apellidos: { type: DataTypes.STRING(500), field: 'APELLIDOS' },
  anio_nac: { type: DataTypes.INTEGER, field: 'AÑONAC' },
  mes_nac: { type: DataTypes.INTEGER, field: 'MESNAC' },
  dia_nac: { type: DataTypes.INTEGER, field: 'DIANAC' },
  dpto: { type: DataTypes.STRING(500), field: 'DPTO.' },
  gcia: { type: DataTypes.STRING(500), field: 'GCIA' }
}, {
  tableName: 'Worker',
  timestamps: false
});

export const User = sequelize.define('Users', {
  nombre: { type: DataTypes.STRING(500) },
  apellido: { type: DataTypes.STRING(500) },
  correo: { type: DataTypes.STRING(500) },
  password: { type: DataTypes.STRING(500) },
  ficha: { type: DataTypes.INTEGER },
  telefono: { type: DataTypes.STRING },
  C_I: { type: DataTypes.INTEGER, field: 'C.I' },
  rol: { type: DataTypes.STRING(500) },
  extension: { type: DataTypes.INTEGER }
}, {
  tableName: 'Users',
  timestamps: false
});

export const Machine = sequelize.define('Machine', {
  id_user: { type: DataTypes.INTEGER },
  id_workers: { type: DataTypes.INTEGER }, 
  nro_maquina: { type: DataTypes.STRING, field: 'nro de la maquina' }
}, {
  tableName: 'Machine',
  timestamps: false
});

export const Report = sequelize.define('Report', {
  id_maquina: { type: DataTypes.INTEGER },
  id_workers: { type: DataTypes.INTEGER },
  id_user: { type: DataTypes.INTEGER },
  caso: { type: DataTypes.STRING(500) },
  area: { type: DataTypes.STRING(500) },
  estado: { type: DataTypes.STRING(500) },
  cargo: { type: DataTypes.STRING(500) }, 
  descripcion: { type: DataTypes.STRING(500) },
  nombre_natural: { type: DataTypes.STRING(500), field: 'nombre natural' },
  nombre_windows: { type: DataTypes.STRING(500), field: 'nombre windows' }, 
  clave_natural: { type: DataTypes.INTEGER, field: 'clave natural' },
  clave_acceso_windows: { type: DataTypes.INTEGER, field: 'clave de acceso windows' },
  fecha: { type: DataTypes.DATEONLY }
}, {
  tableName: 'Report',
  timestamps: false
});

export const ReportCase = sequelize.define('ReportCase', {
  id_user: { type: DataTypes.INTEGER },
  id_report: { type: DataTypes.INTEGER },
  caso_tecnico: { type: DataTypes.STRING(500), field: 'caso tecnico' },
  resolucion: { type: DataTypes.STRING(500), field: 'resolucion ' },
  tiempo: { type: DataTypes.TIME }
}, {
  tableName: 'ReportCase',
  timestamps: false
});

export const Specialization = sequelize.define('Specialization', {
  nombre: { type: DataTypes.STRING(500) }
}, {
  tableName: 'Specialization',
  timestamps: false
});

export const SpecializationUsers = sequelize.define('SpecializationUsers', {
  id_user: { type: DataTypes.INTEGER },
  id_specia: { type: DataTypes.INTEGER }
}, {
  tableName: 'SpecializationUsers',
  timestamps: false
});


Worker.hasMany(Machine, { foreignKey: 'id_workers' });
Machine.belongsTo(Worker, { foreignKey: 'id_workers' });

Worker.hasMany(Report, { foreignKey: 'id_workers' });
Report.belongsTo(Worker, { foreignKey: 'id_workers' });

User.hasMany(Machine, { foreignKey: 'id_user' });
Machine.belongsTo(User, { foreignKey: 'id_user' });

Machine.hasMany(Report, { foreignKey: 'id_maquina' });
Report.belongsTo(Machine, { foreignKey: 'id_maquina' });

User.hasMany(Report, { foreignKey: 'id_user' });
Report.belongsTo(User, { foreignKey: 'id_user' });

Report.hasMany(ReportCase, { foreignKey: 'id_report' });
ReportCase.belongsTo(Report, { foreignKey: 'id_report' });

User.hasMany(ReportCase, { foreignKey: 'id_user' });
ReportCase.belongsTo(User, { foreignKey: 'id_user' });

User.belongsToMany(Specialization, { through: SpecializationUsers, foreignKey: 'id_user', otherKey: 'id_specia' });
Specialization.belongsToMany(User, { through: SpecializationUsers, foreignKey: 'id_specia', otherKey: 'id_user' });

export async function initDatabase() {
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    // alter: true creará automáticamente el campo 'nombre windows' en la tabla Report
    await sequelize.sync({ alter: true });
  } catch (e) {
    console.error('Error sincronizando:', e);
  } finally {
    await sequelize.query('PRAGMA foreign_keys = ON;');
  }
}

export default sequelize;