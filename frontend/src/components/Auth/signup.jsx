import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    ficha: "",
    telefono: "",
    C_I: "",
    rol: "",
    extension: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ajusta la URL según tu backend
      const res = await axios.post("http://localhost:4000/api/auth/signup", formData);
      console.log("Registro exitoso:", res.data);

      // Redirigir al login después de registrarse
      navigate("/login");
    } catch (err) {
      console.error("Error en registro:", err);
      alert("Error al registrarse");
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Registro</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mx-auto" style={{ maxWidth: "640px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo"
              value={formData.correo}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="ficha"
              placeholder="Ficha"
              value={formData.ficha}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="C_I"
              placeholder="Cédula de Identidad"
              value={formData.C_I}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="rol"
              placeholder="Rol"
              value={formData.rol}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="extension"
              placeholder="Extensión"
              value={formData.extension}
              onChange={(e) => handleInputChange(e, setFormData)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-700 text-black py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Registrarse
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-700 font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;