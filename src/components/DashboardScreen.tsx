import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Wrench, 
  User, 
  Download,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { UserRole, ServiceJob, Technician, MaterialItem } from '../types';
import AdminWorkspace from './AdminWorkspace';
import TechnicianWorkspace from './TechnicianWorkspace';
import ClientWorkspace from './ClientWorkspace';

interface DashboardScreenProps {
  userName: string;
  userLocation: string;
  onNavigateToCalendar: () => void;
  onMenuItemClick: (itemId: string) => void;
  onLocationChange: (loc: string) => void;
  onUserChange: (name: string) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isRoleEntered: boolean;
  onExitRole: () => void;
  
  // Shared database states
  jobs: ServiceJob[];
  setJobs: React.Dispatch<React.SetStateAction<ServiceJob[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  materials: MaterialItem[];
  setMaterials: React.Dispatch<React.SetStateAction<MaterialItem[]>>;
  systemLogs: string[];
  addSystemLog: (msg: string) => void;
}

export default function DashboardScreen({
  userName,
  userLocation,
  currentRole,
  onChangeRole,
  isRoleEntered,
  onExitRole,
  
  // Shared States
  jobs,
  setJobs,
  technicians,
  setTechnicians,
  materials,
  setMaterials,
  systemLogs,
  addSystemLog
}: DashboardScreenProps) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showPwaTip, setShowPwaTip] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowPwaTip(true);
    }
  };

  // 1. GATEWAY SCREEN: If no role has been chosen yet, show selection portal
  if (!isRoleEntered) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-[#010101] font-sans min-h-[90vh] px-6 py-12 relative overflow-hidden" id="screen-portal">
        {/* Ambient Gold Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#CCA049]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#CCA049]/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          className="w-full max-w-lg bg-[#0A0A0A] rounded-[32px] p-8 border border-[#1F1F1F] shadow-2xl text-center space-y-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          id="portal-card"
        >
          {/* Brand Identity with Logo Image */}
          <div className="space-y-4 flex flex-col items-center">
            <img 
              src="https://appdesign.appdesignproyectos.com/lyslogo.jpg" 
              alt="L&S Servicios Técnicos" 
              className="w-auto h-24 object-contain"
              referrerPolicy="no-referrer"
              id="portal-logo"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Servicios Técnicos Generales <span className="text-[#CCA049]">L & S</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                Sistema Integral de Gestión de Campo y Solicitudes
              </p>
            </div>
          </div>

          {/* Access Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="portal-roles-grid">
            
            {/* 1. ADMINISTRATOR */}
            <button
              onClick={() => onChangeRole('admin')}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-200 cursor-pointer bg-[#121212] border-[#1F1F1F] hover:border-[#CCA049] hover:bg-[#1A1A1A]/70 group hover:scale-[1.02] shadow-sm"
              id="portal-role-admin"
            >
              <div className="mb-3.5 w-12 h-12 rounded-xl flex items-center justify-center bg-[#CCA049]/10 border border-[#CCA049]/20 text-[#CCA049] group-hover:bg-[#CCA049] group-hover:text-black transition-all">
                <Shield className="h-5.5 w-5.5" />
              </div>
              <span className="text-[12px] font-black tracking-tight text-white block leading-tight">Administrador</span>
              <span className="text-[8px] block mt-1.5 font-bold text-zinc-500 uppercase tracking-wider leading-none">
                Coordinador
              </span>
            </button>

            {/* 2. FIELD TECHNICIAN */}
            <button
              onClick={() => onChangeRole('technician')}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-200 cursor-pointer bg-[#121212] border-[#1F1F1F] hover:border-[#CCA049] hover:bg-[#1A1A1A]/70 group hover:scale-[1.02] shadow-sm"
              id="portal-role-technician"
            >
              <div className="mb-3.5 w-12 h-12 rounded-xl flex items-center justify-center bg-[#CCA049]/10 border border-[#CCA049]/20 text-[#CCA049] group-hover:bg-[#CCA049] group-hover:text-black transition-all">
                <Wrench className="h-5.5 w-5.5" />
              </div>
              <span className="text-[12px] font-black tracking-tight text-white block leading-tight">Técnico en Campo</span>
              <span className="text-[8px] block mt-1.5 font-bold text-zinc-500 uppercase tracking-wider leading-none">
                UI Mobile / PWA
              </span>
            </button>

            {/* 3. CUSTOMER CLIENT */}
            <button
              onClick={() => onChangeRole('client')}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all duration-200 cursor-pointer bg-[#121212] border-[#1F1F1F] hover:border-[#CCA049] hover:bg-[#1A1A1A]/70 group hover:scale-[1.02] shadow-sm"
              id="portal-role-client"
            >
              <div className="mb-3.5 w-12 h-12 rounded-xl flex items-center justify-center bg-[#CCA049]/10 border border-[#CCA049]/20 text-[#CCA049] group-hover:bg-[#CCA049] group-hover:text-black transition-all">
                <User className="h-5.5 w-5.5" />
              </div>
              <span className="text-[12px] font-black tracking-tight text-white block leading-tight">Cliente Portal</span>
              <span className="text-[8px] block mt-1.5 font-bold text-zinc-500 uppercase tracking-wider leading-none">
                Web / Solicitud
              </span>
            </button>

          </div>

          {/* Install Mobile PWA App Simulation */}
          <div className="pt-4 border-t border-[#1F1F1F]" id="portal-install-section">
            <button
              onClick={handleInstallClick}
              className="w-full bg-[#CCA049] hover:bg-[#B88E3D] active:bg-[#96712D] text-black font-black text-xs py-3.5 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md cursor-pointer hover:scale-[1.01]"
              id="btn-install-app"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Instalar Aplicación Móvil PWA</span>
            </button>

            {showPwaTip && (
              <motion.div 
                className="mt-3 p-3 bg-[#121212] border border-[#1F1F1F] rounded-xl text-left text-[10px] text-zinc-300 leading-relaxed animate-fade-in"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                💡 <strong>Para instalar en su dispositivo móvil:</strong><br />
                • <strong>iOS (Safari):</strong> Toque el icono de <em>Compartir</em> y elija <strong>"Agregar a inicio"</strong>.<br />
                • <strong>Android / Chrome:</strong> Toque los tres puntos superiores y seleccione <strong>"Instalar aplicación"</strong>.
              </motion.div>
            )}
          </div>
          
          <div className="text-[9px] text-zinc-600 font-extrabold uppercase tracking-widest border-t border-[#1F1F1F] pt-4" id="portal-footer">
            Consola Operativa L&S • Edición 2026
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. DISPATCHER: Render workspace based on current active role
  if (currentRole === 'admin') {
    return (
      <AdminWorkspace 
        onExitRole={onExitRole} 
        userName={userName} 
        userLocation={userLocation}
        jobs={jobs}
        setJobs={setJobs}
        technicians={technicians}
        setTechnicians={setTechnicians}
        materials={materials}
        setMaterials={setMaterials}
        systemLogs={systemLogs}
        addSystemLog={addSystemLog}
      />
    );
  }

  if (currentRole === 'technician') {
    return (
      <TechnicianWorkspace 
        onExitRole={onExitRole}
        jobs={jobs}
        setJobs={setJobs}
        technicians={technicians}
        setTechnicians={setTechnicians}
        materials={materials}
        setMaterials={setMaterials}
        addSystemLog={addSystemLog}
      />
    );
  }

  // Otherwise, default to 'client'
  return (
    <ClientWorkspace 
      onExitRole={onExitRole}
      jobs={jobs}
      setJobs={setJobs}
      technicians={technicians}
      setTechnicians={setTechnicians}
      materials={materials}
      setMaterials={setMaterials}
      addSystemLog={addSystemLog}
    />
  );
}
