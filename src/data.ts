import { Technician, MaterialItem, ServiceJob } from './types';

export const TECHNICIANS: Technician[] = [
  {
    id: 'tech-luis',
    name: 'Ing. Luis Sánchez',
    specialty: 'Electricidad y Aire Acondicionado',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
    status: 'Disponible',
    completedJobs: 142,
    commissionEarned: 24500
  },
  {
    id: 'tech-carlos',
    name: 'Sr. Carlos Mendoza',
    specialty: 'Plomería y Gas LP',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400&q=80',
    status: 'En camino',
    completedJobs: 189,
    commissionEarned: 31200
  },
  {
    id: 'tech-mateo',
    name: 'Sr. Mateo Reyes',
    specialty: 'Herrería y Soldadura',
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    status: 'En servicio',
    completedJobs: 95,
    commissionEarned: 18900
  }
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  { id: 'mat-1', name: 'Tubo de Cobre 1/2\'\' (m)', unit: 'm', stock: 45, unitPrice: 120 },
  { id: 'mat-2', name: 'Cable Eléctrico Calibre 12 (m)', unit: 'm', stock: 120, unitPrice: 18 },
  { id: 'mat-3', name: 'Cinta Teflón Profesional', unit: 'pza', stock: 30, unitPrice: 25 },
  { id: 'mat-4', name: 'Conexión PVC Sanitaria 3/4\'\'', unit: 'pza', stock: 60, unitPrice: 15 },
  { id: 'mat-5', name: 'Soldadura de Estaño (g)', unit: 'g', stock: 500, unitPrice: 2 },
  { id: 'mat-6', name: 'Interruptor Termomagnético 20A', unit: 'pza', stock: 15, unitPrice: 180 },
  { id: 'mat-7', name: 'Válvula de Esfera para Gas 1/2\'\'', unit: 'pza', stock: 12, unitPrice: 220 }
];

export const BASE_PRICES = [
  { category: 'Plomería', price: 350, icon: '🚰' },
  { category: 'Electricidad', price: 400, icon: '⚡' },
  { category: 'Herrería', price: 500, icon: '⛓️' },
  { category: 'Gas', price: 450, icon: '🔥' },
  { category: 'Aire Acondicionado', price: 600, icon: '❄️' },
  { category: 'Otros', price: 300, icon: '🛠️' }
];

export const SURCHARGE_RULES = {
  nightShiftPct: 35, // +35% for night schedule
  urgentFlat: 200,   // +$200 MXN for emergencies
  cardFeePct: 4      // +4% for credit card payments
};

export const INITIAL_JOBS: ServiceJob[] = [
  {
    id: 'job-1',
    clientName: 'Sophia Martinez',
    clientPhone: '555-123-4567',
    clientLocation: 'Calle Paseo de la Reforma 250, CDMX',
    coordinates: { lat: 19.427, lng: -99.167 },
    category: 'Plomería',
    description: 'Fuga de agua importante en la base del fregadero de la cocina. Se requiere cambio de empaques y revisión de tubería de cobre.',
    technicianId: 'tech-carlos',
    technicianName: 'Sr. Carlos Mendoza',
    date: '2026-07-05',
    time: '12:00',
    priority: 'Urgente',
    status: 'En camino',
    basePrice: 350,
    materialsPrice: 0,
    surcharges: 200, // Urgent surcharge
    surchargeReason: 'Servicio Urgente solicitado express',
    totalPrice: 550,
    commissionPct: 30,
    commissionAmount: 165,
    materialsUsed: [],
    warrantyMonths: 3
  },
  {
    id: 'job-2',
    clientName: 'Lucas Williams',
    clientPhone: '555-876-5432',
    clientLocation: 'Colonia Condesa, Calle Michoacán 42',
    coordinates: { lat: 19.412, lng: -99.178 },
    category: 'Electricidad',
    description: 'Cortocircuito en sala de estar tras conectar calefactor. Se quemó el contacto de pared y no hay energía en esa zona.',
    technicianId: 'tech-luis',
    technicianName: 'Ing. Luis Sánchez',
    date: '2026-07-05',
    time: '10:00',
    priority: 'Alta',
    status: 'En servicio',
    basePrice: 400,
    materialsPrice: 180, // 1 interruptor
    surcharges: 0,
    totalPrice: 580,
    commissionPct: 30,
    commissionAmount: 174,
    materialsUsed: [
      { id: 'mat-6', name: 'Interruptor Termomagnético 20A', qty: 1, unitPrice: 180 }
    ],
    photoBefore: 'https://images.unsplash.com/photo-1558223140-d096f4cf9a2a?auto=format&fit=crop&w=300&q=80',
    warrantyMonths: 6
  },
  {
    id: 'job-3',
    clientName: 'Emma Watson',
    clientPhone: '555-999-8888',
    clientLocation: 'Polanco, Av. Horacio 110',
    coordinates: { lat: 19.433, lng: -99.191 },
    category: 'Gas',
    description: 'Mantenimiento preventivo de calefactor de gas de paso y cambio de manguera de alimentación.',
    technicianId: 'tech-carlos',
    technicianName: 'Sr. Carlos Mendoza',
    date: '2026-07-04',
    time: '15:30',
    priority: 'Media',
    status: 'Finalizado',
    basePrice: 450,
    materialsPrice: 220, // 1 valvula
    surcharges: 26.8, // 4% card surcharge
    surchargeReason: 'Comisión por Pago con Tarjeta (4%)',
    totalPrice: 696.8,
    paymentMethod: 'Tarjeta',
    commissionPct: 30,
    commissionAmount: 209,
    materialsUsed: [
      { id: 'mat-7', name: 'Válvula de Esfera para Gas 1/2\'\'', qty: 1, unitPrice: 220 }
    ],
    photoBefore: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=300&q=80',
    photoAfter: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    warrantyMonths: 12,
    expiryDate: '2027-07-04',
    warrantyNotes: 'Garantía extendida por mano de obra y válvula certificada.'
  },
  {
    id: 'job-4',
    clientName: 'Alejandro Ruiz',
    clientPhone: '555-444-3322',
    clientLocation: 'Roma Norte, Calle Colima 120',
    coordinates: { lat: 19.419, lng: -99.160 },
    category: 'Herrería',
    description: 'Ajuste de bisagra vencida en portón principal metálico de cochera y refuerzo de soldadura.',
    priority: 'Baja',
    status: 'Pendiente',
    basePrice: 500,
    materialsPrice: 0,
    surcharges: 0,
    totalPrice: 500,
    commissionPct: 30,
    commissionAmount: 150,
    materialsUsed: [],
    warrantyMonths: 6
  }
];
