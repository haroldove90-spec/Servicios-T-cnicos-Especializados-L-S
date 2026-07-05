export interface Technician {
  id: string;
  name: string;
  specialty: string; // e.g., "Plomería", "Electricidad"
  rating: number;
  avatar: string;
  status: 'Disponible' | 'En camino' | 'En servicio' | 'Inactivo';
  completedJobs: number;
  commissionEarned: number;
}

export interface MenuItem {
  id: string;
  label: string;
  iconName: string;
  color: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  unitPrice: number;
}

export interface ServiceJob {
  id: string;
  clientName: string;
  clientPhone: string;
  clientLocation: string; // address or coordinates
  coordinates?: { lat: number; lng: number };
  category: 'Plomería' | 'Electricidad' | 'Herrería' | 'Gas' | 'Aire Acondicionado' | 'Otros';
  description: string;
  technicianId?: string;
  technicianName?: string;
  date?: string;
  time?: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  status: 'Pendiente' | 'Asignado' | 'En camino' | 'En servicio' | 'Finalizado' | 'Cancelado';
  
  // Financial breakdown
  basePrice: number;
  materialsPrice: number;
  surcharges: number; // e.g., night shift, emergency charge
  surchargeReason?: string;
  totalPrice: number;
  paymentMethod?: 'Efectivo' | 'SPEI' | 'Tarjeta';
  
  // Commission calculation
  commissionPct: number; // e.g. 30% for the technician
  commissionAmount: number;

  // Evidencia
  photoBefore?: string;
  photoAfter?: string;
  materialsUsed: { id: string; name: string; qty: number; unitPrice: number }[];
  signature?: string; // canvas signature data URL
  
  // Warranty
  warrantyMonths: number;
  warrantyNotes?: string;
  expiryDate?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type UserRole = 'admin' | 'technician' | 'client';
