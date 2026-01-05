
import { useState, useEffect, useCallback } from 'react';
import { User, Room, Booking, AppConfig, AuditLog } from '../types';
import { INITIAL_USERS, INITIAL_ROOMS, INITIAL_BOOKINGS, DEFAULT_CONFIG } from '../constants';

const STORAGE_KEYS = {
  USERS: 'rm_users',
  ROOMS: 'rm_rooms',
  BOOKINGS: 'rm_bookings',
  CONFIG: 'rm_config',
  LOGS: 'rm_logs',
  CURRENT_USER: 'rm_current_user'
};

export const useStore = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    if (currentUser) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [users, rooms, bookings, config, logs, currentUser]);

  const addLog = useCallback((action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      details
    };
    setLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  const checkConflict = useCallback((roomId: string, start: string, end: string, excludeId?: string) => {
    const newStart = new Date(start).getTime();
    const newEnd = new Date(end).getTime();

    return bookings.find(b => {
      if (b.status === 'cancelled') return false;
      if (b.roomId !== roomId) return false;
      if (excludeId && b.id === excludeId) return false;

      const exStart = new Date(b.startDateTime).getTime();
      const exEnd = new Date(b.endDateTime).getTime();

      // Rule: start < existingEnd AND end > existingStart
      return newStart < exEnd && newEnd > exStart;
    });
  }, [bookings]);

  const upsertBooking = useCallback((booking: Partial<Booking>) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    const start = booking.startDateTime!;
    const end = booking.endDateTime!;
    const roomId = booking.roomId!;

    const conflict = checkConflict(roomId, start, end, booking.id);
    if (conflict) {
      return { 
        success: false, 
        error: `Conflito de horário com: "${conflict.title}" (${new Date(conflict.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(conflict.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` 
      };
    }

    if (booking.id) {
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, ...booking as Booking, updatedAt: new Date().toISOString() } : b));
      addLog('EDIÇÃO_RESERVA', `Reserva ${booking.id} editada por ${currentUser.name}`);
    } else {
      const newBooking: Booking = {
        ...booking as Booking,
        id: 'b' + Math.random().toString(36).substr(2, 9),
        createdByUserId: currentUser.id,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBookings(prev => [...prev, newBooking]);
      addLog('NOVA_RESERVA', `Nova reserva criada: ${newBooking.title}`);
    }
    return { success: true };
  }, [currentUser, checkConflict, addLog]);

  const cancelBooking = useCallback((id: string, reason: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled', cancelReason: reason, updatedAt: new Date().toISOString() } : b));
    addLog('CANCELAMENTO_RESERVA', `Reserva ${id} cancelada. Motivo: ${reason}`);
  }, [addLog]);

  const upsertRoom = useCallback((room: Partial<Room>) => {
    if (room.id) {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, ...room as Room } : r));
      addLog('EDIÇÃO_SALA', `Sala ${room.name} editada`);
    } else {
      const newRoom: Room = {
        ...room as Room,
        id: 'r' + Math.random().toString(36).substr(2, 9),
        isActive: true
      };
      setRooms(prev => [...prev, newRoom]);
      addLog('NOVA_SALA', `Nova sala criada: ${newRoom.name}`);
    }
  }, [addLog]);

  const deleteRoom = useCallback((id: string) => {
    const hasFutureBookings = bookings.some(b => b.roomId === id && b.status === 'active' && new Date(b.startDateTime) > new Date());
    if (hasFutureBookings) {
      return { success: false, error: 'Não é possível excluir uma sala com reservas futuras ativas. Inative a sala em vez disso.' };
    }
    setRooms(prev => prev.filter(r => r.id !== id));
    addLog('EXCLUSÃO_SALA', `Sala ${id} removida`);
    return { success: true };
  }, [bookings, addLog]);

  return {
    users, rooms, bookings, config, logs, currentUser,
    setCurrentUser, upsertBooking, cancelBooking, upsertRoom, deleteRoom, setConfig
  };
};
