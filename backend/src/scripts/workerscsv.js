import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { Worker } from '../schemas/schemas.js';

// Obtener la ruta de la carpeta actual (src/scripts)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cargarCsv() {
  
  const csvPath = path.join(__dirname, 'DATACUMPLE.csv');
  
  console.log('--- IMPORTACIÓN DE TRABAJADORES ---');
  console.log('Buscando CSV en:', csvPath);

  if (!fs.existsSync(csvPath)) {
    console.error('El archivo csv no está en la carpeta ');
    return;
  }

  const trabajadores = [];

  fs.createReadStream(csvPath)
    .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.trim() }))
    .on('data', (row) => {
      
      if (row.FICHA) {
        trabajadores.push({
          ficha: parseInt(row.FICHA),
          nombres: row.NOMBRES,
          apellidos: row.APELLIDOS,
          anio_nac: parseInt(row.AÑONAC),
          mes_nac: parseInt(row.MESNAC),
          dia_nac: parseInt(row.DIANAC),
          dpto: row['DPTO.'],
          gcia: row.GCIA
        });
      }
    })
    .on('end', async () => {
      console.log(`Filas capturadas del CSV: ${trabajadores.length}`);
      
      if (trabajadores.length === 0) {
        console.error('No se leyeron datos. Verifica que el separador sea correcto');
        return;
      }

      try {
        console.log('Guardando en Pasantiatest.sqlite');
        await Worker.bulkCreate(trabajadores);
        console.log('importancion agregada');
      } catch (err) {
        console.error('Error en la base de datos:', err.message);
      } finally {
        process.exit();
      }
    });
}

cargarCsv();