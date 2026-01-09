import { Routes, Route } from "react-router-dom";
import Login from "@/components/Auth/login";
import SignUp from "@/components/Auth/signup";
import WorkersLogin from "@/components/Auth/workers";
import Mainpage from "@/components/main/ui/Mainpage";
import WorkersPage from "@/components/main/ui/workerspage";

const App = () => {
  return (
    <Routes>
      {/* Ruta raíz → Ahora es Login */}
      <Route path="/" element={<Login />} />

      {/* Rutas de autenticación */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/workers-login" element={<WorkersLogin />} />

      {/* Rutas de Paneles (Privadas) */}
      <Route path="/dashboard" element={<Mainpage />} />
      <Route path="/workers" element={<WorkersPage />} />

      {/* Ruta por defecto */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App;