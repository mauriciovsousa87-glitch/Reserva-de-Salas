
import React, { useState } from 'react';
import { 
  Calendar, 
  LayoutDashboard, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  Plus, 
  Search, 
  Bell, 
  User as UserIcon,
  BookOpen,
  PieChart
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Reservar Sala', icon: Plus, roles: ['user', 'admin'] },
    { id: 'calendar', label: 'Calendário', icon: Calendar, roles: ['user', 'admin'] },
    { id: 'my-bookings', label: 'Minhas Reservas', icon: BookOpen, roles: ['user', 'admin'] },
    { id: 'admin-rooms', label: 'Gestão de Salas', icon: MapPin, roles: ['admin'] },
    { id: 'admin-rules', label: 'Regras e Políticas', icon: Settings, roles: ['admin'] },
    { id: 'dashboard', label: 'Relatórios', icon: PieChart, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => !currentUser || item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && <span className="text-xl font-bold tracking-tight text-blue-400">ReservaMaster</span>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 hover:bg-slate-800 rounded-lg">
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center p-3 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-slate-800"
          >
            <LogOut size={22} className={isCollapsed ? 'mx-auto' : 'mr-3'} />
            {!isCollapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center flex-1 max-w-lg relative group">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar reservas ou salas..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full w-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 uppercase font-medium">{currentUser?.role === 'admin' ? 'Administrador' : 'Colaborador'}</p>
              </div>
              <img 
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
