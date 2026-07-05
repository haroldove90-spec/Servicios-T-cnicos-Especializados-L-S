import React, { useRef, useEffect } from 'react';
import { 
  Wrench, 
  MapPin, 
  Phone, 
  Clock, 
  Camera, 
  Plus, 
  Trash2, 
  CheckCircle, 
  CreditCard, 
  User, 
  Signature, 
  DollarSign, 
  ArrowLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ServiceJob, Technician, MaterialItem } from '../types';

interface TechnicianWorkspaceProps {
  onExitRole: () => void;
  jobs: ServiceJob[];
  setJobs: React.Dispatch<React.SetStateAction<ServiceJob[]>>;
  technicians: Technician[];
  setTechnicians: React.Dispatch<React.SetStateAction<Technician[]>>;
  materials: MaterialItem[];
  setMaterials: React.Dispatch<React.SetStateAction<MaterialItem[]>>;
  addSystemLog: (msg: string) => void;
}

export default function TechnicianWorkspace({
  onExitRole,
  jobs,
  setJobs,
  technicians,
  setTechnicians,
  materials,
  setMaterials,
  addSystemLog
}: TechnicianWorkspaceProps) {
  // Current logged technician (simulated switcher)
  const [selectedTechId, setSelectedTechId] = React.useState<string>('tech-carlos');
  const activeTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

  // Active technician screen sub-tab: 'agenda' | 'evidencia' | 'cierre'
  const [activeTab, setActiveTab] = React.useState<'agenda' | 'evidencia' | 'cierre'>('agenda');

  // Currently focused job from the itinerary
  const [selectedJobId, setSelectedJobId] = React.useState<string>('');

  // Selected job object
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs.find(j => j.technicianId === activeTech.id && j.status !== 'Finalizado') || jobs.find(j => j.technicianId === activeTech.id);

  // Set initial selected job on tech change
  useEffect(() => {
    const techJobs = jobs.filter(j => j.technicianId === activeTech.id && j.status !== 'Finalizado');
    if (techJobs.length > 0) {
      setSelectedJobId(techJobs[0].id);
    } else {
      const anyTechJob = jobs.find(j => j.technicianId === activeTech.id);
      if (anyTechJob) {
        setSelectedJobId(anyTechJob.id);
      } else {
        setSelectedJobId('');
      }
    }
  }, [selectedTechId]);

  // Vale de materiales drawer/form states
  const [selectedMatId, setSelectedMatId] = React.useState<string>('');
  const [matQty, setMatQty] = React.useState<number>(1);

  // Signature canvas state & reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasSignature, setHasSignature] = React.useState(false);

  // Before/After photo mock upload options
  const [mockPhotoBefore, setMockPhotoBefore] = React.useState<string>('');
  const [mockPhotoAfter, setMockPhotoAfter] = React.useState<string>('');

  // Surcharges and payments
  const [nightShiftSurcharge, setNightShiftSurcharge] = React.useState<boolean>(false);
  const [tempPaymentMethod, setTempPaymentMethod] = React.useState<'Efectivo' | 'SPEI' | 'Tarjeta'>('Efectivo');

  // Filter jobs assigned to the selected technician
  const technicianJobs = jobs
    .filter(j => j.technicianId === activeTech.id)
    .sort((a, b) => {
      // Prioritize urgent and non-finished ones
      if (a.status === 'Finalizado' && b.status !== 'Finalizado') return 1;
      if (a.status !== 'Finalizado' && b.status === 'Finalizado') return -1;
      if (a.priority === 'Urgente' && b.priority !== 'Urgente') return -1;
      if (a.priority !== 'Urgente' && b.priority === 'Urgente') return 1;
      return 0;
    });

  // Calculate prices dynamically for active job
  const getJobFinances = (job: ServiceJob | undefined) => {
    if (!job) return { base: 0, mats: 0, surcharges: 0, total: 0 };
    
    const base = job.basePrice;
    const mats = job.materialsUsed.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    
    let surcharges = 0;
    // Urgent surcharge
    if (job.priority === 'Urgente') surcharges += 200;
    // Night surcharge
    if (nightShiftSurcharge) surcharges += (base * 0.35);
    // Card surcharge
    if (tempPaymentMethod === 'Tarjeta') surcharges += ((base + mats + surcharges) * 0.04);

    const total = base + mats + surcharges;

    return {
      base: Math.round(base * 100) / 100,
      mats: Math.round(mats * 100) / 100,
      surcharges: Math.round(surcharges * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const finances = getJobFinances(activeJob);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || activeJob?.status === 'Finalizado') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Status updates
  const changeJobStatus = (newStatus: ServiceJob['status']) => {
    if (!activeJob) return;
    setJobs(prev => prev.map(j => {
      if (j.id === activeJob.id) {
        addSystemLog(`Técnico: Orden ${j.id} cambiada a estado [${newStatus}]`);
        return { ...j, status: newStatus };
      }
      return j;
    }));
  };

  // Add material to job
  const handleAddMaterial = () => {
    if (!activeJob || !selectedMatId) return;
    const selectedMat = materials.find(m => m.id === selectedMatId);
    if (!selectedMat) return;

    if (selectedMat.stock < matQty) {
      alert(`Inventario insuficiente. Stock disponible: ${selectedMat.stock} ${selectedMat.unit}`);
      return;
    }

    setJobs(prev => prev.map(j => {
      if (j.id === activeJob.id) {
        // Check if material already added
        const existingMat = j.materialsUsed.find(m => m.id === selectedMatId);
        let updatedMaterials = [...j.materialsUsed];

        if (existingMat) {
          updatedMaterials = j.materialsUsed.map(m => 
            m.id === selectedMatId ? { ...m, qty: m.qty + matQty } : m
          );
        } else {
          updatedMaterials.push({
            id: selectedMat.id,
            name: selectedMat.name,
            qty: matQty,
            unitPrice: selectedMat.unitPrice
          });
        }

        // Deduct from general inventory
        setMaterials(prevMat => prevMat.map(m => 
          m.id === selectedMatId ? { ...m, stock: m.stock - matQty } : m
        ));

        addSystemLog(`Técnico: Agregó material (${selectedMat.name} x${matQty}) a la orden ${j.id}`);
        return {
          ...j,
          materialsUsed: updatedMaterials,
          materialsPrice: j.materialsPrice + (matQty * selectedMat.unitPrice)
        };
      }
      return j;
    }));

    setSelectedMatId('');
    setMatQty(1);
  };

  // Remove material from job
  const handleRemoveMaterial = (matId: string, qty: number, price: number) => {
    if (!activeJob) return;

    setJobs(prev => prev.map(j => {
      if (j.id === activeJob.id) {
        // Return stock back to inventory
        setMaterials(prevMat => prevMat.map(m => 
          m.id === matId ? { ...m, stock: m.stock + qty } : m
        ));

        addSystemLog(`Técnico: Removió material de la orden ${j.id}`);
        return {
          ...j,
          materialsUsed: j.materialsUsed.filter(m => m.id !== matId),
          materialsPrice: Math.max(0, j.materialsPrice - (qty * price))
        };
      }
      return j;
    }));
  };

  // Finalize Job
  const handleFinalizeJob = () => {
    if (!activeJob) return;

    let signatureDataUrl = '';
    if (canvasRef.current && hasSignature) {
      signatureDataUrl = canvasRef.current.toDataURL();
    }

    // Update parent jobs state
    setJobs(prev => prev.map(j => {
      if (j.id === activeJob.id) {
        const commissionAmount = finances.total * (j.commissionPct / 100);
        
        // Update technician completed status
        setTechnicians(prevTech => prevTech.map(t => 
          t.id === activeTech.id 
            ? { 
                ...t, 
                completedJobs: t.completedJobs + 1, 
                commissionEarned: t.commissionEarned + commissionAmount 
              } 
            : t
        ));

        addSystemLog(`Cierre de Caja: Técnico ${activeTech.name} finalizó servicio ${j.id}. Total: $${finances.total} MXN. Comisión: $${commissionAmount.toFixed(1)} MXN`);
        
        return {
          ...j,
          status: 'Finalizado',
          basePrice: finances.base,
          materialsPrice: finances.mats,
          surcharges: finances.surcharges,
          totalPrice: finances.total,
          paymentMethod: tempPaymentMethod,
          commissionAmount: commissionAmount,
          photoBefore: mockPhotoBefore || j.photoBefore || 'https://images.unsplash.com/photo-1558223140-d096f4cf9a2a?auto=format&fit=crop&w=300&q=80',
          photoAfter: mockPhotoAfter || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
          signature: signatureDataUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          expiryDate: new Date(Date.now() + j.warrantyMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
      return j;
    }));

    alert('Servicio finalizado con éxito. Se registró el cobro, la firma y la evidencia técnica.');
    setActiveTab('agenda');
    setHasSignature(false);
    setMockPhotoBefore('');
    setMockPhotoAfter('');
  };

  // Mock upload triggers
  const setMockPhoto = (type: 'before' | 'after') => {
    const plumberMocksBefore = [
      'https://images.unsplash.com/photo-1558223140-d096f4cf9a2a?auto=format&fit=crop&w=400&q=80', // leaking pipe
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'  // open toolbox
    ];
    const plumberMocksAfter = [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=400&q=80', // clean weld
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80'  // completed repair
    ];

    if (type === 'before') {
      const mock = plumberMocksBefore[Math.floor(Math.random() * plumberMocksBefore.length)];
      setMockPhotoBefore(mock);
      addSystemLog(`Técnico: Cargó fotografía de evidencia "Antes" para el servicio`);
    } else {
      const mock = plumberMocksAfter[Math.floor(Math.random() * plumberMocksAfter.length)];
      setMockPhotoAfter(mock);
      addSystemLog(`Técnico: Cargó fotografía de evidencia "Después" para el servicio`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#010101] text-white font-sans pb-24 lg:pb-8 lg:pr-28 animate-fade-in relative px-4 py-6" id="tech-workspace">
      
      {/* 1. BOTTOM NAVIGATION BAR (Mobile & Tablet: lg:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0A] border-t border-[#1F1F1F] flex justify-around items-center z-40 lg:hidden px-2 shadow-xl">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'agenda' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Clock className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Agenda</span>
        </button>

        <button
          onClick={() => {
            if (!activeJob) { alert('Seleccione un servicio activo primero.'); return; }
            setActiveTab('evidencia');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'evidencia' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Camera className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Evidencia</span>
        </button>

        <button
          onClick={() => {
            if (!activeJob) { alert('Seleccione un servicio activo primero.'); return; }
            setActiveTab('cierre');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold cursor-pointer transition-all ${
            activeTab === 'cierre' ? 'text-[#CCA049]' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Signature className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] truncate">Cierre</span>
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
            <span className="text-[8px] font-black text-[#CCA049] uppercase tracking-wider block">Técnico</span>
            <span className="text-[7px] text-zinc-500 font-bold block">L&S</span>
          </div>
        </div>

        {/* Center navigation items */}
        <div className="flex flex-col items-center space-y-6 w-full px-2">
          <button
            onClick={() => setActiveTab('agenda')}
            title="Mi Agenda"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'agenda' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <Clock className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Agenda</span>
          </button>

          <button
            onClick={() => {
              if (!activeJob) { alert('Seleccione un servicio activo primero.'); return; }
              setActiveTab('evidencia');
            }}
            title="Estructurar Materiales & Evidencia"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'evidencia' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <Camera className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Evidencia</span>
          </button>

          <button
            onClick={() => {
              if (!activeJob) { alert('Seleccione un servicio activo primero.'); return; }
              setActiveTab('cierre');
            }}
            title="Cierre Digital & Firma"
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'cierre' 
                ? 'bg-[#CCA049] text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
            }`}
          >
            <Signature className="h-5.5 w-5.5" />
            <span className="text-[8px] font-bold mt-1 tracking-tight">Cierre</span>
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

      {/* Top Header Row with L&S Brand Logo & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1F1F1F] pb-4 mb-6 max-w-3xl mx-auto w-full gap-3" id="tech-workspace-brand-header">
        <div className="flex items-center space-x-3">
          <img 
            src="https://appdesign.appdesignproyectos.com/lyslogo.jpg" 
            alt="L&S Logo" 
            className="h-11 w-auto object-contain shrink-0"
          />
          <div className="text-left">
            <span className="text-[8px] font-black text-[#CCA049] uppercase tracking-widest leading-none">Operación de Campo</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-xs text-zinc-400 font-bold">Frente Técnico:</span>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="bg-transparent text-xs font-black text-white outline-none border-b border-[#CCA049]/45 pb-0.5 cursor-pointer block"
                id="tech-select-picker"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Mini Stats Strip */}
        <div className="grid grid-cols-3 gap-2 text-center max-w-xs w-full" id="tech-mini-stats">
          <div className="bg-[#0A0A0A] p-1.5 rounded-xl border border-[#1F1F1F]">
            <span className="text-[7.5px] text-zinc-500 block uppercase font-black">Cerrados</span>
            <span className="text-[11px] font-black text-white">{activeTech.completedJobs}</span>
          </div>
          <div className="bg-[#0A0A0A] p-1.5 rounded-xl border border-[#1F1F1F]">
            <span className="text-[7.5px] text-zinc-500 block uppercase font-black">Estatus</span>
            <span className="text-[8.5px] font-black text-[#CCA049] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCA049] animate-pulse mr-1"></span>
              <span>{activeTech.status}</span>
            </span>
          </div>
          <div className="bg-[#0A0A0A] p-1.5 rounded-xl border border-[#1F1F1F]">
            <span className="text-[7.5px] text-zinc-500 block uppercase font-black">Comisiones</span>
            <span className="text-[11px] font-black text-[#CCA049] font-mono">${activeTech.commissionEarned.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT AREA WITH CENTERED WIDTH CONTAINER */}
      <div className="max-w-3xl mx-auto w-full flex-1" id="tech-tab-content">
        
        {/* TABS 1: Agenda del Día */}
        {activeTab === 'agenda' && (
          <div className="space-y-4 text-left animate-fade-in" id="tab-agenda">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#CCA049] flex items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>Ruta e Itinerario Diario</span>
              </h3>
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold font-mono">HOY</span>
            </div>

            {/* List of active/completed jobs for this technician */}
            {technicianJobs.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-extrabold text-slate-400">Sin servicios asignados para hoy</p>
                <p className="text-[10px] text-slate-500 mt-1">Vaya a la consola del Administrador para crear y arrastrar nuevos servicios a su agenda.</p>
              </div>
            ) : (
              <div className="space-y-3" id="tech-jobs-scroller">
                {technicianJobs.map((job) => {
                  const isSelected = activeJob?.id === job.id;
                  let statusColor = "bg-slate-800 text-slate-300 border-slate-700";
                  let priorityColor = "bg-slate-800 text-slate-400";

                  if (job.status === 'Asignado') statusColor = "bg-blue-950/80 text-blue-300 border-blue-900";
                  else if (job.status === 'En camino') statusColor = "bg-amber-950/80 text-amber-300 border-amber-900";
                  else if (job.status === 'En servicio') statusColor = "bg-violet-950/80 text-violet-300 border-violet-900";
                  else if (job.status === 'Finalizado') statusColor = "bg-emerald-950/80 text-emerald-300 border-emerald-900";

                  if (job.priority === 'Urgente') priorityColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  else if (job.priority === 'Alta') priorityColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";

                  return (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        addSystemLog(`Técnico: Seleccionó orden de servicio ${job.id} para revisión`);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col space-y-2.5 ${
                        isSelected 
                          ? 'bg-slate-900 border-[#CCA049]/80 shadow-md scale-[1.01]' 
                          : 'bg-slate-900/60 border-slate-850 hover:border-slate-800 hover:bg-slate-900/85'
                      }`}
                      id={`tech-job-card-${job.id}`}
                    >
                      {/* Active indicator dot */}
                      {isSelected && (
                        <div className="absolute left-[-1px] top-4 bottom-4 w-1 bg-[#CCA049] rounded-r" />
                      )}

                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {job.time} hrs
                          </span>
                          <h4 className="text-[13px] font-black text-white mt-1">
                            {job.clientName}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end space-y-1.5">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 border rounded-full ${statusColor}`}>
                            {job.status}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${priorityColor}`}>
                            {job.priority}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-1 bg-slate-950/45 p-2 rounded-xl border border-slate-850">
                        <p className="flex items-center text-[9.5px]"><MapPin className="h-3 w-3 text-[#CCA049] mr-1 shrink-0" /> <span className="truncate">{job.clientLocation}</span></p>
                        <p className="line-clamp-2 italic text-slate-400">"{job.description}"</p>
                      </div>

                      {/* Expandable actions if selected and not finalized */}
                      {isSelected && job.status !== 'Finalizado' && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[8.5px] font-extrabold text-slate-500">Mover estatus:</span>
                          <div className="flex space-x-1.5">
                            <button
                              onClick={() => changeJobStatus('En camino')}
                              className={`px-2.5 py-1 text-[8.5px] font-black rounded border transition-all cursor-pointer ${
                                job.status === 'En camino' 
                                  ? 'bg-[#CCA049] text-black border-[#CCA049] shadow-sm' 
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-755'
                              }`}
                            >
                              En camino
                            </button>
                            <button
                              onClick={() => changeJobStatus('En servicio')}
                              className={`px-2.5 py-1 text-[8.5px] font-black rounded border transition-all cursor-pointer ${
                                job.status === 'En servicio' 
                                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm' 
                                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-755'
                              }`}
                            >
                              En servicio
                            </button>
                            <button
                              onClick={() => {
                                changeJobStatus('En servicio');
                                setActiveTab('evidencia');
                              }}
                              className="px-2.5 py-1 text-[8.5px] font-black rounded bg-[#CCA049] text-black border border-[#CCA049] hover:bg-[#B88E3D] transition-all cursor-pointer flex items-center space-x-1 font-bold"
                            >
                              <span>Reportar ➡️</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Shortcut to view details if finished */}
                      {isSelected && job.status === 'Finalizado' && (
                        <div className="pt-2 border-t border-slate-800/80 text-right text-[8.5px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>💵 Cobro registrado: {job.paymentMethod}</span>
                          <span>✓ Orden Cerrada</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Evidencia y Reporte Técnico (Vale de Materiales) */}
        {activeTab === 'evidencia' && activeJob && (
          <div className="space-y-4 text-left animate-fade-in" id="tab-evidencia">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-left">
              <div className="text-left">
                <p className="text-[11px] font-black text-white">
                  Orden: <span className="text-[#CCA049]">#{activeJob.id}</span>
                </p>
                <p className="text-[9.5px] text-slate-400 mt-0.5">
                  Cliente: {activeJob.clientName} • Categoría: <span className="font-bold text-slate-300">{activeJob.category}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('agenda')}
                className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[9.5px] text-slate-300 px-2 py-1 rounded"
              >
                Volver
              </button>
            </div>

            {/* Photo evidence gallery */}
            <div className="space-y-3" id="evidence-photos">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Reporte Fotográfico de Evidencia</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center flex flex-col justify-center items-center space-y-2 min-h-[140px] relative overflow-hidden">
                  {mockPhotoBefore || activeJob.photoBefore ? (
                    <>
                      <img 
                        src={mockPhotoBefore || activeJob.photoBefore} 
                        alt="Antes" 
                        className="absolute inset-0 w-full h-full object-cover brightness-95" 
                      />
                      <span className="absolute bottom-1.5 left-1.5 text-[8.5px] font-black bg-slate-900/90 text-[#CCA049] border border-slate-800 px-2 py-0.5 rounded">FOTO: ANTES</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-slate-600" />
                      <span className="text-[10px] text-slate-400 block font-bold">Foto del problema</span>
                      {activeJob.status !== 'Finalizado' && (
                        <button
                          onClick={() => setMockPhoto('before')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold py-1 px-2.5 rounded border border-slate-700 transition-all cursor-pointer"
                        >
                          Tomar Foto (Antes)
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center flex flex-col justify-center items-center space-y-2 min-h-[140px] relative overflow-hidden">
                  {mockPhotoAfter || activeJob.photoAfter ? (
                    <>
                      <img 
                        src={mockPhotoAfter || activeJob.photoAfter} 
                        alt="Después" 
                        className="absolute inset-0 w-full h-full object-cover brightness-95" 
                      />
                      <span className="absolute bottom-1.5 left-1.5 text-[8.5px] font-black bg-slate-900/90 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded">FOTO: RESUELTO</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-slate-600" />
                      <span className="text-[10px] text-slate-400 block font-bold">Foto del resultado</span>
                      {activeJob.status !== 'Finalizado' && (
                        <button
                          onClick={() => setMockPhoto('after')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold py-1 px-2.5 rounded border border-slate-700 transition-all cursor-pointer"
                        >
                          Tomar Foto (Después)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Vale de materiales inventory block */}
            <div className="space-y-3" id="vale-materiales">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Vale de Refacciones y Materiales</p>
              
              {/* Added materials list */}
              <div className="space-y-1.5" id="materials-list">
                {activeJob.materialsUsed.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-4 text-center bg-slate-900/30 rounded-lg border border-dashed border-slate-850">Ninguna refacción agregada a esta orden.</p>
                ) : (
                  <div className="space-y-1.5">
                    {activeJob.materialsUsed.map((mat) => (
                      <div key={mat.id} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-[11px] font-medium text-slate-200 shadow-2xs">
                        <div className="text-left leading-normal">
                          <span className="font-black text-[#CCA049]">🛠 {mat.name}</span> — {mat.qty} pza(s) <span className="text-slate-400">(${mat.unitPrice} c/u)</span>
                        </div>
                        {activeJob.status !== 'Finalizado' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(mat.id, mat.qty, mat.unitPrice)}
                            className="text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded p-1 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Material to Vale Form (Only visible if not finished) */}
              {activeJob.status !== 'Finalizado' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3" id="form-add-refaccion">
                  <p className="text-[8px] font-black uppercase text-[#CCA049] tracking-wider text-left">Surtir Material del Inventario</p>
                  
                  <div className="grid grid-cols-1 gap-2.5" id="material-inputs-row">
                    <div className="text-left">
                      <label className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Seleccionar Material</label>
                      <select
                        value={selectedMatId}
                        onChange={(e) => setSelectedMatId(e.target.value)}
                        className="w-full bg-slate-950 text-[11.5px] rounded-lg border border-slate-850 p-2 outline-none font-bold text-white text-left"
                      >
                        <option value="">-- Elige un artículo --</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                            {m.name} (${m.unitPrice} MXN • Stock: {m.stock} {m.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 text-left">
                        <label className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={matQty}
                          onChange={(e) => setMatQty(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-950 text-[11px] rounded-lg border border-slate-850 p-2 outline-none font-bold text-white text-left font-mono"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleAddMaterial}
                          disabled={!selectedMatId}
                          className="bg-[#CCA049] hover:bg-[#B88E3D] disabled:bg-slate-800 disabled:text-slate-600 text-black rounded-lg py-2.5 px-4 font-black text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Surtir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons to Cierre */}
            <div className="flex justify-between pt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('agenda')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-extrabold text-[10.5px] px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-center"
              >
                ⬅ Itinerario
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cierre')}
                className="bg-[#CCA049] hover:bg-[#B88E3D] text-black font-black text-[10.5px] px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow"
              >
                Siguiente: Cobro & Firma ➡️
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: Cierre de Servicio y Cobro */}
        {activeTab === 'cierre' && activeJob && (
          <div className="space-y-4 text-left animate-fade-in" id="tab-cierre">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-left">
              <div className="text-left">
                <p className="text-[11px] font-black text-white">
                  Cobro de Orden: <span className="text-[#CCA049]">#{activeJob.id}</span>
                </p>
                <p className="text-[9.5px] text-slate-400 mt-0.5">
                  Mano de obra base: <span className="font-mono text-slate-300">${activeJob.basePrice} MXN</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('evidencia')}
                className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[9.5px] text-slate-300 px-2 py-1 rounded"
              >
                Volver
              </button>
            </div>

            {/* Interactive Calculator details */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-3" id="payment-calc-widget">
              <p className="text-[10px] font-extrabold uppercase text-[#CCA049] tracking-wider">Calculadora Integradora de Cierre</p>
              
              <div className="space-y-2 text-xs text-slate-300" id="finance-breakdown">
                <div className="flex justify-between items-center">
                  <span>Mano de obra tarifa base:</span>
                  <span className="font-mono font-bold">${finances.base} MXN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Vale de refacciones / materiales:</span>
                  <span className="font-mono font-bold text-[#CCA049]">+${finances.mats} MXN</span>
                </div>
                {activeJob.priority === 'Urgente' && (
                  <div className="flex justify-between items-center text-rose-400 text-[11px]">
                    <span>Cargo por atención Urgente:</span>
                    <span className="font-mono font-bold">+$200.00 MXN</span>
                  </div>
                )}

                {/* Night shift surcharge checkbox toggle */}
                {activeJob.status !== 'Finalizado' ? (
                  <div className="flex justify-between items-center py-1">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 text-[11px] font-semibold">
                      <input
                        type="checkbox"
                        checked={nightShiftSurcharge}
                        onChange={(e) => {
                          setNightShiftSurcharge(e.target.checked);
                          addSystemLog(`Técnico: Aplicó recargo del 35% de tarifa nocturna`);
                        }}
                        className="rounded border-slate-800 text-[#CCA049] focus:ring-0 focus:ring-offset-0 bg-slate-950"
                      />
                      <span>Aplicar Recargo Nocturno (+35%)</span>
                    </label>
                    {nightShiftSurcharge && <span className="font-mono font-bold text-indigo-400 text-[11px]">+${(finances.base * 0.35).toFixed(1)} MXN</span>}
                  </div>
                ) : (
                  activeJob.surcharges > 0 && (
                    <div className="flex justify-between items-center text-indigo-400">
                      <span>Cargos y recargos aplicados:</span>
                      <span className="font-mono font-bold">+${activeJob.surcharges} MXN</span>
                    </div>
                  )
                )}

                {/* Payment Method selector */}
                {activeJob.status !== 'Finalizado' ? (
                  <div className="py-2 border-t border-b border-slate-800 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">Método de Cobro</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Efectivo', 'SPEI', 'Tarjeta'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setTempPaymentMethod(method);
                            addSystemLog(`Técnico: Configuro método de pago en [${method}]`);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                            tempPaymentMethod === method 
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-black' 
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          {method === 'Tarjeta' ? 'Tarjeta (+4%)' : method}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-1 border-t border-slate-800">
                    <span>Método de pago registrado:</span>
                    <span className="font-extrabold text-emerald-400 font-mono">{activeJob.paymentMethod}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-800/65 text-white">
                  <span>TOTAL A PAGAR:</span>
                  <span className="font-mono text-[#CCA049] text-base">
                    ${activeJob.status === 'Finalizado' ? activeJob.totalPrice : finances.total} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Conformity Signature Board */}
            <div className="space-y-2 text-left" id="signature-block">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
                <Signature className="h-4 w-4" />
                <span>Firma de Conformidad del Cliente</span>
              </p>

              {activeJob.status !== 'Finalizado' ? (
                <div className="bg-white border border-slate-850 rounded-2xl overflow-hidden shadow-inner">
                  {/* Real interactive HTML5 drawing pad */}
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full bg-white touch-none cursor-crosshair h-[140px]"
                    id="tech-signature-pad"
                  />
                  <div className="bg-slate-100 px-3 py-1.5 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[8.5px] text-slate-500 font-bold">Trace su firma sobre el cuadro blanco</span>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[9.5px] font-extrabold text-rose-500 hover:text-rose-600 cursor-pointer"
                    >
                      Limpiar firma
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center min-h-[100px] flex items-center justify-center relative overflow-hidden">
                  {activeJob.signature ? (
                    <img src={activeJob.signature} alt="Firma del cliente" className="max-h-[80px] object-contain invert brightness-200 opacity-90" />
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">No se capturó firma digital para este servicio histórico.</span>
                  )}
                  <span className="absolute bottom-1 right-1 text-[7px] font-bold text-slate-600 tracking-wider">REGISTRADA DIGITALMENTE</span>
                </div>
              )}
            </div>

            {/* Check-off submission button */}
            {activeJob.status !== 'Finalizado' ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinalizeJob}
                  disabled={!hasSignature && !mockPhotoAfter}
                  className="w-full bg-[#CCA049] hover:bg-[#B88E3D] disabled:bg-slate-800 disabled:text-slate-600 text-black font-black py-4 px-4 rounded-2xl transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-center space-x-2 shadow-lg"
                  id="btn-tech-finalize"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>REGISTRAR COBRO Y FINALIZAR</span>
                </button>
                {(!hasSignature || !mockPhotoAfter) && (
                  <p className="text-[8.5px] text-slate-500 font-bold mt-2 text-center">
                    * Requiere firmar el pad de conformidad y tomar la foto "Después" para cerrar.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-emerald-950/20 border border-emerald-900 p-3.5 rounded-xl flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <div className="text-left leading-normal">
                  <h4 className="text-[11px] font-extrabold text-emerald-400 uppercase">Servicio Cerrado y Archivado</h4>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">La orden ha sido sellada. La garantía de {activeJob.warrantyMonths} meses está activa y visible para el cliente.</p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
