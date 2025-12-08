import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";

const Mainpage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);
  const handleViewChange = () => {
    // Aquí en el futuro podrás cambiar la vista
    console.log("Cambiar vista a reportes técnicos");
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      } min-h-screen w-screen flex flex-col`}
    >
      {/* Header */}
      <header
        className={`${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        } shadow-sm w-full`}
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Gestión de reportes</h1>

          {/* Controles */}
          <div className="flex items-center space-x-4">
            {/* Botón preparado para cambiar vista */}
            <button
              onClick={handleViewChange}
              className="px-3 py-2 rounded-md border text-sm font-medium hover:bg-gray-700"
            >
              Ver reportes técnicos
            </button>

            {/* Toggle de tema */}
            <button onClick={toggleTheme} className="text-xl">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            {/* Barra de búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className={`pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 text-gray-200 border-gray-600"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Usuario */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <img
                  src="https://via.placeholder.com/32"
                  alt="Usuario"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </button>

              {menuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded shadow-lg z-10 ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">
                    Perfil
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow w-full px-6 py-6">
        {/* Aquí irán los reportes */}
        <div>No se pudieron cargar los reportes</div>
      </main>
    </div>
  );
};

export default Mainpage;