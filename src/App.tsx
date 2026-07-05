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
      
      {/* Sleek, thin Dev/Simulation utility bar - no brand logos or large headers here to prevent double-header conflicts */}
      <div className="bg-[#050505] text-zinc-400 text-[10px] px-4 py-1.5 border-b border-[#141414] flex items-center justify-between gap-3 z-50 select-none">
        <div className="flex items-center space-x-2.5">
          <span className="font-black tracking-widest text-[#CCA049]/95 text-[9px] uppercase">L&S OPERACIONES</span>
          <span className="text-zinc-800">|</span>
          <span className="text-zinc-500 font-medium">Entorno de Simulación</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-black rounded-md p-0.5 border border-[#1A1A1A]">
            <button
              onClick={() => handleRoleChange('client')}
              className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                isRoleEntered && currentRole === 'client' 
                  ? 'bg-[#CCA049] text-black font-black' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => handleRoleChange('technician')}
              className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                isRoleEntered && currentRole === 'technician' 
                  ? 'bg-[#CCA049] text-black font-black' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Técnico
            </button>
            <button
              onClick={() => handleRoleChange('admin')}
              className={`px-2.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                isRoleEntered && currentRole === 'admin' 
                  ? 'bg-[#CCA049] text-black font-black' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
          
          <span className="text-zinc-800">|</span>

          <button
            onClick={handleResetSimulator}
            className="text-zinc-500 hover:text-[#CCA049] transition-all cursor-pointer flex items-center space-x-1"
            title="Reiniciar base de datos a valores semilla"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="text-[9px] font-bold">Reiniciar Base</span>
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
