import express from "express";
import cors from "cors";

// ... (tus imports de rutas se mantienen igual)
import routesusers from "./src/users/routes.js";
import routesreport from "./src/report/routes.js";
import routesreportcase from "./src/report_cases/routes.js";
import routesauth from "./src/auth/routes.js";
import routesmachines from "./src/machines/routes.js"; 
import routesspec from "./src/specializations/routes.js";
import routesspec_users from "./src/specialization_users/routes.js";
import { setupDatabase } from "./config/db.js";
import routestadistic from "./src/stadistic/routes.js";
import routesworkers from "./src/workers/routes.js";

const app = express();

// RECOMENDACIÓN: Configura CORS de forma un poco más explícita para evitar bloqueos
app.use(cors({
    origin: "*", // En producción podrías poner la IP del front, pero "*" es más seguro para probar ahora
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/stadistic", routestadistic);
app.use("/api/users", routesusers);
app.use("/api/report", routesreport);
app.use("/api/report_cases", routesreportcase);
app.use("/api/auth",routesauth)
app.use("/api/machines", routesmachines);
app.use("/api/specializations", routesspec);
app.use("/api/specialization_users", routesspec_users);
app.use("/api/workers", routesworkers);

// Mantendremos el 8080 como puerto interno por defecto
const PORT = process.env.PORT || 8080;

const start = async () => {
    try {
        if (process.env.SKIP_DB_SETUP !== '1') {
            await setupDatabase();
            console.log('Base de datos sincronizada');
        } else {
            console.log('No se pudo crear la base de datos');
        }

        // --- CAMBIO OBLIGATORIO: Escuchar en "0.0.0.0" ---
        // Esto permite que Podman redirija el tráfico del servidor al contenedor.
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (err) {
        console.error('Error al inicializar el servidor:', err);
        process.exit(1);
    }
};

start();