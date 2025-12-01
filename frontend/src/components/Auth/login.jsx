import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", formData);
      console.log("Login exitoso:", res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Login</h2>
  <form onSubmit={handleSubmit} className="space-y-4 text-left mx-auto" style={{ maxWidth: "380px" }}>
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={formData.email}
            onChange={(e) => handleInputChange(e, setFormData)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange(e, setFormData)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-black py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Ingresar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link to="/signup" className="text-blue-700 font-semibold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;