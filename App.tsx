
import React, { useState } from 'react';
import Layout from './components/Layout';
import BookingForm from './components/BookingForm';
import CalendarView from './components/CalendarView';
import Dashboard from './pages/Dashboard';
import { useStore } from './store/useStore';
import { Room, Booking, Resource, User } from './types';
import { MapPin, Users, Calendar as CalendarIcon, Clock, Trash2, Edit3, XCircle, Info, FileDown, Plus } from 'lucide-react';

const App: React.FC = () => {
  const { 
    rooms, bookings, currentUser, upsertBooking, cancelBooking, upsertRoom, deleteRoom, setConfig 
  } = useStore();

  const [activeTab, setActiveTab] = useState('calendar');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingPrefill, setBookingPrefill] = useState<Partial<Booking>>({});

  const handleNewBooking = (date?: string, time?: string) => {
    setBookingPrefill({
      startDateTime: date && time ? `${date}T${time}:00` : undefined
    });
    setSelectedBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (selectedBooking && cancelReason) {
      cancelBooking(selectedBooking.id, cancelReason);
      setIsCancelModalOpen(false);
      setCancelReason('');
      setSelectedBooking(null);
    }
  };

  const exportBookingsCSV = () => {
    const header = "ID;Sala;Título;Início;Fim;Status;Motivo\n";
    const rows = bookings.map(b => {
      const room = rooms.find(r => r.id === b.roomId)?.name;
      return `${b.id};${room};${b.title};${b.startDateTime};${b.endDateTime};${b.status};${b.cancelReason || ''}`;
    }).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas.csv';
    a.click();
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto py-10">
       <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Bem-vindo, {currentUser?.name}!</h1>
          <p className="text-gray-500 text-lg">Pronto para reservar sua próxima reunião?</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
             <div className="p-5 bg-blue-600 text-white rounded-2xl mb-6 shadow-lg shadow-blue-200">
                <CalendarIcon size={40} />
             </div>
             <h3 className="text-2xl font-bold text-gray-800 mb-3">Reserva Rápida</h3>
             <p className="text-gray-500 mb-8 leading-relaxed">Escolha a sala, o horário e garanta seu espaço em poucos segundos.</p>
             <button 
               onClick={() => handleNewBooking()}
               className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center"
             >
                <Plus size={20} className="mr-2" />
                Nova Reserva
             </button>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
             <div className="p-5 bg-gray-100 text-gray-700 rounded-2xl mb-6">
                <Info size={40} />
             </div>
             <h3 className="text-2xl font-bold text-gray-800 mb-3">Minhas Reservas</h3>
             <p className="text-gray-500 mb-8 leading-relaxed">Visualize, edite ou cancele as reuniões que você já agendou.</p>
             <button 
                onClick={() => setActiveTab('my-bookings')}
                className="mt-auto w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
             >
                Ver Minha Agenda
             </button>
          </div>
       </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda Corporativa</h1>
            <p className="text-sm text-gray-500">Consulte a disponibilidade de todas as salas</p>
          </div>
          <button 
            onClick={() => handleNewBooking()}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            <Plus size={18} className="mr-2" />
            Reservar Agora
          </button>
       </div>
       <div className="flex-1 min-h-[500px]">
          <CalendarView 
            rooms={rooms} 
            bookings={bookings} 
            onSelectBooking={handleEditBooking}
            onNewBookingAt={handleNewBooking}
          />
       </div>
    </div>
  );

  const renderMyBookings = () => {
    const userBookings = bookings.filter(b => b.createdByUserId === currentUser?.id || currentUser?.role === 'admin').sort((a,b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
           <div>
             <h1 className="text-2xl font-bold text-gray-900">Gerenciar Reservas</h1>
             <p className="text-sm text-gray-500">{currentUser?.role === 'admin' ? 'Visualizando todas as reservas (Admin)' : 'Suas reuniões agendadas'}</p>
           </div>
           <button 
             onClick={exportBookingsCSV}
             className="flex items-center px-4 py-2 text-gray-600 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
           >
             <FileDown size={18} className="mr-2" />
             Exportar CSV
           </button>
        </div>

        {userBookings.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-300 text-center">
             <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <CalendarIcon size={32} />
             </div>
             <p className="text-gray-500 font-medium">Nenhuma reserva encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {userBookings.map(booking => {
               const room = rooms.find(r => r.id === booking.roomId);
               const isPast = new Date(booking.endDateTime) < new Date();
               const isCancelled = booking.status === 'cancelled';

               return (
                 <div key={booking.id} className={`bg-white rounded-2xl border ${isCancelled ? 'border-red-100 opacity-75' : 'border-gray-100'} shadow-sm p-6 relative overflow-hidden flex flex-col`}>
                    <div className="flex items-start justify-between mb-4">
                       <div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${isCancelled ? 'bg-red-50 text-red-500' : isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-600'}`}>
                             {isCancelled ? 'Cancelada' : isPast ? 'Encerrada' : 'Confirmada'}
                          </span>
                          <h3 className="font-bold text-gray-900 mt-2 text-lg line-clamp-1">{booking.title}</h3>
                       </div>
                       {room && <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: room.color }}></div>}
                    </div>

                    <div className="space-y-2 text-sm text-gray-500 mb-6">
                       <div className="flex items-center"><MapPin size={14} className="mr-2" /> {room?.name || 'Sala excluída'}</div>
                       <div className="flex items-center"><CalendarIcon size={14} className="mr-2" /> {new Date(booking.startDateTime).toLocaleDateString()}</div>
                       <div className="flex items-center"><Clock size={14} className="mr-2" /> {new Date(booking.startDateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(booking.endDateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                       <div className="flex items-center capitalize"><Info size={14} className="mr-2" /> {booking.type}</div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                       <div className="flex -space-x-2">
                          {booking.participants.slice(0, 3).map((p, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                               {p.charAt(0)}
                            </div>
                          ))}
                          {booking.participants.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                               +{booking.participants.length - 3}
                            </div>
                          )}
                       </div>
                       
                       <div className="flex space-x-1">
                          {!isCancelled && !isPast && (
                            <>
                              <button onClick={() => handleEditBooking(booking)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                <Edit3 size={18} />
                              </button>
                              <button onClick={() => handleCancelClick(booking)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Cancelar">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    );
  };

  const renderAdminRooms = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Salas</h1>
            <p className="text-sm text-gray-500">Cadastre e configure os espaços físicos da empresa</p>
          </div>
          <button 
            onClick={() => { setSelectedRoom(null); setIsRoomModalOpen(true); }}
            className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            <Plus size={18} className="mr-2" />
            Nova Sala
          </button>
       </div>

       <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome da Sala</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Capacidade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Localização</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: room.color }}></div>
                      <span className="font-semibold text-gray-900">{room.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{room.capacity} pessoas</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{room.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${room.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {room.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                       <button onClick={() => { setSelectedRoom(room); setIsRoomModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit3 size={18} />
                       </button>
                       <button onClick={() => deleteRoom(room.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => window.location.reload()}>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'calendar' && renderCalendar()}
      {activeTab === 'my-bookings' && renderMyBookings()}
      {activeTab === 'admin-rooms' && renderAdminRooms()}
      {activeTab === 'dashboard' && <Dashboard rooms={rooms} bookings={bookings} users={[]} />}
      {activeTab === 'admin-rules' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
           <h1 className="text-2xl font-bold text-gray-900 mb-6">Políticas Globais</h1>
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Início do Expediente</label>
                    <input type="time" defaultValue="07:00" className="w-full border-gray-300 rounded-lg" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fim do Expediente</label>
                    <input type="time" defaultValue="20:00" className="w-full border-gray-300 rounded-lg" />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Duração Máxima (horas)</label>
                 <input type="number" defaultValue="4" className="w-full border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                 <div>
                    <p className="font-bold text-gray-800">Reservas Recorrentes</p>
                    <p className="text-sm text-gray-500">Permitir que usuários criem agendamentos semanais</p>
                 </div>
                 <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                 </div>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100">Salvar Configurações</button>
           </div>
        </div>
      )}

      {/* Modals */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <BookingForm 
            rooms={rooms} 
            onSubmit={upsertBooking} 
            onClose={() => setIsBookingModalOpen(false)}
            initialData={selectedBooking || bookingPrefill}
           />
        </div>
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Cancelar Reserva?</h2>
             <p className="text-gray-500 text-center mb-6">Esta ação não pode ser desfeita. Por favor, informe o motivo do cancelamento:</p>
             <textarea 
               value={cancelReason}
               onChange={e => setCancelReason(e.target.value)}
               placeholder="Motivo obrigatório..."
               className="w-full border-gray-300 rounded-xl mb-6 p-3 focus:ring-red-500 focus:border-red-500"
               rows={3}
             />
             <div className="flex space-x-3">
                <button 
                  onClick={confirmCancel}
                  disabled={!cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-100 transition-all"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                >
                  Voltar
                </button>
             </div>
          </div>
        </div>
      )}

      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full">
              <h2 className="text-xl font-bold text-gray-800 mb-6">{selectedRoom ? 'Editar Sala' : 'Nova Sala'}</h2>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Sala</label>
                    <input type="text" className="w-full border-gray-300 rounded-lg" defaultValue={selectedRoom?.name} id="room-name" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Capacidade</label>
                      <input type="number" className="w-full border-gray-300 rounded-lg" defaultValue={selectedRoom?.capacity || 10} id="room-cap" />
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cor no Calendário</label>
                      <input type="color" className="w-full h-10 border-gray-300 rounded-lg" defaultValue={selectedRoom?.color || '#3b82f6'} id="room-color" />
                   </div>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Localização</label>
                    <input type="text" className="w-full border-gray-300 rounded-lg" defaultValue={selectedRoom?.location} id="room-loc" placeholder="Andar / Bloco" />
                 </div>
                 <div className="pt-4 flex space-x-3">
                    <button 
                      onClick={() => {
                        const name = (document.getElementById('room-name') as HTMLInputElement).value;
                        const capacity = parseInt((document.getElementById('room-cap') as HTMLInputElement).value);
                        const location = (document.getElementById('room-loc') as HTMLInputElement).value;
                        const color = (document.getElementById('room-color') as HTMLInputElement).value;
                        upsertRoom({ id: selectedRoom?.id, name, capacity, location, color, resources: [] });
                        setIsRoomModalOpen(false);
                      }}
                      className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100"
                    >
                      Salvar
                    </button>
                    <button onClick={() => setIsRoomModalOpen(false)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancelar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
