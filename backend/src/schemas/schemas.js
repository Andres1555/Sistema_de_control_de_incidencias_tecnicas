import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './Pasantiatest.sqlite', 
  logging: false
});


export const User = sequelize.define('Users', {
  nombre: { type: DataTypes.STRING(500) },
  apellido: { type: DataTypes.STRING(500) },
  correo: { type: DataTypes.STRING(500) },
  password: { type: DataTypes.STRING(500) },
  ficha: { type: DataTypes.INTEGER },
  telefono: { type: DataTypes.INTEGER },
  C_I: { type: DataTypes.INTEGER, field: 'C.I' },
  rol: { type: DataTypes.STRING(500) },
  extension: { type: DataTypes.INTEGER }
}, {
  tableName: 'Users',
  timestamps: false
});


export const Machine = sequelize.define('Machine', {
  id_user: { type: DataTypes.INTEGER },
  nro_maquina: { type: DataTypes.INTEGER, field: 'nro de la maquina' }
}, {
  tableName: 'Machine',
  timestamps: false
});


export const Report = sequelize.define('Report', {
  id_maquina: { type: DataTypes.INTEGER },
  caso: { type: DataTypes.STRING(500) },
  area: { type: DataTypes.STRING(500) },
  estado: { type: DataTypes.STRING(500) },
  descripcion: { type: DataTypes.STRING(500) },
  nombre_natural: { type: DataTypes.STRING(500), field: 'nombre natural' },
  clave_natural: { type: DataTypes.INTEGER, field: 'clave natural' },
  clave_acceso_windows: { type: DataTypes.INTEGER, field: 'clave de acceso windows' },
  fecha: { type: DataTypes.DATEONLY }
}, {
  tableName: 'Report',
  timestamps: false
});


export const ReportUser = sequelize.define('ReportUser', {
  id_user: { type: DataTypes.INTEGER },
  id_report: { type: DataTypes.INTEGER },
}, {
  tableName: 'ReportUser',
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




User.hasMany(Machine, { foreignKey: 'id_user' });
Machine.belongsTo(User, { foreignKey: 'id_user' });

Machine.hasMany(Report, { foreignKey: 'id_maquina' });
Report.belongsTo(Machine, { foreignKey: 'id_maquina' });

User.belongsToMany(Report, { through: ReportUser, foreignKey: 'id_user', otherKey: 'id_report' });
Report.belongsToMany(User, { through: ReportUser, foreignKey: 'id_report', otherKey: 'id_user' });

Report.hasMany(ReportCase, { foreignKey: 'id_report' });
ReportCase.belongsTo(Report, { foreignKey: 'id_report' });

User.hasMany(ReportCase, { foreignKey: 'id_user' });
ReportCase.belongsTo(User, { foreignKey: 'id_user' });

User.belongsToMany(Specialization, { through: SpecializationUsers, foreignKey: 'id_user', otherKey: 'id_specia' });
Specialization.belongsToMany(User, { through: SpecializationUsers, foreignKey: 'id_specia', otherKey: 'id_user' });


export async function initDatabase() {
  // Evitar conflicto con tablas de backup creadas por sincronizaciones previas
  try {
    await sequelize.query('DROP TABLE IF EXISTS "Users_backup";');
  } catch (e) {
    console.warn('No se pudo eliminar Users_backup (continuando):', e.message || e);
  }

  // Desactivar temporalmente las constraints de FK durante alteraciones complejas en SQLite
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF;');
  } catch (e) {
    console.warn('No se pudo desactivar foreign_keys (continuando):', e.message || e);
  }

  try {
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada con Sequelize');
  } finally {
    try {
      await sequelize.query('PRAGMA foreign_keys = ON;');
    } catch (e) {
      console.warn('No se pudo reactivar foreign_keys:', e.message || e);
    }
  }
}

export default sequelize;
