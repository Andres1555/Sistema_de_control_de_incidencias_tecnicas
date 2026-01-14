import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../layouts/aside"; 
import UserProfile from "../profile/profile"; 
import { FaSearch, FaPlus, FaArrowLeft, FaUser } from "react-icons/fa";
import { FiSun, FiMoon, FiMenu, FiLogOut } from "react-icons/fi";
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

  // Datos del Usuario para el Avatar estilo Gmail
  const userName = localStorage.getItem('userName') || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();

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
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleOpenForm = () => {
    if (!isAdmin) setActiveTab(0);
    else {
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
      case 'dashboard': return "Buscar reporte...";
      case 'tech': return "Buscar reporte técnico...";
      case 'workers': return "Buscar trabajador...";
      case 'users': return "Buscar usuario...";
      default: return "Buscar...";
    }
  };

  const showSearch = ["dashboard", "tech", "workers", "users"].includes(view);

  useEffect(() => {
    setSearchTerm("");
    if (!isAdmin && (view === "workers" || view === "users")) {
      setView("dashboard");
    }
  }, [view, isAdmin]);

  // Colores dinámicos del Avatar
  const avatarBg = darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-700 hover:bg-blue-800";

  return (
    <SidebarLayout 
      isOpen={sidebarOpen} 
      setIsOpen={setSidebarOpen} 
      darkMode={darkMode}
      onNavigate={setView}
      userRole={userRole}
    >
      {/* --- HEADER AZUL NAVY --- */}
      <header className={`${
        darkMode 
          ? "bg-[#1e293b] text-slate-100 border-slate-700" 
          : "bg-white text-slate-800 border-slate-200"
        } shadow-sm w-full border-b transition-colors sticky top-0 z-40`}>
        <div className="w-full px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors focus:outline-none">
              <FiMenu size={24} />
            </button>

            <div className="flex items-center gap-2">
              {view !== "dashboard" && (
                <button onClick={() => setView("dashboard")} className="p-1 rounded-full hover:bg-slate-500/20 transition text-sm">
                  <FaArrowLeft />
                </button>
              )}
              <h1 className="text-xl font-bold tracking-tight">{getHeaderTitle()}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {/* Buscador */}
            {showSearch && (
              <div className="relative hidden lg:block animate-fade-in">
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-80 ${
                    darkMode 
                      ? "bg-[#334155] text-white border-slate-600 placeholder-slate-400" 
                      : "bg-slate-50 text-slate-800 border-slate-300"
                  }`}
                />
                <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            )}

            <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:bg-slate-500/10 transition-colors">
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-blue-700" />}
            </button>

            {/* BOTÓN PERFIL ESTILO GMAIL */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm transform transition-all active:scale-90 focus:outline-none ${avatarBg}`}
              >
                {userInitial}
              </button>

              {/* DROPDOWN MENU */}
              {menuOpen && (
                <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden border animate-in fade-in zoom-in duration-150 ${
                  darkMode ? "bg-[#1e293b] border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className={`px-4 py-3 mb-2 border-b flex flex-col ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                    <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Cuenta</span>
                    <span className="text-sm font-bold truncate">{userName}</span>
                    <span className="text-[11px] opacity-60 capitalize">{userRole}</span>
                  </div>
                  
                  <div className="px-2 space-y-1">
                    <button onClick={() => { setView("profile"); setMenuOpen(false); }} className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>
                      <FaUser className="text-blue-500" /> Mi Perfil
                    </button>
                    
                    <div className={`h-[1px] mx-2 ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}></div>
                    
                    <button onClick={handleLogout} className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm font-bold text-red-500 rounded-xl transition-colors ${darkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}>
                      <FiLogOut /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- FONDO PRINCIPAL AZUL NAVY DEEP --- */}
      <main className={`flex-grow w-full px-6 py-6 h-[calc(100vh-68px)] overflow-y-auto transition-colors duration-300 ${
        darkMode ? "bg-[#0f172a] text-slate-100" : "bg-slate-50 text-slate-800"
      }`}>
        {view === "dashboard" && <ReportList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
        {view === "stadistics" && <Dashboard darkMode={darkMode} />}
        {view === "tech" && <ReportTechList key={refreshKey} userId={Number(localStorage.getItem('userId')) || undefined} darkMode={darkMode} searchTerm={searchTerm} />}
        {isAdmin && view === "workers" && <WorkerList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
        {isAdmin && view === "users" && <UserList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
        {view === "profile" && <UserProfile darkMode={darkMode} />}
      </main>

      {/* BOTÓN FLOTANTE (+) */}
      {!isFormOpen && (
        <button
          onClick={handleOpenForm}
          className="fixed bottom-8 right-8 p-4 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-110 active:scale-95 z-30 flex items-center justify-center"
        >
          <FaPlus size={24} />
        </button>
      )}

      {/* MODAL AZUL NAVY */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? "#1e293b" : "#ffffff", 
            color: darkMode ? "#f1f5f9" : "#000000",
            borderRadius: '20px',
            backgroundImage: 'none'
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-bold uppercase text-xs tracking-widest opacity-60">Añadir Nuevo Registro</span>
          <IconButton onClick={() => setIsFormOpen(false)} sx={{ color: darkMode ? '#94a3b8' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: darkMode ? 'rgba(148,163,184,0.1)' : 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 'bold', color: darkMode ? '#94a3b8' : 'inherit' },
              '& .Mui-selected': { color: '#3b82f6 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: 3 }
            }}
          >
            <Tab label="Reporte" />
            {isAdmin && <Tab label="Trabajador" />}
            {isAdmin && <Tab label="Usuario" />}
          </Tabs>
        </Box>
        
        <DialogContent dividers sx={{ borderColor: darkMode ? '#334155' : '#f1f5f9', p: 3 }}>
          {activeTab === 0 && <ReportForm onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
          {isAdmin && activeTab === 1 && <WorkerForm initialData={{}} readOnlyDefault={false} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
          {isAdmin && activeTab === 2 && <UserForm initialData={{}} readOnlyDefault={false} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Mainpage;