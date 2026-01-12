import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../layouts/aside"; 
import UserProfile from "../profile/profile"; 
import { FaSearch, FaPlus, FaArrowLeft } from "react-icons/fa";
import { FiSun, FiMoon, FiMenu } from "react-icons/fi";
import { Dialog, DialogContent, DialogTitle, IconButton, Tabs, Tab, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Formularios
import ReportForm from "../form/report"; 
import WorkerForm from "../form/workersreport"; 
import UserForm from "../form/usersform";     

// Listas
import ReportList from "../card/reportlist";
import ReportTechList from "../card/reportechlist";
import Dashboard from "../stadistics/dashboard";
import WorkerList from "../card/workerlist"; 
import UserList from "../card/userlist";

const Mainpage = () => {
  // --- Estados ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    return t === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [view, setView] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // --- OBTENER ROL DEL LOCALSTORAGE ---
  // Convertimos a minúsculas para evitar errores de comparación
  const userRole = localStorage.getItem('role')?.toLowerCase() || "";
  const isAdmin = userRole === "administrador";

  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/', { replace: true });
  };

  const handleOpenForm = () => {
    // Si es técnico, siempre abre en el tab 0 (Reportes)
    if (!isAdmin) {
      setActiveTab(0);
    } else {
      if (view === "workers") setActiveTab(1);
      else if (view === "users") setActiveTab(2);
      else setActiveTab(0);
    }
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1); 
    setIsFormOpen(false);
  };

  const getHeaderTitle = () => {
    switch(view) {
      case 'dashboard': return "Gestión de Reportes";
      case 'tech': return "Reportes Técnicos";
      case 'stadistics': return "Estadísticas Generales";
      case 'workers': return "Gestión de Trabajadores";
      case 'users': return "Gestión de Usuarios";
      case 'profile': return "Mi Perfil";
      default: return "Panel de Administración";
    }
  };

  const getSearchPlaceholder = () => {
    switch(view) {
      case 'dashboard': return "Buscar reporte por caso...";
      case 'tech': return "Buscar reporte técnico...";
      case 'workers': return "Buscar por ficha, nombre o apellido...";
      case 'users': return "Buscar por nombre, ficha o C.I...";
      default: return "Buscar...";
    }
  };

  // Solo mostrar búsqueda si la vista actual está permitida para el rol
  const canSeeView = (v) => {
    if (v === "workers" || v === "users") return isAdmin;
    return true;
  };

  const showSearch = ["dashboard", "tech", "workers", "users"].includes(view) && canSeeView(view);

  useEffect(() => {
    setSearchTerm("");
    // Seguridad básica: si un técnico intenta entrar a workers/users, devolverlo al dashboard
    if (!isAdmin && (view === "workers" || view === "users")) {
      setView("dashboard");
    }
  }, [view, isAdmin]);

  return (
    <SidebarLayout 
      isOpen={sidebarOpen} 
      setIsOpen={setSidebarOpen} 
      darkMode={darkMode}
      onNavigate={setView}
      userRole={userRole} // Asegúrate de que SidebarLayout también use este role para ocultar los botones
    >
      <header className={`${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-800 border-gray-200"} shadow-sm w-full border-b transition-colors relative z-10`}>
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded hover:bg-opacity-20 transition-colors focus:outline-none">
              <FiMenu size={24} />
            </button>

            <div className="flex items-center gap-2">
              {view !== "dashboard" && (
                <button onClick={() => setView("dashboard")} className="p-1 rounded-full hover:bg-gray-500/30 transition text-sm">
                  <FaArrowLeft />
                </button>
              )}
              <h1 className="text-xl font-bold">{getHeaderTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:bg-gray-500/20">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            {showSearch && (
              <div className="relative hidden sm:block animate-fade-in">
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64 md:w-80 ${
                    darkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white text-gray-800 border-gray-300"
                  }`}
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            )}

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none block">
                <img src="https://via.placeholder.com/32" alt="Usuario" className="w-8 h-8 rounded-full border-2 border-blue-500 cursor-pointer" />
              </button>
              {menuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 py-1 overflow-hidden border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
                  <button onClick={() => { setView("profile"); setMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
                    Ver Perfil
                  </button>
                  <div className={`h-[1px] w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 font-bold transition-colors">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-grow w-full px-6 py-6 h-[calc(100vh-80px)] overflow-y-auto ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
        {view === "dashboard" && (
          <div className="pb-20">
             <ReportList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />
          </div>
        )}
        
        {view === "stadistics" && (
          <div className="pb-20">
            <Dashboard darkMode={darkMode} />
          </div>
        )}
        
        {view === "tech" && (
          <div className="pb-20">
            <ReportTechList key={refreshKey} userId={Number(localStorage.getItem('userId')) || undefined} darkMode={darkMode} searchTerm={searchTerm} />
          </div>
        )}

        {/* --- VISTAS PROTEGIDAS PARA ADMIN --- */}
        {isAdmin && view === "workers" && (
          <div className="pb-20">
            <WorkerList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />
          </div>
        )}

        {isAdmin && view === "users" && (
          <div className="pb-20">
            <UserList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />
          </div>
        )}

        {view === "profile" && <UserProfile darkMode={darkMode} />}
      </main>

      {!isFormOpen && (
        <button
          onClick={handleOpenForm}
          className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform transform hover:scale-110 focus:outline-none z-30 flex items-center justify-center"
        >
          <FaPlus size={24} />
        </button>
      )}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
            borderRadius: '16px'
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-bold uppercase text-xs tracking-widest opacity-70">Añadir Nuevo Registro</span>
          <IconButton onClick={() => setIsFormOpen(false)} sx={{ color: darkMode ? '#9ca3af' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': { fontSize: '0.7rem', fontWeight: 'bold', color: darkMode ? '#9ca3af' : 'inherit' },
              '& .Mui-selected': { color: '#3b82f6 !important' }
            }}
          >
            <Tab label="Reporte" />
            {/* --- TABS PROTEGIDOS PARA ADMIN --- */}
            {isAdmin && <Tab label="Trabajador" />}
            {isAdmin && <Tab label="Usuario" />}
          </Tabs>
        </Box>
        
        <DialogContent dividers sx={{ borderColor: darkMode ? '#374151' : '#f3f4f6' }}>
          {activeTab === 0 && <ReportForm onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
          
          {/* --- FORMULARIOS PROTEGIDOS PARA ADMIN --- */}
          {isAdmin && activeTab === 1 && (
            <WorkerForm initialData={{}} readOnlyDefault={false} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />
          )}
          {isAdmin && activeTab === 2 && (
            <UserForm initialData={{}} readOnlyDefault={false} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Mainpage;