
import React, { useState } from 'react';
import { Room, Resource, MeetingType, Booking } from '../types';
import { ALL_RESOURCES } from '../constants';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface BookingFormProps {
  rooms: Room[];
  onSubmit: (data: any) => { success: boolean, error?: string };
  initialData?: Partial<Booking>;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ rooms, onSubmit, initialData, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    roomId: initialData?.roomId || '',
    date: initialData?.startDateTime ? initialData.startDateTime.split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: initialData?.startDateTime ? initialData.startDateTime.split('T')[1].substring(0, 5) : '09:00',
    endTime: initialData?.endDateTime ? initialData.endDateTime.split('T')[1].substring(0, 5) : '10:00',
    description: initialData?.description || '',
    type: initialData?.type || 'presencial' as MeetingType,
    participants: initialData?.participants?.join(', ') || '',
    resources: initialData?.resourcesRequested || [] as Resource[],
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.title || !formData.roomId || !formData.date || !formData.startTime || !formData.endTime) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    const start = `${formData.date}T${formData.startTime}:00`;
    const end = `${formData.date}T${formData.endTime}:00`;

    if (new Date(start) >= new Date(end)) {
      setError('O horário de término deve ser posterior ao início.');
      return;
    }

    if (new Date(start) < new Date()) {
      setError('Não é possível reservar horários no passado.');
      return;
    }

    const result = onSubmit({
      id: initialData?.id,
      title: formData.title,
      roomId: formData.roomId,
      startDateTime: start,
      endDateTime: end,
      description: formData.description,
      type: formData.type,
      participants: formData.participants.split(',').map(p => p.trim()).filter(p => p),
      resourcesRequested: formData.resources,
    });

    if (!result.success) {
      setError(result.error || 'Ocorreu um erro.');
    } else {
      onClose();
    }
  };

  const toggleResource = (res: Resource) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.includes(res) 
        ? prev.resources.filter(r => r !== res) 
        : [...prev.resources, res]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{initialData?.id ? 'Editar Reserva' : 'Nova Reserva'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título da Reunião *</label>
            <input 
              required
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              placeholder="Ex: Alinhamento de Sprint"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sala *</label>
            <select 
              required
              value={formData.roomId} 
              onChange={e => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione uma sala</option>
              {rooms.filter(r => r.isActive).map(room => (
                <option key={room.id} value={room.id}>{room.name} ({room.capacity} cap.)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Reunião</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({ ...formData, type: e.target.value as MeetingType })}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="híbrida">Híbrida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Data *</label>
            <input 
              required
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Início *</label>
              <input 
                required
                type="time" 
                value={formData.startTime} 
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Término *</label>
              <input 
                required
                type="time" 
                value={formData.endTime} 
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição / Pauta</label>
          <textarea 
            rows={2}
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            placeholder="Pauta da reunião..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Participantes (e-mails separados por vírgula)</label>
          <input 
            type="text" 
            value={formData.participants} 
            onChange={e => setFormData({ ...formData, participants: e.target.value })}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            placeholder="exemplo@empresa.com, outro@empresa.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Recursos Necessários</label>
          <div className="flex flex-wrap gap-2">
            {ALL_RESOURCES.map(res => (
              <button
                key={res}
                type="button"
                onClick={() => toggleResource(res)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  formData.resources.includes(res) 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
          >
            <CheckCircle2 size={18} className="mr-2" />
            {initialData?.id ? 'Salvar Alterações' : 'Confirmar Reserva'}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
