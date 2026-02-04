import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../layouts/aside"; 
import UserProfile from "../profile/profile"; 
import { FaSearch, FaPlus, FaArrowLeft, FaUser, FaTimes } from "react-icons/fa";
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

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 0, pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Mainpage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    return t === null ? true : t === 'dark';
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [view, setView] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ area: null, fecha: null });
  const [activeTab, setActiveTab] = useState(0);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const userName = localStorage.getItem('userName') || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = localStorage.getItem('role')?.toLowerCase() || "";
  const isAdmin = userRole === "administrador";

  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const nextMode = !prev;
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
      return nextMode;
    });
  };

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
      case 'stadistics': return "Estadísticas";
      case 'workers': return "Gestión de Trabajadores";
      case 'users': return "Gestión de Usuarios";
      case 'profile': return "Perfil";
      default: return "Panel";
    }
  };

  const showSearch = ["dashboard", "tech", "workers", "users"].includes(view);
  const solidBtnClass = darkMode 
    ? "bg-slate-800 text-white hover:bg-blue-600 border border-slate-700" 
    : "bg-[#1a1a1a] text-white hover:bg-blue-700 shadow-lg";

  useEffect(() => {
    setSearchTerm("");
    setIsMobileSearchOpen(false);
    if (!isAdmin && (view === "workers" || view === "users")) setView("dashboard");
  }, [view, isAdmin]);

  return (
    <SidebarLayout 
      isOpen={sidebarOpen} setIsOpen={setSidebarOpen} darkMode={darkMode}
      onNavigate={setView} userRole={userRole} activeFilters={filters}
      onApplyFilter={(p) => { setFilters(prev => ({ ...prev, ...p })); setRefreshKey(k => k + 1); }}
    >
      <header className={`${darkMode ? "bg-[#1e293b] text-slate-100 border-slate-700" : "bg-white text-slate-800 border-slate-200"} h-16 w-full border-b sticky top-0 z-40 transition-colors shadow-sm`}>
        <div className="h-full w-full px-2 md:px-6 flex items-center justify-between gap-2">
          
          {/* LADO IZQUIERDO: Menú y Título */}
          {!isMobileSearchOpen && (
            <div className="flex items-center gap-1.5 md:gap-4 flex-1 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className={`p-1.5 md:p-2.5 rounded-xl transition-all shrink-0 ${solidBtnClass}`}>
                <FiMenu size={18} className="md:size-5" />
              </button>

              <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
                {view !== "dashboard" && (
                  <button onClick={() => setView("dashboard")} className={`p-1.5 md:p-2 rounded-xl transition-all shrink-0 ${solidBtnClass}`}>
                    <FaArrowLeft size={12} />
                  </button>
                )}
                
                {/* TÍTULO RESPONSIVO: 
                    text-[10px] en móvil muy pequeño, 
                    truncate evita que rompa el layout si es muy largo.
                */}
                <h1 className="text-[10px] sm:text-lg md:text-xl font-black uppercase tracking-tighter leading-tight whitespace-nowrap overflow-hidden truncate flex-1">
                  {getHeaderTitle()}
                </h1>
              </div>
            </div>
          )}

          {/* CENTRO: BUSCADOR (Se expande si se toca la lupa en móvil) */}
          {showSearch && (
            <div className={`${isMobileSearchOpen ? "flex-1 block" : "hidden lg:block"} relative`}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  autoFocus={isMobileSearchOpen}
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-10 py-2 border rounded-xl text-sm font-bold w-full transition-all ${
                    darkMode ? "bg-[#334155] text-white border-slate-600 focus:border-blue-500" : "bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-400"
                  } ${isMobileSearchOpen ? "h-11" : "lg:w-48 xl:w-96"}`}
                />
                <FaSearch className="absolute left-3 text-slate-400" />
                {isMobileSearchOpen && (
                  <button onClick={() => {setIsMobileSearchOpen(false); setSearchTerm("");}} className="absolute right-3 p-1 text-slate-400 hover:text-red-500">
                    <FaTimes size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* DERECHA: ICONOS */}
          <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
            {showSearch && !isMobileSearchOpen && (
              <button onClick={() => setIsMobileSearchOpen(true)} className={`lg:hidden p-2 rounded-xl ${solidBtnClass}`}>
                <FaSearch size={16} />
              </button>
            )}

            {!isMobileSearchOpen && (
              <>
                <button onClick={toggleTheme} className="p-1.5 md:p-2 rounded-full transition-transform active:scale-90 shrink-0">
                  {darkMode ? <FiSun className="text-yellow-400" size={18} /> : <FiMoon className="text-blue-700" size={18} />}
                </button>

                <div className="relative shrink-0" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-black text-xs md:text-base shadow-xl active:scale-90 ${darkMode ? 'bg-blue-600' : 'bg-[#1a1a1a]'}`}>
                    {userInitial}
                  </button>
                  {menuOpen && (
                    <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl z-50 py-2 border ${darkMode ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
                       <div className={`px-4 py-3 mb-2 border-b flex flex-col ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                        <p className="text-[10px] font-black uppercase opacity-40">Cuenta</p>
                        <p className="text-sm font-black truncate">{userName}</p>
                        <p className="text-[10px] font-bold opacity-60 capitalize">{userRole}</p>
                      </div>
                      <button onClick={() => {setView("profile"); setMenuOpen(false);}} className="w-full text-left px-4 py-3 hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors font-bold uppercase text-xs tracking-tighter"><FaUser size={14}/> Mi Perfil</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors font-black uppercase text-xs tracking-tighter"><FiLogOut size={16}/> Salir</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-grow w-full h-[calc(100vh-64px)] overflow-y-auto ${darkMode ? "bg-[#0f172a]" : "bg-slate-100"}`}>
        <div className="w-full px-2 md:px-8 py-6">
          {view === "dashboard" && <ReportList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} filter={filters} />}
          {view === "stadistics" && <Dashboard darkMode={darkMode} />}
          {view === "tech" && <ReportTechList key={refreshKey} userId={Number(localStorage.getItem('userId')) || undefined} darkMode={darkMode} searchTerm={searchTerm} />}
          {isAdmin && view === "workers" && <WorkerList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
          {isAdmin && view === "users" && <UserList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />}
          {view === "profile" && <UserProfile darkMode={darkMode} />}
        </div>
      </main>

      {!isFormOpen && (
        <button onClick={handleOpenForm} className={`fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl text-white transition-all transform hover:scale-110 active:scale-95 z-30 flex items-center justify-center ${darkMode ? "bg-blue-600" : "bg-[#1a1a1a]"}`}>
          <FaPlus size={24} />
        </button>
      )}

      {/* MODAL (Diálogo de registro) */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} fullWidth maxWidth="sm" PaperProps={{ style: { backgroundColor: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#f1f5f9" : "#000000", borderRadius: '24px' } }}>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-black text-xs uppercase tracking-widest opacity-60">Nuevo Registro</span>
          <IconButton onClick={() => setIsFormOpen(false)} sx={{ color: darkMode ? '#94a3b8' : 'inherit' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ '& .MuiTab-root': { fontWeight: '900', fontSize: '0.7rem' }, '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: 3 } }}>
            <Tab label="Reporte" />
            {isAdmin && <Tab label="Trabajador" />}
            {isAdmin && <Tab label="Usuario" />}
          </Tabs>
        </Box>
        <DialogContent dividers sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          <CustomTabPanel value={activeTab} index={0}><ReportForm onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} /></CustomTabPanel>
          {isAdmin && <CustomTabPanel value={activeTab} index={1}><WorkerForm initialData={{}} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} /></CustomTabPanel>}
          {isAdmin && <CustomTabPanel value={activeTab} index={2}><UserForm initialData={{}} onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} /></CustomTabPanel>}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Mainpage;