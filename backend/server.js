import express from "express";
import cors from "cors";

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


app.use(cors());
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


const PORT = process.env.PORT || 8080;

const start = async () => {
    try {
        
        if (process.env.SKIP_DB_SETUP !== '1') {
            await setupDatabase();
            console.log('Base de datos sincronizada');
        } else {
            console.log('no se pudo crear la base de datos');
        }

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error al inicializar iniciar el servidor:', err);
        process.exit(1);
    }
};

start();