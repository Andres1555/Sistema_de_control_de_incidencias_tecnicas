import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../layouts/aside"; 
import UserProfile from "../profile/profile"; 
import { FaSearch, FaPlus, FaArrowLeft, FaUser } from "react-icons/fa";
import { FiSun, FiMoon, FiMenu, FiLogOut } from "react-icons/fi";
import { Dialog, DialogContent, DialogTitle, IconButton, Tabs, Tab, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Formularios y Listas
import ReportForm from "../form/report"; 
import WorkerForm from "../form/workersreport"; 
import UserForm from "../form/usersform";     
import ReportList from "../card/reportlist";
import ReportTechList from "../card/reportechlist";
import Dashboard from "../stadistics/dashboard";
import WorkerList from "../card/workerlist"; 
import UserList from "../card/userlist";

const Mainpage = () => {
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
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);

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
      case 'dashboard': return "Reportes";
      case 'tech': return "Técnicos";
      case 'workers': return "Trabajadores";
      case 'users': return "Usuarios";
      case 'profile': return "Perfil";
      default: return "Panel";
    }
  };

  const showSearch = ["dashboard", "tech", "workers", "users"].includes(view);

  // --- CONFIGURACIÓN DE COLORES SÓLIDOS (ESTILO BLOQUE) ---
  const solidBtnClass = darkMode 
    ? "bg-slate-800 text-white hover:bg-blue-600 border border-slate-700" 
    : "bg-[#1a1a1a] text-white hover:bg-blue-700 shadow-lg active:scale-95";

  const logoutBtnClass = darkMode
    ? "bg-red-900/40 text-red-400 border border-red-500/50 hover:bg-red-600 hover:text-white"
    : "bg-red-600 text-white hover:bg-red-700 shadow-lg active:scale-95";

  return (
    <SidebarLayout 
      isOpen={sidebarOpen} 
      setIsOpen={setSidebarOpen} 
      darkMode={darkMode}
      onNavigate={setView}
      userRole={userRole}
    >
      <header className={`${darkMode ? "bg-[#1e293b] text-slate-100 border-slate-700" : "bg-white text-slate-800 border-slate-200"} shadow-sm w-full border-b sticky top-0 z-40 transition-colors`}>
        <div className="w-full px-3 md:px-6 py-2.5 flex items-center justify-between gap-2">
          
          {/* LADO IZQUIERDO: Menú y Atrás con bloques sólidos */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${solidBtnClass}`}
            >
              <FiMenu size={20} className="md:w-6 md:h-6" />
            </button>

            {!isSearchMobileOpen && (
              <div className="flex items-center gap-2 min-w-0">
                {view !== "dashboard" && (
                  <button 
                    onClick={() => setView("dashboard")} 
                    className={`p-2 rounded-xl transition-all flex-shrink-0 ${solidBtnClass}`}
                  >
                    <FaArrowLeft size={14} />
                  </button>
                )}
                <h1 className="text-base md:text-xl font-black truncate leading-tight uppercase tracking-tighter ml-1">
                  {getHeaderTitle()}
                </h1>
              </div>
            )}
          </div>

          {/* LADO DERECHO: Acciones */}
          <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
            {showSearch && (
              <>
                <button onClick={() => setIsSearchMobileOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-slate-500/10 flex-shrink-0">
                  <FaSearch size={18} className="text-slate-500" />
                </button>
                
                <div className="relative hidden lg:block">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-xl text-sm w-48 xl:w-80 transition-all font-black ${
                      darkMode ? "bg-[#334155] text-white border-slate-600" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-full flex-shrink-0 transition-transform active:scale-90">
              {darkMode ? <FiSun className="text-yellow-400" size={18} /> : <FiMoon className="text-blue-700" size={18} />}
            </button>

            {/* Avatar Perfil Sólido */}
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white font-black text-xs md:text-base shadow-xl transition-all active:scale-90 ${darkMode ? 'bg-blue-600' : 'bg-[#1a1a1a]'}`}
              >
                {userInitial}
              </button>

              {menuOpen && (
                <div className={`absolute right-0 mt-3 w-56 md:w-64 rounded-2xl shadow-2xl z-50 py-2 border animate-in zoom-in-95 duration-100 ${
                  darkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200"
                }`}>
                   <div className={`px-4 py-3 mb-2 border-b flex flex-col ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                    <span className="text-[10px] font-black uppercase opacity-40">Cuenta</span>
                    <span className={`text-sm font-black truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{userName}</span>
                    <span className="text-[10px] font-bold opacity-60 capitalize">{userRole}</span>
                  </div>
                  <div className="px-2 space-y-1">
                    <button 
                      onClick={() => { setView("profile"); setMenuOpen(false); }} 
                      className={`flex items-center gap-3 w-full px-4 py-3 text-xs md:text-sm font-black rounded-xl transition-all uppercase tracking-tighter ${solidBtnClass}`}
                    >
                      <FaUser size={12} /> Mi Perfil
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className={`flex items-center gap-3 w-full px-4 py-3 text-xs md:text-sm font-black rounded-xl transition-all uppercase tracking-tighter ${logoutBtnClass}`}
                    >
                      <FiLogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buscador Expandible Mobile */}
        {showSearch && isSearchMobileOpen && (
            <div className="absolute inset-0 px-3 bg-inherit flex items-center z-50 animate-in slide-in-from-top-2">
              <div className="relative w-full flex items-center gap-2">
                <FaSearch className="absolute left-3 text-slate-400" size={14} />
                <input
                 autoFocus
                 type="text"
                 placeholder="Buscar..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-black ${
                   darkMode ? "bg-[#334155] text-white border-slate-600" : "bg-slate-50 border-slate-300 text-slate-900"
                 }`}
               />
               <button 
                 onClick={() => {setIsSearchMobileOpen(false); setSearchTerm("")}} 
                 className={`p-2 rounded-xl ${solidBtnClass}`}
               >
                 <CloseIcon fontSize="small" />
               </button>
              </div>
            </div>
        )}
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-grow w-full px-3 md:px-6 py-4 md:py-6 h-[calc(100vh-64px)] overflow-y-auto ${
        darkMode ? "bg-[#0f172a]" : "bg-slate-100"
      }`}>
        <div className="max-w-7xl mx-auto">
          {view === "dashboard" && <ReportList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
          {view === "stadistics" && <Dashboard darkMode={darkMode} />}
          {view === "tech" && <ReportTechList key={refreshKey} userId={Number(localStorage.getItem('userId')) || undefined} darkMode={darkMode} searchTerm={searchTerm} />}
          {isAdmin && view === "workers" && <WorkerList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
          {isAdmin && view === "users" && <UserList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
          {view === "profile" && <UserProfile darkMode={darkMode} />}
        </div>
      </main>

      {/* BOTÓN FLOTANTE SÓLIDO */}
      {!isFormOpen && (
        <button
          onClick={handleOpenForm}
          className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl text-white transition-all transform hover:scale-110 active:scale-95 z-30 flex items-center justify-center ${
            darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"
          }`}
        >
          <FaPlus size={20} className="md:size-6" />
        </button>
      )}

      {/* DIALOG / MODAL (Actualizado con fuentes fuertes) */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={window.innerWidth < 640}
        PaperProps={{
          style: {
            backgroundColor: darkMode ? "#1e293b" : "#ffffff", 
            color: darkMode ? "#f1f5f9" : "#000000",
            borderRadius: window.innerWidth < 640 ? '0' : '24px',
            backgroundImage: 'none'
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-black text-[10px] md:text-xs uppercase tracking-widest opacity-60">Nuevo Registro</span>
          <IconButton onClick={() => setIsFormOpen(false)} size="small" sx={{ color: darkMode ? '#94a3b8' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: darkMode ? 'rgba(148,163,184,0.1)' : 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' },
              '& .Mui-selected': { color: '#3b82f6 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: '3px' }
            }}
          >
            <Tab label="Reporte" />
            {isAdmin && <Tab label="Trabajador" />}
            {isAdmin && <Tab label="Usuario" />}
          </Tabs>
        </Box>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === 0 && <ReportForm onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
          {isAdmin && activeTab === 1 && <WorkerForm initialData={{}} readOnlyDefault={false} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
          {isAdmin && activeTab === 2 && <UserForm initialData={{}} readOnlyDefault={false} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Mainpage;