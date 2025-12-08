import { Routes, Route } from "react-router-dom";
import Login from "@/components/Auth/login";
import SignUp from "@/components/Auth/signup";
import Mainpage from "@/components/main/ui/Mainpage";

const App = () => {
  return (
    <Routes>
      {/* Ruta raíz → Dashboard */}
      <Route path="/" element={<Mainpage />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Ruta por defecto */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App