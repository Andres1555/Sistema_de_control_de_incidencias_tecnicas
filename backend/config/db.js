import path from 'path';
import sqlite3 from 'sqlite3';
import { initDatabase } from '../src/schemas/schemas.js';

const DB_PATH = path.resolve(process.cwd(), 'Gestion de reportes.sqlite');

const SQL = `
CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  nombre varchar(500),
  apellido varchar(500),
  correo varchar(500),
  ficha integer,
  telefono varchar,
  "C.I" integer,
  rol varchar(500),
  extension integer,
  area varchar(500)
);

-- NUEVA TABLA: Worker 
CREATE TABLE IF NOT EXISTS Worker (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  FICHA integer,
  NOMBRES varchar(500),
  APELLIDOS varchar(500),
  AÑONAC integer,
  MESNAC integer,
  DIANAC integer,
  "DPTO." varchar(500),
  GCIA varchar(500)
);

CREATE TABLE IF NOT EXISTS Machine (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id_user bigint,
  id_workers bigint, 
  "nro de la maquina" integer
);

CREATE TABLE IF NOT EXISTS Report (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id_maquina bigint,
  id_workers bigint, 
  id_user bigint,
  caso varchar(500),
  area varchar(500),
  estado varchar(500),
  cargo varchar(500),  -- <--- COLUMNA AGREGADA
  descripcion varchar(500),
  "nombre natural" varchar(500),
  "clave natural" integer,
  "nombre windows" varchar(500),
  "clave de acceso windows" integer,
  fecha date,
  departamento varchar(500),
  tipo varchar(500),
  FOREIGN KEY (id_workers) REFERENCES Worker (id),
  FOREIGN KEY (id_user) REFERENCES Users (id)
);

CREATE TABLE IF NOT EXISTS "SpecializationUsers" (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id_user bigint,
  id_specia bigint
);

CREATE TABLE IF NOT EXISTS Specialization (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  nombre varchar(500)
);

CREATE TABLE IF NOT EXISTS "ReportCase" (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  id_user bigint,
  id_report bigint,
  "caso tecnico" varchar(500),
  "resolucion " varchar(500),
  tiempo time
);
`;

export async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const sqlite = sqlite3.verbose();
    const db = new sqlite.Database(DB_PATH, (err) => {
      if (err) return reject(err);

      db.serialize(() => {
        db.exec(SQL, async (execErr) => {
          if (execErr) {
            db.close(() => reject(execErr));
            return;
          }

          // --- ASEGURAR COLUMNAS EN TABLAS EXISTENTES ---
          const alterCommands = [
            `ALTER TABLE Users ADD COLUMN area varchar(500);`,
            `ALTER TABLE Report ADD COLUMN departamento varchar(500);`,
            `ALTER TABLE Report ADD COLUMN tipo varchar(500);`
          ];

          for (const cmd of alterCommands) {
            try {
              db.run(cmd, (err) => {
                // Ignoramos errores si la columna ya existe
                if (err && !err.message.includes("duplicate column name")) {
                    // console.log("Nota: Columna ya existe o error menor:", err.message);
                }
              });
            } catch (e) {}
          }

          db.close(async (closeErr) => {
            if (closeErr) return reject(closeErr);
            try {
              
              await initDatabase();
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });
      });
    });
  });
}

export default setupDatabase;