
import { Room, User, Booking, AppConfig } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin Silva', email: 'admin@empresa.com', role: 'admin', department: 'TI', avatar: 'https://picsum.photos/seed/admin/100' },
  { id: 'u2', name: 'João Usuário', email: 'joao@empresa.com', role: 'user', department: 'Marketing', avatar: 'https://picsum.photos/seed/user1/100' },
  { id: 'u3', name: 'Maria Souza', email: 'maria@empresa.com', role: 'user', department: 'RH', avatar: 'https://picsum.photos/seed/user2/100' },
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', name: 'Sala São Paulo', capacity: 12, location: '3º Andar - Bloco A', resources: ['TV', 'Videoconferência', 'Ar Condicionado'], isActive: true, color: '#3b82f6' },
  { id: 'r2', name: 'Sala Rio de Janeiro', capacity: 6, location: '2º Andar - Bloco B', resources: ['Projetor', 'Quadro Branco'], isActive: true, color: '#10b981' },
  { id: 'r3', name: 'Auditório Principal', capacity: 50, location: 'Térreo', resources: ['TV', 'Projetor', 'Videoconferência', 'Ar Condicionado', 'Café/Água'], isActive: true, color: '#f59e0b' },
];

const now = new Date();
const today = now.toISOString().split('T')[0];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomId: 'r1',
    title: 'Daily Meeting TI',
    description: 'Sincronização diária da equipe de desenvolvimento.',
    startDateTime: `${today}T09:00:00`,
    endDateTime: `${today}T10:00:00`,
    createdByUserId: 'u1',
    participants: ['admin@empresa.com', 'dev1@empresa.com'],
    resourcesRequested: ['TV'],
    status: 'active',
    type: 'presencial',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  },
  {
    id: 'b2',
    roomId: 'r2',
    title: 'Entrevistas RH',
    description: 'Processo seletivo Novos Talentos.',
    startDateTime: `${today}T14:00:00`,
    endDateTime: `${today}T15:30:00`,
    createdByUserId: 'u3',
    participants: ['maria@empresa.com', 'candidato@email.com'],
    resourcesRequested: ['Quadro Branco'],
    status: 'active',
    type: 'híbrida',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  openingTime: '07:00',
  closingTime: '20:00',
  defaultDuration: 60,
  minAdvanceTime: 15,
  maxDuration: 4,
  allowRecurring: true
};

export const ALL_RESOURCES: Room['resources'] = ['TV', 'Projetor', 'Quadro Branco', 'Videoconferência', 'Ar Condicionado', 'Café/Água'];
