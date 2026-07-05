import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  AlertOctagon, 
  Send, 
  CheckCircle2, 
  Star, 
  FileText, 
  Camera, 
  ArrowLeft,
  Search,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { ServiceJob, Technician, MaterialItem } from '../types';
import { BASE_PRICES } from '../data';

interface ClientWorkspaceProps {
  onExitRole: () => void;
  jobs: ServiceJob[];
  setJobs: React.Dispatch<React.SetStateAction<ServiceJob[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  materials: MaterialItem[];
  setMaterials: React.Dispatch<React.SetStateAction<MaterialItem[]>>;
  addSystemLog: (msg: string) => void;
}

export default function ClientWorkspace({
  onExitRole,
  jobs,
  setJobs,
  technicians,
  setTechnicians,
  materials,
  setMaterials,
  addSystemLog
}: ClientWorkspaceProps) {
  // Current logged in client (simulated Sophia Martinez)
  const clientName = "Sophia Martinez";
  const clientPhone = "555-123-4567";

  // Navigation tab inside Client workspace: 'solicitar' | 'seguimiento' | 'garantias'
  const [activeTab, setActiveTab] = useState<'solicitar' | 'seguimiento' | 'garantias'>('solicitar');

  // New service request form states
  const [selectedCategory, setSelectedCategory] = useState<ServiceJob['category'] | ''>('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('Calle Paseo de la Reforma 250, CDMX');
  const [customPriority, setCustomPriority] = useState<ServiceJob['priority']>('Media');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Panic button emergency flow states
  const [panicLoading, setPanicLoading] = useState(false);
  const [panicActive, setPanicActive] = useState(false);

  // Active client jobs state
  const clientActiveJobs = jobs.filter(j => j.clientName === clientName && j.status !== 'Finalizado');
  const clientCompletedJobs = jobs.filter(j => j.clientName === clientName && j.status === 'Finalizado');

  // Trigger simulated Geolocation Panic Button
  const handleTriggerPanicButton = () => {
    setPanicLoading(true);
    addSystemLog(`Cliente: Presionó botón de pánico de emergencia`);
    
    setTimeout(() => {
      // Simulate grabbing coordinates
      const mockGps = { lat: 19.428, lng: -99.166 };
      
      const newEmergencyJob: ServiceJob = {
        id: `job-emerg-${Date.now()}`,
        clientName: clientName,
        clientPhone: clientPhone,
        clientLocation: 'GPS Coords: ' + mockGps.lat.toFixed(4) + ', ' + mockGps.lng.toFixed(4) + ' (Av. Chapultepec, CDMX)',
        coordinates: mockGps,
        category: 'Plomería', // default emergency to plomería / gas
        description: '🚨 ALERTA DE PÁNICO: Se reporta fuga crítica de agua o gas que requiere atención inmediata. Ubicación enviada mediante geolocalización.',
        priority: 'Urgente',
        status: 'Pendiente',
        basePrice: 350,
        materialsPrice: 0,
        surcharges: 200, // Urgent flat surcharge
        totalPrice: 550,
        commissionPct: 30,
        commissionAmount: 165,
        materialsUsed: [],
        warrantyMonths: 3
      };

      setJobs(prev => [newEmergencyJob, ...prev]);
      addSystemLog(`Sistema: Creada órden de emergencia #${newEmergencyJob.id} por botón de pánico`);
      setPanicLoading(false);
      setPanicActive(true);
      setActiveTab('seguimiento');
      alert('¡🚨 ALERTA EMITIDA! Se ha enviado su ubicación GPS y un técnico de guardia de L&S ha recibido la notificación de prioridad urgente.');
    }, 1200);
  };

  // Regular service submit handler
  const handleRequestServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !serviceDescription.trim()) return;

    setIsSubmitting(true);
    
    // Find base price
    const baseInfo = BASE_PRICES.find(b => b.category === selectedCategory);
    const base = baseInfo ? baseInfo.price : 350;
    const isUrgent = customPriority === 'Urgente';
    const surcharge = isUrgent ? 200 : 0;

    const newJob: ServiceJob = {
      id: `job-${Date.now()}`,
      clientName: clientName,
      clientPhone: clientPhone,
      clientLocation: serviceAddress,
      category: selectedCategory,
      description: serviceDescription,
      priority: customPriority,
      status: 'Pendiente',
      basePrice: base,
      materialsPrice: 0,
      surcharges: surcharge,
      surchargeReason: isUrgent ? 'Servicio Urgente solicitado express' : undefined,
      totalPrice: base + surcharge,
      commissionPct: 30,
      commissionAmount: (base + surcharge) * 0.3,
      materialsUsed: [],
      warrantyMonths: selectedCategory === 'Electricidad' || selectedCategory === 'Aire Acondicionado' ? 6 : 3
    };

    setTimeout(() => {
      setJobs(prev => [newJob, ...prev]);
      addSystemLog(`Cliente: Creó solicitud de servicio ${newJob.id} para [${selectedCategory}]`);
      setIsSubmitting(false);
      setSelectedCategory('');
      setServiceDescription('');
      setActiveTab('seguimiento');
      alert('Solicitud enviada con éxito. Un coordinador le asignará un técnico de inmediato.');
    }, 800);
  };

  return (
    <div className="w-full min-h-screen bg-[#010101] text-white font-sans pb-24 lg:pb-8 lg:pr-28 animate-fade-in relative px-4 py-6" id="client-workspace">
      
      {/* 1. BOTTOM NAVIGATION BAR (Mobile & Tablet: lg:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0A] border-t border-[#1F1F1F] flex justify-around items-center z-40 lg:hidden px-2 shadow-xl">
        <button
          onClick={() => setActiveTab('solicitar')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'solicitar' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Wrench className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Solicitar</span>
        </button>

        <button
          onClick={() => setActiveTab('seguimiento')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all relative ${
            activeTab === 'seguimiento' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          {clientActiveJobs.length > 0 && (
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-[#CCA049] animate-pulse"></span>
          )}
          <Clock className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Seguimiento</span>
        </button>

        <button
          onClick={() => setActiveTab('garantias')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'garantias' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <ShieldCheck className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Garantías</span>
        </button>

        <button
          onClick={onExitRole}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold text-rose-500 hover:text-rose-400 cursor-pointer transition-all"
        >
          <ArrowLeft className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Salir</span>
        </button>
      </div>

      {/* 2. RIGHT-SIDE NAVIGATION BAR (Desktop: hidden lg:flex) */}
      <div className="fixed right-0 top-0 bottom-0 w-24 bg-[#0A0A0A] border-l border-[#1F1F1F] flex flex-col items-center justify-between py-6 z-40 hidden lg:flex shadow-2xl">
        <div className="flex flex-col items-center space-y-2">
          <img 
            src="https://appdesign.appdesignproyectos.com/lysicono.png" 
            alt="Icon" 
            className="w-14 h-14 object-contain mb-3 shrink-0"
          />
          <div className="text-center">
            <span className="text-[8px] font-black text-[#CCA049] uppercase tracking-wider block">Cliente</span>
            <span className="text-[7px] text-zinc-500 font-bold block">L&S</span>
          </div>
        </div>

        {/* Center navigation items */}
        <div className="flex flex-col items-center space-y-6 w-full px-2">
          <button
            onClick={() => setActiveTab('solicitar')}
            title="Solicitar Servicio"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'solicitar' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <Wrench className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Solicitar</span>
          </button>

          <button
            onClick={() => setActiveTab('seguimiento')}
            title="Seguimiento de Orden"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all relative ${
              activeTab === 'seguimiento' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            {clientActiveJobs.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-black animate-ping"></span>
            )}
            <Clock className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Estatus</span>
          </button>

          <button
            onClick={() => setActiveTab('garantias')}
            title="Historial & Garantías"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'garantias' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <ShieldCheck className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Garantías</span>
          </button>
        </div>

        {/* Exit portal button at bottom */}
        <button
          onClick={onExitRole}
          title="Regresar al Portal Principal"
          className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-[8px] font-bold mt-1">Salir</span>
        </button>
      </div>

      {/* Top Header Row with L&S Brand Logo */}
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 mb-6 max-w-3xl mx-auto w-full" id="client-workspace-brand-header">
        <div className="flex items-center space-x-3">
          <img 
            src="https://appdesign.appdesignproyectos.com/lyslogo.jpg" 
            alt="L&S Logo" 
            className="h-11 w-auto object-contain shrink-0"
          />
          <div className="text-left">
            <span className="text-[8px] font-black text-[#CCA049] uppercase tracking-widest leading-none">Portal Cliente</span>
            <h2 className="text-sm font-black text-white mt-0.5">{clientName}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-1 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-[#CCA049] animate-pulse"></div>
          <span className="text-[9px] font-bold text-zinc-400 font-mono">EN LÍNEA</span>
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT AREA WITH CENTERED WIDTH CONTAINER */}
      <div className="max-w-3xl mx-auto w-full flex-1" id="client-tab-content">
        
        {/* TABS 1: Solicitar Servicio */}
        {activeTab === 'solicitar' && (
          <div className="space-y-5 text-left animate-fade-in" id="tab-solicitar">
            
            {/* PANIC BUTTON WIDGET */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center space-y-3 relative overflow-hidden" id="panic-button-box">
              <div className="absolute top-2 right-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-black px-2 py-0.5 rounded-full">
                EMERGENCIA 24/7
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">¿Tiene una fuga o avería crítica?</h3>
                <p className="text-[10px] text-slate-400">Presione el botón para enviar geolocalización y despachar urgencia.</p>
              </div>

              {/* Real pulsing red button */}
              <button
                type="button"
                onClick={handleTriggerPanicButton}
                disabled={panicLoading}
                className={`w-28 h-28 rounded-full border-4 border-slate-900 bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-[0.98] transition-transform flex flex-col items-center justify-center cursor-pointer relative z-10 ${
                  panicLoading ? 'opacity-80' : 'animate-pulse'
                }`}
                id="panic-pulse-btn"
              >
                {panicLoading ? (
                  <Clock className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <AlertOctagon className="h-9 w-9 text-white mb-0.5" />
                )}
                <span className="text-[9.5px] font-black tracking-widest text-white block uppercase">PÁNICO</span>
              </button>
              
              <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none font-mono">Despacho express en menos de 30 mins</span>
            </div>

            {/* CATEGORY SELECTOR & REQUEST FORM */}
            <div className="space-y-3" id="catalog-section">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Selección de Categoría y Tarifas</p>
              
              <div className="grid grid-cols-2 gap-2" id="client-categories-grid">
                {BASE_PRICES.map((b) => (
                  <button
                    key={b.category}
                    onClick={() => {
                      setSelectedCategory(b.category as any);
                      addSystemLog(`Cliente: Seleccionó categoría [${b.category}] para su cotización`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedCategory === b.category 
                        ? 'bg-slate-950 border-[#CCA049] text-white shadow-md' 
                        : 'bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{b.icon}</span>
                      <span className="text-[11px] font-black">{b.category}</span>
                    </div>
                    <span className="text-[9px] font-extrabold font-mono text-[#CCA049]">${b.price}</span>
                  </button>
                ))}
              </div>

              {/* Show Request Form if a category is selected */}
              {selectedCategory && (
                <form 
                  onSubmit={handleRequestServiceSubmit} 
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-4 mt-3 space-y-3.5 animate-scale-up"
                  id="client-request-form"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] font-black uppercase text-[#CCA049]">Solicitud: {selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('')}
                      className="text-slate-500 hover:text-slate-300 text-[10px] font-bold"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-500 font-extrabold uppercase block">Describa la falla o trabajo</label>
                    <textarea
                      placeholder="ej. El lavabo tiene una fuga en el empaque o manguera izquierda..."
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      rows={3}
                      required
                      className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 p-2.5 outline-none focus:border-[#CCA049]"
                    />
                  </div>

                  {/* Address Input */}
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-500 font-extrabold uppercase block">Dirección de Atención</label>
                    <input
                      type="text"
                      placeholder="Su dirección completa..."
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      required
                      className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl border border-slate-800 p-2.5 outline-none focus:border-[#CCA049]"
                    />
                  </div>

                  {/* Priority selector */}
                  <div className="space-y-1">
                    <label className="text-[8px] text-slate-500 font-extrabold uppercase block">Prioridad Requerida</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['Baja', 'Media', 'Alta', 'Urgente'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCustomPriority(p)}
                          className={`py-1.5 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${
                            customPriority === p 
                              ? 'bg-[#CCA049] text-black border-[#CCA049] font-black shadow-inner' 
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {p === 'Urgente' ? '🚨 Urgente' : p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing brief */}
                  <div className="bg-slate-900 p-2.5 rounded-xl text-[9.5px] text-slate-400 leading-normal border border-slate-850">
                    💡 <strong>Cotización Base:</strong> Tarifas mínimas desde <strong className="text-slate-200">${BASE_PRICES.find(b => b.category === selectedCategory)?.price} MXN</strong>. Refacciones, materiales de ferretería e IVA se cotizan con vales firmados en sitio.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#CCA049] hover:bg-[#B88E3D] disabled:bg-slate-800 text-black font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow cursor-pointer hover:scale-[1.01]"
                    id="btn-submit-service-req"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? 'Enviando...' : 'ENVIAR SOLICITUD A TALLER'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* TABS 2: Seguimiento de Servicios Activos */}
        {activeTab === 'seguimiento' && (
          <div className="space-y-4 text-left animate-fade-in" id="tab-seguimiento">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#CCA049] flex items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>Estatus de Solicitudes Activas</span>
              </h3>
              <span className="text-[8px] bg-[#CCA049]/10 text-[#CCA049] font-extrabold px-1.5 py-0.5 rounded font-mono border border-[#CCA049]/20">LIVE</span>
            </div>

            {clientActiveJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-850 p-6">
                <CheckCircle2 className="h-8 w-8 text-[#CCA049] mx-auto mb-2" />
                <p className="text-xs font-extrabold text-slate-300">¡Al día! Sin reportes de fallas activos</p>
                <p className="text-[10px] text-slate-500 mt-1">Si tiene algún inconveniente de plomería, gas, herrería o climas, cree un ticket de servicio en la pestaña "Solicitar".</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientActiveJobs.map((job) => {
                  // Find technician details
                  const tech = technicians.find(t => t.id === job.technicianId);

                  // Setup stepper progress value
                  let stepIndex = 0; // 0: Pendiente, 1: Asignado, 2: En camino, 3: En servicio
                  if (job.status === 'Asignado') stepIndex = 1;
                  else if (job.status === 'En camino') stepIndex = 2;
                  else if (job.status === 'En servicio') stepIndex = 3;

                  return (
                    <div 
                      key={job.id} 
                      className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3.5 shadow-md"
                      id={`active-tracker-${job.id}`}
                    >
                      {/* Top Job header bar */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8.5px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">ORDEN #{job.id}</span>
                          <h4 className="text-xs font-black text-white mt-1.5">{job.category}</h4>
                        </div>
                        <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                          {job.status}
                        </span>
                      </div>

                      {/* Timeline Stepper */}
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850 space-y-2">
                        <p className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Sincronización de Estatus</p>
                        
                        <div className="flex items-center justify-between relative px-2 py-1">
                          {/* Progress connector line */}
                          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0" />
                          <div 
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-[2px] bg-[#CCA049] z-0 transition-all duration-300" 
                            style={{ width: `${(stepIndex / 3) * 91}%` }}
                          />

                          {[
                            { name: 'Solicitado', index: 0 },
                            { name: 'Asignado', index: 1 },
                            { name: 'En camino', index: 2 },
                            { name: 'Trabajando', index: 3 }
                          ].map((step) => {
                            const isCurrent = stepIndex === step.index;
                            const isPassed = stepIndex >= step.index;
                            
                            return (
                              <div key={step.name} className="flex flex-col items-center relative z-10">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border ${
                                  isPassed 
                                    ? 'bg-[#CCA049] border-[#CCA049] text-black font-black' 
                                    : 'bg-slate-950 border-slate-800 text-slate-600'
                                }`}>
                                  {isPassed ? <Check className="h-3 w-3 stroke-[3.5]" /> : <span className="text-[8px] font-bold">{step.index + 1}</span>}
                                </div>
                                <span className={`text-[7.5px] mt-1 font-bold ${isCurrent ? 'text-[#CCA049]' : 'text-slate-500'}`}>{step.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tech profile display if assigned */}
                      {tech ? (
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2.5">
                          <p className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Técnico Asignado a Domicilio</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <img src={tech.avatar} alt={tech.name} className="w-9 h-9 rounded-full object-cover border border-slate-800" />
                              <div className="text-left">
                                <h5 className="text-[11px] font-black text-white">{tech.name}</h5>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <span className="text-[9.5px] font-bold text-slate-400">{tech.specialty}</span>
                                  <span className="text-slate-600 font-bold">•</span>
                                  <span className="text-[9.5px] text-amber-500 font-black flex items-center"><Star className="h-2.5 w-2.5 fill-current mr-0.5" /> {tech.rating}</span>
                                </div>
                              </div>
                            </div>
                            <a href={`tel:${job.clientPhone}`} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex items-center space-x-2">
                          <Info className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                          <p className="text-[9px] text-slate-400 leading-normal">
                            <strong>Buscando técnico disponible...</strong> Su reporte está en la cola de asignación del Coordinador. Le asignaremos personal de inmediato.
                          </p>
                        </div>
                      )}

                      {/* Service notes / location details */}
                      <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/30 p-2.5 rounded-lg border border-slate-850">
                        <p><strong>📍 Destino:</strong> {job.clientLocation}</p>
                        <p className="mt-1"><strong>📝 Reporte:</strong> "{job.description}"</p>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TABS 3: Garantías de Servicios Históricos */}
        {activeTab === 'garantias' && (
          <div className="space-y-4 text-left animate-fade-in" id="tab-garantias">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>Buzón de Garantías y Historial</span>
              </h3>
              <span className="text-[8.5px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono uppercase">CERTIFICADAS</span>
            </div>

            {clientCompletedJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-850 p-6">
                <ShieldCheck className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-extrabold text-slate-400">Sin historial registrado en este simulador</p>
                <p className="text-[10px] text-slate-500 mt-1">Cuando finalice o cierre un servicio en el perfil del Técnico, la póliza de garantía digital y fotos se archivarán aquí automáticamente.</p>
              </div>
            ) : (
              <div className="space-y-4" id="warranty-scroller">
                {clientCompletedJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3.5 shadow-md relative overflow-hidden"
                    id={`warranty-card-${job.id}`}
                  >
                    {/* Visual Stamp Ribbon */}
                    <div className="absolute top-2 right-[-24px] bg-emerald-500 text-slate-950 font-black text-[7.5px] uppercase tracking-wider py-1 px-7 rotate-45 border border-emerald-650 text-center select-none shadow">
                      GARANTÍA OK
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8.5px] text-emerald-400 font-mono font-black uppercase">POLIZA ACTIVA #{job.id}</span>
                      <h4 className="text-xs font-black text-white">{job.category} — Trabajo Terminado</h4>
                    </div>

                    {/* Warranty validation badge */}
                    <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl space-y-1.5">
                      <p className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Vigencia del Certificado</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-300">
                        <span>Garantía de: <strong>{job.warrantyMonths} meses</strong></span>
                        <span>Vence: <strong className="text-emerald-400 font-mono">{job.expiryDate}</strong></span>
                      </div>
                      {job.warrantyNotes && (
                        <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-800/40">"Nota: {job.warrantyNotes}"</p>
                      )}
                    </div>

                    {/* Materials and price */}
                    <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/30 p-2.5 rounded-lg border border-slate-850">
                      <p><strong>👨🏼‍🔧 Realizado por:</strong> {job.technicianName}</p>
                      <p><strong>💳 Costo cerrado:</strong> ${job.totalPrice} MXN ({job.paymentMethod})</p>
                      {job.materialsUsed.length > 0 && (
                        <p className="truncate"><strong>🛠 Refacciones:</strong> {job.materialsUsed.map(m => `${m.name} (x${m.qty})`).join(', ')}</p>
                      )}
                    </div>

                    {/* Before/After photos comparison */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider block">Bitácora de Evidencia de Obra</span>
                      <div className="grid grid-cols-2 gap-2">
                        {job.photoBefore && (
                          <div className="rounded-xl overflow-hidden border border-slate-800/60 relative h-20">
                            <img src={job.photoBefore} alt="Antes" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 text-[7px] font-bold bg-slate-950/80 text-amber-500 border border-slate-800 px-1 rounded">ANTES</span>
                          </div>
                        )}
                        {job.photoAfter && (
                          <div className="rounded-xl overflow-hidden border border-slate-800/60 relative h-20">
                            <img src={job.photoAfter} alt="Después" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1 text-[7px] font-bold bg-slate-950/80 text-emerald-400 border border-slate-800 px-1 rounded">RESUELTO</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signature display */}
                    {job.signature && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[8px] text-slate-500 font-bold uppercase tracking-wider select-none">
                        <span>Firma del titular en archivo</span>
                        <img src={job.signature} alt="Firma" className="max-h-[25px] object-contain invert brightness-150 opacity-50" />
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
