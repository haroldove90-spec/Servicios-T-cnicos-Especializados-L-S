import React from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import DashboardScreen from './components/DashboardScreen';
import { ServiceJob, Technician, MaterialItem, UserRole } from './types';
import { INITIAL_JOBS, TECHNICIANS, INITIAL_MATERIALS } from './data';

export default function App() {
  // Global Shared States for Technical Services Company
  const [userName, setUserName] = React.useState('Sophia Martinez');
  const [userLocation, setUserLocation] = React.useState('Ciudad de México');
  const [currentRole, setCurrentRole] = React.useState<UserRole>('client');
  const [isRoleEntered, setIsRoleEntered] = React.useState<boolean>(false);
  
  // Master database state
  const [jobs, setJobs] = React.useState<ServiceJob[]>(INITIAL_JOBS);
  const [technicians, setTechnicians] = React.useState<Technician[]>(TECHNICIANS);
  const [materials, setMaterials] = React.useState<MaterialItem[]>(INITIAL_MATERIALS);

  // Simulated system log stream for the administrator view
  const [systemLogs, setSystemLogs] = React.useState<string[]>([
    'Sistema L&S: Inicializado panel de servicios generales.',
    'Base de Datos: 4 órdenes de servicio cargadas de forma local.',
    'Red: Enlace seguro con técnicos en campo establecido.',
    'Inventario: Matriz de refacciones y materiales sincronizada.'
  ]);

  const addSystemLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  const handleLocationChange = (newLoc: string) => {
    setUserLocation(newLoc);
    addSystemLog(`Admin: Sede de visualización cambiada a ${newLoc}`);
  };

  const handleUserChange = (newName: string) => {
    setUserName(newName);
    addSystemLog(`Perfil: Nombre de usuario cambiado a "${newName}"`);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setIsRoleEntered(true);
    if (role === 'admin') {
      setUserName('Dueño / Coordinador L&S');
      addSystemLog(`Sistema: Cambiado al rol de ADMINISTRADOR (Control de agenda, personal y tarifas)`);
    } else if (role === 'technician') {
      setUserName('Técnico en Campo L&S');
      addSystemLog(`Sistema: Cambiado al rol de TÉCNICO EN CAMPO (Hoja de ruta, vales de materiales y cobros)`);
    } else if (role === 'client') {
      setUserName('Sophia Martinez');
      addSystemLog(`Sistema: Cambiado al rol de CLIENTE (Solicitud de servicios generales, garantías y reportes)`);
    }
  };

  const handleResetSimulator = () => {
    setUserName('Sophia Martinez');
    setUserLocation('Ciudad de México');
    setJobs(INITIAL_JOBS);
    setTechnicians(TECHNICIANS);
    setMaterials(INITIAL_MATERIALS);
    setCurrentRole('client');
    setIsRoleEntered(false);
    setSystemLogs([
      'Sistema L&S: Sincronizado y reiniciado a valores por defecto.'
    ]);
  };

  return (
    <div className="min-h-screen bg-[#010101] text-white flex flex-col antialiased font-sans" id="ls-app-root">
      
      {/* Dynamic Header Bar */}
      <div className="bg-[#0A0A0A] text-white px-4 py-3 border-b border-[#1F1F1F] flex items-center justify-between gap-3 z-50">
        <div className="flex items-center space-x-3">
          {/* Brand Logo */}
          <img 
            src="https://appdesign.appdesignproyectos.com/lyslogo.jpg" 
            alt="L&S Servicios Técnicos" 
            className="h-10 w-auto object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="text-zinc-600 font-bold">|</span>
          <span className="text-xs font-black tracking-wider text-white uppercase">
            CONSOLA ADMINISTRATIVA
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          {isRoleEntered && (
            <button
              onClick={() => setIsRoleEntered(false)}
              className="bg-[#121212] hover:bg-[#1C1C1C] border border-[#1F1F1F] hover:border-[#CCA049]/40 px-3 py-1.5 rounded-lg text-[#CCA049] font-extrabold text-[10.5px] transition-all cursor-pointer flex items-center space-x-1.5 shadow-md"
              title="Salir del rol actual y regresar al portal de selección"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cambiar de Rol</span>
            </button>
          )}
          <button
            onClick={handleResetSimulator}
            className="bg-[#121212] hover:bg-[#1A1A1A] active:bg-black border border-[#1F1F1F] hover:border-[#CCA049]/40 p-2 rounded-lg text-zinc-300 font-bold transition-all cursor-pointer flex items-center justify-center"
            title="Reiniciar base de datos a valores semilla"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full" id="root-layout-container">
        <DashboardScreen
          userName={userName}
          userLocation={userLocation}
          onNavigateToCalendar={() => {}}
          onMenuItemClick={() => {}}
          onLocationChange={handleLocationChange}
          onUserChange={handleUserChange}
          currentRole={currentRole}
          onChangeRole={handleRoleChange}
          isRoleEntered={isRoleEntered}
          onExitRole={() => setIsRoleEntered(false)}
          
          // Inject shared states and log helper
          jobs={jobs}
          setJobs={setJobs}
          technicians={technicians}
          setTechnicians={setTechnicians}
          materials={materials}
          setMaterials={setMaterials}
          systemLogs={systemLogs}
          addSystemLog={addSystemLog}
        />
      </div>

    </div>
  );
}
