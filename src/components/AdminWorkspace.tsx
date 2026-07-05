import React, { useState } from 'react';
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  UserCheck, 
  Settings, 
  Plus, 
  Trash2, 
  Clock, 
  Database, 
  RefreshCw, 
  ArrowLeft,
  Filter,
  Percent,
  Activity,
  ChevronRight,
  Info,
  MapPin
} from 'lucide-react';
import { ServiceJob, Technician, MaterialItem } from '../types';
import { BASE_PRICES, SURCHARGE_RULES } from '../data';

interface AdminWorkspaceProps {
  onExitRole: () => void;
  userName: string;
  userLocation: string;
  jobs: ServiceJob[];
  setJobs: React.Dispatch<React.SetStateAction<ServiceJob[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  materials: MaterialItem[];
  setMaterials: React.Dispatch<React.SetStateAction<MaterialItem[]>>;
  systemLogs: string[];
  addSystemLog: (msg: string) => void;
}

export default function AdminWorkspace({
  onExitRole,
  userName,
  userLocation,
  jobs,
  setJobs,
  technicians,
  setTechnicians,
  materials,
  setMaterials,
  systemLogs,
  addSystemLog
}: AdminWorkspaceProps) {
  // Tabs: 'dashboard' | 'agenda' | 'staff' | 'catalog'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'staff' | 'catalog'>('dashboard');

  // Interactive configurations (Editable by Admin)
  const [editableBasePrices, setEditableBasePrices] = useState(BASE_PRICES);
  const [surchargeRules, setSurchargeRules] = useState(SURCHARGE_RULES);

  // Filter query inside Admin workspace
  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  // Form states for creating new job manually
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCat, setNewCat] = useState<'Plomería' | 'Electricidad' | 'Herrería' | 'Gas' | 'Aire Acondicionado' | 'Otros'>('Plomería');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'Baja' | 'Media' | 'Alta' | 'Urgente'>('Media');

  // Financial period selection
  const [financialPeriod, setFinancialPeriod] = useState<'Diario' | 'Semanal' | 'Mensual'>('Mensual');

  // 1. CALCULATE REAL-TIME COUNTERS
  const pendingJobs = jobs.filter(j => j.status === 'Pendiente');
  const activeJobs = jobs.filter(j => j.status === 'En camino' || j.status === 'En servicio');
  const urgentJobs = jobs.filter(j => j.priority === 'Urgente' && j.status !== 'Finalizado');
  const completedToday = jobs.filter(j => j.status === 'Finalizado');

  // 2. FINANCIAL COMPUTATIONS
  const getFinancialData = () => {
    let totalRevenue = 0;
    let efectivoTotal = 0;
    let speiTotal = 0;
    let tarjetaTotal = 0;
    let totalCommissions = 0;

    // Filter jobs depending on period (simulated)
    const completedList = jobs.filter(j => j.status === 'Finalizado');

    completedList.forEach(j => {
      totalRevenue += j.totalPrice;
      totalCommissions += j.commissionAmount || (j.totalPrice * 0.3);

      if (j.paymentMethod === 'Efectivo') efectivoTotal += j.totalPrice;
      else if (j.paymentMethod === 'SPEI') speiTotal += j.totalPrice;
      else if (j.paymentMethod === 'Tarjeta') tarjetaTotal += j.totalPrice;
      else efectivoTotal += j.totalPrice; // fallback
    });

    // Default to mock seed padding if list is short to look like a full month
    if (financialPeriod === 'Mensual') {
      totalRevenue += 145000;
      efectivoTotal += 58000;
      speiTotal += 43500;
      tarjetaTotal += 43500;
      totalCommissions += 43500;
    } else if (financialPeriod === 'Semanal') {
      totalRevenue += 32000;
      efectivoTotal += 12800;
      speiTotal += 9600;
      tarjetaTotal += 9600;
      totalCommissions += 9600;
    }

    const netMargin = totalRevenue - totalCommissions;

    return {
      totalRevenue: Math.round(totalRevenue),
      efectivoTotal: Math.round(efectivoTotal),
      speiTotal: Math.round(speiTotal),
      tarjetaTotal: Math.round(tarjetaTotal),
      totalCommissions: Math.round(totalCommissions),
      netMargin: Math.round(netMargin)
    };
  };

  const finance = getFinancialData();

  // 3. EXPRESS ASSIGNATION HANDLER
  const handleAssignTechnician = (jobId: string, techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (!tech) return;

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        addSystemLog(`Admin: Asignó express servicio #${jobId} al técnico [${tech.name}]`);
        return {
          ...j,
          technicianId: techId,
          technicianName: tech.name,
          status: 'Asignado'
        };
      }
      return j;
    }));
  };

  // 4. MANUAL SERVICE DISPATCH
  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient || !newDesc) return;

    const baseInfo = editableBasePrices.find(b => b.category === newCat);
    const base = baseInfo ? baseInfo.price : 350;
    const isUrgent = newPriority === 'Urgente';
    const surcharge = isUrgent ? surchargeRules.urgentFlat : 0;

    const newJob: ServiceJob = {
      id: `job-man-${Date.now()}`,
      clientName: newClient,
      clientPhone: newPhone || '555-000-0000',
      clientLocation: newLocation || 'Colonia Roma, CDMX',
      category: newCat,
      description: newDesc,
      priority: newPriority,
      status: 'Pendiente',
      basePrice: base,
      materialsPrice: 0,
      surcharges: surcharge,
      surchargeReason: isUrgent ? 'Servicio Urgente solicitado express' : undefined,
      totalPrice: base + surcharge,
      commissionPct: 30,
      commissionAmount: (base + surcharge) * 0.3,
      materialsUsed: [],
      warrantyMonths: newCat === 'Electricidad' || newCat === 'Aire Acondicionado' ? 6 : 3
    };

    setJobs(prev => [newJob, ...prev]);
    addSystemLog(`Admin: Creó órden de servicio manual #${newJob.id} para ${newClient}`);
    setShowCreateModal(false);
    
    // Clear inputs
    setNewClient('');
    setNewPhone('');
    setNewLocation('');
    setNewDesc('');
  };

  // 5. UPDATE BASE PRICE
  const handleUpdatePrice = (category: string, newPrice: number) => {
    setEditableBasePrices(prev => prev.map(b => 
      b.category === category ? { ...b, price: newPrice } : b
    ));
    addSystemLog(`Admin: Modificó tarifa base de [${category}] a $${newPrice} MXN`);
  };

  // 6. TOGGLE TECHNICIAN STATUS
  const handleToggleTechStatus = (techId: string, nextStatus: Technician['status']) => {
    setTechnicians(prev => prev.map(t => 
      t.id === techId ? { ...t, status: nextStatus } : t
    ));
    addSystemLog(`Admin: Cambió estatus del técnico ${techId} a [${nextStatus}]`);
  };

  // 7. RESET COMMISSION CLOSING FOR TECHNICIAN (Corte de caja)
  const handleCashCloseForTech = (techId: string, amount: number) => {
    if (amount <= 0) {
      alert('Este técnico no tiene comisiones pendientes acumuladas.');
      return;
    }

    if (window.confirm(`¿Desea realizar el corte de caja y liquidar $${amount} MXN en comisiones para este técnico? Su balance de turno se restablecerá a cero.`)) {
      setTechnicians(prev => prev.map(t => 
        t.id === techId ? { ...t, commissionEarned: 0 } : t
      ));
      addSystemLog(`CORTE DE CAJA: Liquidado pago de comisiones de $${amount} MXN para técnico ${techId}`);
      alert(`Cierre exitoso. Se ha registrado el pago de $${amount} MXN y emitido el recibo de nómina.`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#010101] text-white font-sans pb-24 lg:pb-8 lg:pr-28 animate-fade-in relative px-4 py-6" id="admin-workspace">
      
      {/* 1. BOTTOM NAVIGATION BAR (Mobile & Tablet: lg:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0A] border-t border-[#1F1F1F] flex justify-around items-center z-40 lg:hidden px-2 shadow-xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'dashboard' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <TrendingUp className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all relative ${
            activeTab === 'agenda' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          {pendingJobs.length > 0 && (
            <span className="absolute top-1 right-5 bg-[#CCA049] text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {pendingJobs.length}
            </span>
          )}
          <Calendar className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Agenda</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'staff' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Users className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Técnicos</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'catalog' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Settings className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Config</span>
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
          <div className="relative p-1 rounded-xl bg-black border border-[#CCA049]/20 w-16 h-16 flex items-center justify-center overflow-hidden mb-4">
            <img 
              src="https://appdesign.appdesignproyectos.com/lysicono.png" 
              alt="Icon" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <span className="text-[8px] font-black text-[#CCA049] uppercase tracking-wider block">Admin</span>
            <span className="text-[7px] text-zinc-500 font-bold block">L&S</span>
          </div>
        </div>

        {/* Center navigation items */}
        <div className="flex flex-col items-center space-y-6 w-full px-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard Financiero"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <TrendingUp className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Finanzas</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            title="Agenda & Despacho"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all relative ${
              activeTab === 'agenda' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            {pendingJobs.length > 0 && (
              <span className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {pendingJobs.length}
              </span>
            )}
            <Calendar className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            title="Control de Técnicos"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'staff' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <Users className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Técnicos</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            title="Tarifas & Configuración"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'catalog' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <Settings className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Config</span>
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
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4 mb-6" id="admin-workspace-brand-header">
        <div className="flex items-center space-x-3">
          <div className="bg-[#0A0A0A] p-1.5 rounded-xl border border-[#1F1F1F] shadow-md max-w-[150px] overflow-hidden">
            <img 
              src="https://appdesign.appdesignproyectos.com/lyslogo.jpg" 
              alt="L&S Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black text-white tracking-tight leading-none">CONSOLA ADMINISTRATIVA L&S</h1>
            <span className="text-[9px] font-black text-[#CCA049] uppercase tracking-widest mt-1 block">Operaciones & Finanzas en Tiempo Real</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 bg-[#0A0A0A] border border-[#1F1F1F] px-3.5 py-1.5 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <span className="text-[9.5px] font-bold text-zinc-400 font-mono">ENLACE ACTIVO CON CAMPO</span>
        </div>
      </div>

      {/* MAIN ADMIN WORK AREA */}
      <div className="w-full flex flex-col space-y-5" id="admin-main-stage">
        
        {/* TABS 1: Dashboard Financiero */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 text-left animate-fade-in" id="panel-dashboard">
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0A0A] p-4 rounded-3xl border border-[#1F1F1F] shadow-sm">
              <div className="text-left">
                <h2 className="text-sm font-black text-white">Consola Ejecutiva de Ingresos L&S</h2>
                <p className="text-[10px] text-zinc-400 mt-0.5">Reportes consolidados, comisiones retenidas y desglose de caja por periodo.</p>
              </div>
              <div className="flex bg-[#121212] p-0.5 rounded-lg border border-[#1F1F1F]">
                {(['Diario', 'Semanal', 'Mensual'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setFinancialPeriod(period)}
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                      financialPeriod === period 
                        ? 'bg-[#CCA049] text-black shadow-2xs font-black' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* REAL-TIME METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="metrics-counters-grid">
              
              <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm text-left relative overflow-hidden">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Servicios Activos</span>
                <span className="text-2xl font-black text-slate-800 block mt-1">{activeJobs.length}</span>
                <span className="text-[8px] text-indigo-500 font-bold block mt-1.5">En curso o ruta</span>
                <div className="absolute right-3.5 bottom-3.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm text-left">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Pendientes</span>
                <span className="text-2xl font-black text-amber-500 block mt-1">{pendingJobs.length}</span>
                <span className="text-[8px] text-slate-400 font-bold block mt-1.5">Por asignar express</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm text-left relative overflow-hidden bg-rose-50/20">
                <span className="text-[9px] text-rose-500 uppercase font-black tracking-wider block">Urgencias</span>
                <span className="text-2xl font-black text-rose-600 block mt-1">{urgentJobs.length}</span>
                <span className="text-[8px] text-rose-400 font-bold block mt-1.5">Atención prioritaria</span>
                {urgentJobs.length > 0 && (
                  <div className="absolute right-3 top-3 bg-rose-500 text-white text-[7.5px] px-1.5 py-0.2 rounded font-black uppercase animate-bounce">ALERTA</div>
                )}
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm text-left">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Cerrados</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">{completedToday.length}</span>
                <span className="text-[8px] text-slate-400 font-bold block mt-1.5">Servicios archivados</span>
              </div>

            </div>

            {/* FINANCIAL STATS PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="financial-consoles">
              
              {/* Financial Summary */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm md:col-span-1 space-y-4 text-left">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Caja General de Turno ({financialPeriod})</p>
                
                <div className="space-y-2.5">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                    <span className="text-[8px] text-slate-400 uppercase font-bold">Ingreso Bruto Total</span>
                    <span className="text-xl font-black text-slate-800 block mt-0.5">${finance.totalRevenue.toLocaleString()} MXN</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                    <span className="text-[8px] text-slate-400 uppercase font-bold">Líquido de Comisiones Técnicos</span>
                    <span className="text-xl font-black text-rose-500 block mt-0.5">-${finance.totalCommissions.toLocaleString()} MXN</span>
                  </div>

                  <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100 text-left">
                    <span className="text-[8px] text-emerald-600 uppercase font-bold">Utilidad Neta L&S (Margen)</span>
                    <span className="text-xl font-black text-emerald-600 block mt-0.5">${finance.netMargin.toLocaleString()} MXN</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Chart and payment breakdown */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm md:col-span-2 space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estadística de Cobros y Método de Pago</p>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider font-mono">100% Sincronizado</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payments breakdown progress bars */}
                  <div className="space-y-3.5 flex flex-col justify-center">
                    
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>💵 Efectivo (Sin Comisión)</span>
                        <span className="font-mono">${finance.efectivoTotal.toLocaleString()} MXN</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${finance.totalRevenue > 0 ? (finance.efectivoTotal / finance.totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>📲 Transferencia SPEI</span>
                        <span className="font-mono">${finance.speiTotal.toLocaleString()} MXN</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${finance.totalRevenue > 0 ? (finance.speiTotal / finance.totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>💳 Tarjeta (+4% Comisión)</span>
                        <span className="font-mono">${finance.tarjetaTotal.toLocaleString()} MXN</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${finance.totalRevenue > 0 ? (finance.tarjetaTotal / finance.totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* PREMIUM BAR GRAPHICS INSIDE SVG (Ensures 100% compilation and stellar design) */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between" id="financial-svg-chart">
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase mb-1">Evolución de Ingresos</p>
                    <div className="flex-1 flex items-end justify-around h-32 pt-4">
                      
                      {[
                        { day: 'Lun', val: 12000 },
                        { day: 'Mar', val: 18000 },
                        { day: 'Mié', val: 14500 },
                        { day: 'Jue', val: 24000 },
                        { day: 'Vie', val: 29800 },
                        { day: 'Sáb', val: 22400 }
                      ].map((item) => {
                        const maxVal = 32000;
                        const heightPct = (item.val / maxVal) * 100;
                        return (
                          <div key={item.day} className="flex flex-col items-center flex-1 space-y-1.5">
                            <div className="relative w-4 sm:w-5 bg-slate-200 rounded-md overflow-hidden h-24 flex items-end">
                              <div 
                                className="w-full bg-slate-950 rounded-md transition-all duration-300 hover:bg-amber-500"
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">{item.day}</span>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TABS 2: Gestión de Servicios y Agenda (Express Dispatch) */}
        {activeTab === 'agenda' && (
          <div className="space-y-5 text-left animate-fade-in" id="panel-agenda">
            
            {/* Urgent Job Alerta Banner */}
            {urgentJobs.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between text-left animate-pulse">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-black text-rose-900 uppercase">Urgencia Crítica Detectada ({urgentJobs.length})</h4>
                    <p className="text-[10px] text-rose-700 mt-0.5">Se emitieron solicitudes de pánico GPS. Favor de coordinar su despacho de inmediato.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addSystemLog('Admin: Confirmó alerta de urgencias')}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-[9.5px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer shadow-xs"
                >
                  Silenciar Alerta
                </button>
              </div>
            )}

            {/* EXPRESS ASSIGNMENT BOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="express-dispatch-system">
              
              {/* Left Column: Pending Services queue */}
              <div className="bg-white rounded-3xl p-4 border border-slate-150 shadow-sm lg:col-span-1 flex flex-col space-y-3">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h4 className="text-[11px] font-black uppercase text-slate-500">Pendientes de Asignar ({pendingJobs.length})</h4>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-slate-950 hover:bg-slate-800 text-white text-[9.5px] font-extrabold px-2 py-1 rounded-lg flex items-center space-x-0.5"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Crear</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1" id="pending-jobs-scroller">
                  {pendingJobs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-[10.5px]">
                      Ningún servicio pendiente. Todos los tickets han sido despachados.
                    </div>
                  ) : (
                    pendingJobs.map((job) => (
                      <div key={job.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-150 hover:border-slate-300 transition-all text-left space-y-2 relative">
                        {job.priority === 'Urgente' && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                        <div className="text-left">
                          <span className="text-[8px] bg-slate-200 text-slate-600 font-mono font-bold px-1.5 py-0.2 rounded uppercase">ORDEN #{job.id}</span>
                          <h5 className="text-[11.5px] font-black text-slate-800 mt-1">{job.clientName}</h5>
                        </div>
                        <p className="text-[9.5px] text-slate-500 line-clamp-2 italic">"{job.description}"</p>
                        <p className="text-[9px] text-slate-400 flex items-center"><MapPin className="h-3 w-3 text-amber-500 mr-1 shrink-0" /> {job.clientLocation}</p>
                        
                        {/* Quick Assign Dropdown */}
                        <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                          <span className="text-[8px] text-slate-400 font-extrabold uppercase">Despachar a:</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleAssignTechnician(job.id, e.target.value);
                            }}
                            className="bg-white border border-slate-200 text-[9px] font-bold rounded px-1.5 py-0.5 outline-none text-slate-700 cursor-pointer"
                          >
                            <option value="">-- Asignar --</option>
                            {technicians.filter(t => t.status !== 'Inactivo').map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Global Calendar/Timeline Map view */}
              <div className="bg-white rounded-3xl p-4 border border-slate-150 shadow-sm lg:col-span-2 flex flex-col space-y-3">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h4 className="text-[11px] font-black uppercase text-slate-500">Calendario de Rutas y Compromisos</h4>
                  <span className="text-[9px] font-extrabold text-slate-400 font-mono">EDICIÓN DIARIA</span>
                </div>

                {/* Calendar Layout representation */}
                <div className="grid grid-cols-7 gap-1 text-center bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-[9.5px] font-bold text-slate-500" id="calendar-days-header">
                  <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span className="text-amber-600">Sáb</span>
                </div>

                <div className="grid grid-cols-7 gap-1 border-b border-slate-100 pb-2" id="calendar-grid-cells">
                  {[...Array(28)].map((_, idx) => {
                    const dayNum = idx + 1;
                    const isToday = dayNum === 5; // Simulating today as 5th of July
                    return (
                      <div 
                        key={idx} 
                        className={`h-9 rounded-lg flex items-center justify-center text-[10.5px] font-mono font-bold ${
                          isToday 
                            ? 'bg-slate-950 text-white shadow-2xs font-black' 
                            : 'bg-slate-50/50 text-slate-400 hover:bg-slate-100/50'
                        }`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>

                {/* Global daily schedule list */}
                <p className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider">Desglose de Compromisos Asignados</p>
                <div className="space-y-1.5 overflow-y-auto max-h-[170px]" id="calendar-schedule-timeline">
                  {jobs.filter(j => j.status !== 'Pendiente').map((job) => (
                    <div key={job.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[10.5px]">
                      <div className="flex items-center space-x-2 text-left">
                        <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-600 px-1 py-0.2 rounded">{job.time}</span>
                        <div>
                          <p className="font-extrabold text-slate-800">{job.category} — {job.clientName}</p>
                          <p className="text-[9px] text-slate-400">Asignado a: <span className="font-bold text-slate-600">{job.technicianName}</span></p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        job.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TABS 3: Control de Técnicos (Monitor de Estatus & Cierre de Caja) */}
        {activeTab === 'staff' && (
          <div className="space-y-5 text-left animate-fade-in" id="panel-staff">
            
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm text-left">
              <h2 className="text-sm font-black text-slate-800">Monitor de Técnicos en Campo</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Audite el estatus de disponibilidad del personal y liquide el corte de comisiones acumuladas.</p>
            </div>

            {/* Technicians grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="technicians-management-grid">
              {technicians.map((tech) => {
                // Compute current commission total
                const pendingCommission = Math.round(tech.commissionEarned);

                return (
                  <div key={tech.id} className="bg-white rounded-3xl p-4 border border-slate-150 shadow-sm flex flex-col justify-between space-y-4" id={`tech-manage-card-${tech.id}`}>
                    
                    <div className="space-y-3">
                      {/* Avatar and specialty */}
                      <div className="flex items-center space-x-3">
                        <img src={tech.avatar} alt={tech.name} className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-xs" />
                        <div className="text-left">
                          <h4 className="text-xs font-black text-slate-800">{tech.name}</h4>
                          <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">{tech.specialty}</span>
                        </div>
                      </div>

                      {/* Monitor de Estatus toggle */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-[8.5px] text-slate-500 font-extrabold uppercase">Monitor de estatus:</span>
                        <select
                          value={tech.status}
                          onChange={(e) => handleToggleTechStatus(tech.id, e.target.value as any)}
                          className="bg-white border border-slate-200 text-[9.5px] font-extrabold rounded px-2 py-0.5 outline-none text-slate-700 cursor-pointer"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="En camino">En camino</option>
                          <option value="En servicio">En servicio</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>

                      {/* Commission tracker and services completed */}
                      <div className="grid grid-cols-2 gap-2 text-center" id="tech-finance-monitor">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 block uppercase font-bold">Servicios</span>
                          <span className="text-sm font-extrabold text-slate-800">{tech.completedJobs}</span>
                        </div>
                        <div className="bg-amber-50/30 p-2 rounded-xl border border-amber-100/40">
                          <span className="text-[8px] text-amber-600 block uppercase font-bold">Comisión</span>
                          <span className="text-sm font-extrabold text-amber-600">${pendingCommission.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* CIERRE DE CAJA BUTTON PER TECHNICIAN */}
                    <button
                      type="button"
                      onClick={() => handleCashCloseForTech(tech.id, pendingCommission)}
                      className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-[10.5px] py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                      id={`btn-corte-caja-${tech.id}`}
                    >
                      <Percent className="h-3.5 w-3.5" />
                      <span>Liquidar / Corte de Caja</span>
                    </button>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TABS 4: Catálogo de Servicios y Precios */}
        {activeTab === 'catalog' && (
          <div className="space-y-5 text-left animate-fade-in" id="panel-catalog">
            
            <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm text-left">
              <h2 className="text-sm font-black text-slate-800">Parámetros, Tarifas y Reglas de Recargo</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Gestione los precios base de los servicios de campo y modifique porcentajes de recargos comerciales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="config-matrices">
              
              {/* Matriz de Tarifas */}
              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Matriz de Tarifas Base de Mano de Obra</p>
                
                <div className="space-y-3" id="price-matrix-editor">
                  {editableBasePrices.map((b) => (
                    <div key={b.category} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50/50">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-2">
                        <span>{b.icon}</span>
                        <span>{b.category}</span>
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-[10.5px] font-bold text-slate-400">Tarifa: $</span>
                        <input
                          type="number"
                          value={b.price}
                          onChange={(e) => handleUpdatePrice(b.category, parseInt(e.target.value) || 0)}
                          className="w-20 bg-slate-50 text-[11px] rounded-lg border border-slate-200 py-1 px-2 font-black text-slate-800 font-mono text-center outline-none focus:border-amber-500"
                        />
                        <span className="text-[9px] text-slate-400 font-extrabold">MXN</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reglas de Recargos */}
              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Reglas de Recargos y Tarifación Extra</p>
                
                <div className="space-y-4 text-left" id="surcharge-rules-editor">
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Recargo Turno Nocturno (%)</label>
                      <input
                        type="number"
                        value={surchargeRules.nightShiftPct}
                        onChange={(e) => {
                          const pct = parseInt(e.target.value) || 0;
                          setSurchargeRules(prev => ({ ...prev, nightShiftPct: pct }));
                          addSystemLog(`Admin: Cambió recargo nocturno a ${pct}%`);
                        }}
                        className="w-16 bg-slate-50 text-xs rounded-lg border border-slate-200 py-1 px-2 font-black text-slate-800 text-center outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <p className="text-[9.5px] text-slate-400">Porcentaje que se suma a la mano de obra para servicios fuera del horario regular (20:00 - 06:00 hrs).</p>
                  </div>

                  <div className="space-y-1 border-t border-slate-50 pt-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Comisión Pago con Tarjeta (%)</label>
                      <input
                        type="number"
                        value={surchargeRules.cardFeePct}
                        onChange={(e) => {
                          const pct = parseInt(e.target.value) || 0;
                          setSurchargeRules(prev => ({ ...prev, cardFeePct: pct }));
                          addSystemLog(`Admin: Cambió recargo por pago con tarjeta a ${pct}%`);
                        }}
                        className="w-16 bg-slate-50 text-xs rounded-lg border border-slate-200 py-1 px-2 font-black text-slate-800 text-center outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <p className="text-[9.5px] text-slate-400">Porcentaje de recargo automático cobrado en el terminal para compensar la comisión bancaria.</p>
                  </div>

                  <div className="space-y-1 border-t border-slate-50 pt-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Tarifa Emergencia Botón Pánico ($)</label>
                      <input
                        type="number"
                        value={surchargeRules.urgentFlat}
                        onChange={(e) => {
                          const flat = parseInt(e.target.value) || 0;
                          setSurchargeRules(prev => ({ ...prev, urgentFlat: flat }));
                          addSystemLog(`Admin: Cambió recargo flat por botón de pánico a $${flat} MXN`);
                        }}
                        className="w-16 bg-slate-50 text-xs rounded-lg border border-slate-200 py-1 px-2 font-black text-slate-800 text-center outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <p className="text-[9.5px] text-slate-400">Cargo fijo en pesos sumado de forma automática para servicios urgentes despachados por botón de pánico.</p>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL: MANUAL TICKET CREATION (Asignación Express / Creación) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="modal-create-job">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-100 shadow-2xl flex flex-col space-y-4 animate-scale-up text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-800">Nueva Órden de Servicio</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateJobSubmit} className="space-y-3 text-left">
              <div className="text-left">
                <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Cliente</label>
                <input
                  type="text"
                  placeholder="ej. Juan Pérez"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 outline-none font-bold text-slate-800 text-left"
                />
              </div>

              <div className="text-left">
                <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="ej. 555-092-8110"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 outline-none font-bold text-slate-800 text-left font-mono"
                />
              </div>

              <div className="text-left">
                <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Ubicación / Dirección</label>
                <input
                  type="text"
                  placeholder="ej. Av. Insurgentes 310, CDMX"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 outline-none font-bold text-slate-800 text-left"
                />
              </div>

              <div className="text-left">
                <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Categoría Trabajo</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 outline-none font-extrabold text-slate-800"
                >
                  <option value="Plomería">🚰 Plomería</option>
                  <option value="Electricidad">⚡ Electricidad</option>
                  <option value="Herrería">⛓️ Herrería</option>
                  <option value="Gas">🔥 Gas LP</option>
                  <option value="Aire Acondicionado">❄️ Aire Acondicionado</option>
                  <option value="Otros">🛠️ Otros Mantenimientos</option>
                </select>
              </div>

              <div className="text-left">
                <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Detalle de la Falla</label>
                <textarea
                  placeholder="Describa el trabajo a realizar..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 outline-none text-slate-800 text-left"
                />
              </div>

              <div className="text-left">
                <label className="text-[8.5px] text-slate-400 font-bold uppercase block mb-1">Prioridad</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Baja', 'Media', 'Alta', 'Urgente'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                        newPriority === p 
                          ? 'bg-slate-950 text-white border-slate-950 font-black' 
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer text-center text-xs mt-2 shadow-xs"
              >
                DESPACHAR SOLICITUD
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
