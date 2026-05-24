# Sistema de Control de Incidencias Técnicas

Este es un sistema web completo  diseñado para gestionar, reportar y resolver incidencias y soportes técnicos dentro de una organización. Permite registrar trabajadores, asignarles equipos, reportar fallos, delegar a técnicos especializados y realizar el seguimiento completo de los reportes hasta su resolución.

El proyecto está estructurado con una arquitectura moderna de **Frontend (React)** y **Backend (Node.js/Express)**, conectado a una base de datos **SQLite** usando **Sequelize** y dockerizado para su despliegue y desarrollo ágil.

---

##  Características Principales

*   ** Autenticación y Autorización**: Registro e inicio de sesión seguro para usuarios y técnicos utilizando contraseñas cifradas con `bcryptjs` y sesiones controladas vía `JSON Web Tokens (JWT)`.
*   ** Gestión de Incidencias (Reportes)**: Creación, asignación, actualización de estado (abierto, en proceso, resuelto) y eliminación de incidencias.
*   ** Control de Usuarios y Trabajadores**: Gestión de la información de trabajadores (Ficha, Nombres, Apellidos, Departamento, Gerencia) y usuarios del sistema (Administradores, Técnicos).
*   ** Inventario de Máquinas**: Asociación de equipos técnicos (números de máquina/PC) a los usuarios y trabajadores.
*   ** Especialidades de Técnicos**: Asignación de especializaciones tecnológicas a los técnicos de soporte para derivar las incidencias al personal adecuado.
*   ** Módulo de Estadísticas**: Gráficos e indicadores clave del rendimiento del soporte técnico (número de reportes, tiempos de resolución, incidencias comunes).
*   ** Carga Masiva (CSV)**: Soporte para importación de datos masivos de trabajadores e incidencias mediante archivos CSV.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
*   **React 19** con **Vite** (para compilación ultra rápida y HMR).
*   **Tailwind CSS v4** (para estilos modernos y responsivos).
*   **Material UI (MUI) v7** (para componentes gráficos enriquecidos e interactivos).
*   **React Router DOM v7** (para el enrutamiento interno de la aplicación).
*   **Framer Motion** (para micro-animaciones dinámicas y transiciones fluidas).
*   **Axios** (para el consumo de la API REST del backend).

### Backend
*   **Node.js** con **Express.js** (para levantar la API REST).
*   **Sequelize ORM** (para el mapeo objeto-relacional y consultas estructuradas).
*   **SQLite3** / **@libsql/client** (motor de base de datos ligero, autónomo y rápido).
*   **JSON Web Tokens (JWT)** y **Bcrypt.js** (seguridad y control de sesiones).
*   **Multer** y **CSV-Parser** (para la gestión y lectura de archivos CSV adjuntos).

### Despliegue y Contenedores
*   **Docker / Docker Compose** (para orquestar y levantar toda la suite localmente con un comando).

---

## Estructura del Proyecto

```text
Sistema_de_control_de_incidencias_tecnicas/
├── backend/                  # Código del Servidor (NodeJS + Express)
│   ├── config/               # Configuración de base de datos y variables de entorno
│   ├── models/               # Modelos adicionales o utilidades
│   ├── src/                  # Capa de negocio (Usuarios, Reportes, Máquinas, etc.)
│   │   ├── auth/             # Autenticación y cifrado
│   │   ├── machines/         # Lógica de equipos técnicos
│   │   ├── report/           # Lógica de creación e historial de reportes
│   │   ├── report_cases/     # Resoluciones técnicas
│   │   ├── schemas/          # Definición de tablas y relaciones con Sequelize
│   │   ├── specializations/  # Especializaciones técnicas
│   │   ├── specialization_users/ # Asignación de especialidades a usuarios
│   │   ├── stadistic/        # Generación de métricas de servicio
│   │   ├── users/            # Gestión de cuentas y perfiles
│   │   └── workers/          # Registro de empleados
│   ├── server.js             # Punto de entrada de la API backend
│   └── Dockerfile            # Configuración Docker del backend
│
├── frontend/                 # Interfaz de Usuario (React + Vite)
│   ├── public/               # Recursos estáticos
│   ├── src/                  # Componentes, vistas y lógica de la UI
│   ├── index.html            # Plantilla HTML base
│   ├── vite.config.js        # Configuración del compilador Vite
│   ├── tailwind.config.js    # Configuración de estilos Tailwind CSS
│   └── Dockerfile            # Configuración Docker del frontend
│
├── compose.yaml              # Archivo de orquestación de Docker Compose
└── package.json              # Configuración raíz de dependencias (opcional)
```

---

## 🛢️ Modelo de Datos (Esquema de Base de Datos)

El sistema crea y gestiona automáticamente una base de datos SQLite llamada `Gestion de reportes.sqlite` con las siguientes tablas y relaciones:

*   **`Users`**: Usuarios de la aplicación (Administradores y Técnicos) con su rol, correo y credenciales de acceso.
*   **`Worker`**: Empleados de la organización que pueden reportar fallas u operar equipos.
*   **`Machine`**: Equipos tecnológicos (PCs, Laptops, etc.) vinculados a un usuario o trabajador.
*   **`Report`**: El registro principal de la incidencia. Contiene descripciones del problema, credenciales requeridas, fechas, departamento y estado.
*   **`ReportCase`**: Resoluciones técnicas de las incidencias (acciones realizadas por el técnico y tiempo invertido).
*   **`Specialization`**: Tipos de áreas técnicas en las que se divide el soporte (por ejemplo: Redes, Software, Hardware).
*   **`SpecializationUsers`**: Tabla asociativa muchos-a-muchos que vincula técnicos con sus áreas de especialización.

---


### Ejecución Local en Entorno de Desarrollo

Ejecutar el frontend y el backend de forma local e independiente, sigue estos pasos:

#### 1. Requisitos Previos
*   Tener instalado **Node.js** (versión 18 o superior recomendada).
*   Tener instalado **npm** 

#### 2. Configurar y Ejecutar el Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor en modo desarrollo (utiliza `nodemon` para reinicios automáticos):
   ```bash
   npm start
   ```
   *El servidor backend se iniciará en `http://localhost:8080`  y generará la base de datos local SQLite automáticamente.*

#### 3. Configurar y Ejecutar el Frontend
1. Abre una nueva terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *El frontend por defecto estará disponible en `http://localhost:5173`.*

---

## Principales Rutas de la API (Endpoints)

| Módulo | Endpoint | Método | Descripción |
| :--- | :--- | :--- | :--- |
| **Autenticación** | `/api/auth/login` | `POST` | Iniciar sesión y obtener token JWT. |
| | `/api/auth/register` | `POST` | Registro de nuevos usuarios/técnicos. |
| **Usuarios** | `/api/users` | `GET` / `POST` | Listar y crear usuarios del sistema. |
| **Trabajadores**| `/api/workers` | `GET` / `POST` | Listar y registrar empleados de la empresa. |
| **Máquinas** | `/api/machines` | `GET` / `POST` | Listar e inventariar equipos. |
| **Reportes** | `/api/report` | `GET` / `POST` | Obtener y crear nuevas incidencias técnicas. |
| | `/api/report/:id` | `PUT` / `DELETE`| Modificar estado o eliminar reportes. |
| **Resoluciones**| `/api/report_cases`| `GET` / `POST` | Guardar el diagnóstico y tiempo de solución. |
| **Estadísticas**| `/api/stadistic` | `GET` | Obtener métricas y KPI de incidencias. |

---

## Contribuciones y Notas de Desarrollo
*   **Base de datos**: SQLite facilita la portabilidad absoluta del desarrollo. Si necesitas migrar a MySQL, Sequelize permite cambiar la configuración en `backend/config/db.js` y actualizar las dependencias correspondientes.
*   **Estilos**: El frontend utiliza Tailwind CSS de forma nativa en combinación con Material UI, asegurando una estética impecable, moderna e interactiva para el usuario.
