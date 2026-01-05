
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export type Resource = 'TV' | 'Projetor' | 'Quadro Branco' | 'Videoconferência' | 'Ar Condicionado' | 'Café/Água';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  resources: Resource[];
  isActive: boolean;
  color: string;
}

export type BookingStatus = 'active' | 'cancelled';
export type MeetingType = 'presencial' | 'online' | 'híbrida';

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  description: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
  createdByUserId: string;
  participants: string[];
  resourcesRequested: Resource[];
  status: BookingStatus;
  cancelReason?: string;
  type: MeetingType;
  createdAt: string;
  updatedAt: string;
  isRecurring?: boolean;
}

export interface AppConfig {
  openingTime: string; // "07:00"
  closingTime: string; // "19:00"
  defaultDuration: number; // minutes
  minAdvanceTime: number; // minutes
  maxDuration: number; // hours
  allowRecurring: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: string;
}
