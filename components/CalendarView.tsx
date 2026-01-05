
import React, { useState } from 'react';
import { Room, Booking } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarViewProps {
  rooms: Room[];
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNewBookingAt: (date: string, time: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ rooms, bookings, onSelectBooking, onNewBookingAt }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(new Date(currentDate));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 to 20:00

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const getBookingsForDay = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return bookings.filter(b => b.status === 'active' && b.startDateTime.startsWith(dayStr));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800">
          {startOfWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">Hoje</button>
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-0.5">
            <button onClick={prevWeek} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-md transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextWeek} className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-md transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sticky top-0 z-10 bg-white border-b border-gray-100">
            <div className="h-12 border-r border-gray-100"></div>
            {weekDays.map(day => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={day.toISOString()} className="h-12 border-r border-gray-100 flex flex-col items-center justify-center">
                  <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </span>
                  <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full mt-0.5' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] relative">
            {/* Time Labels */}
            <div className="bg-gray-50/30">
              {hours.map(hour => (
                <div key={hour} className="h-20 border-r border-b border-gray-100 text-[10px] text-gray-400 font-bold flex items-start justify-center pt-2">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map(day => (
              <div key={day.toISOString()} className="relative border-r border-gray-100 bg-white">
                {hours.map(hour => (
                  <div 
                    key={hour} 
                    onClick={() => onNewBookingAt(day.toISOString().split('T')[0], `${hour.toString().padStart(2, '0')}:00`)}
                    className="h-20 border-b border-gray-50 hover:bg-blue-50/20 cursor-pointer group transition-colors"
                  >
                     <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-full">
                       <Plus size={14} className="text-blue-400" />
                     </div>
                  </div>
                ))}

                {/* Bookings Overlay */}
                {getBookingsForDay(day).map(booking => {
                  const room = rooms.find(r => r.id === booking.roomId);
                  const startHour = new Date(booking.startDateTime).getHours();
                  const startMin = new Date(booking.startDateTime).getMinutes();
                  const endHour = new Date(booking.endDateTime).getHours();
                  const endMin = new Date(booking.endDateTime).getMinutes();

                  const top = (startHour - 7) * 80 + (startMin / 60) * 80;
                  const height = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60 * 80;

                  return (
                    <div
                      key={booking.id}
                      onClick={(e) => { e.stopPropagation(); onSelectBooking(booking); }}
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        backgroundColor: `${room?.color}20`,
                        borderLeft: `3px solid ${room?.color}`
                      }}
                      className="absolute left-1 right-1 rounded-md p-1.5 overflow-hidden shadow-sm cursor-pointer hover:brightness-95 transition-all z-[5]"
                    >
                      <p className="text-[10px] font-bold truncate" style={{ color: room?.color }}>{booking.title}</p>
                      <p className="text-[9px] font-medium opacity-70" style={{ color: room?.color }}>
                        {new Date(booking.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
