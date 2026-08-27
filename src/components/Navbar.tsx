import React from 'react';
import type { Client } from '../types';
import { 
  Building2, 
  Boxes, 
  ChevronDown, 
  Users, 
  Plus,
  Database
} from 'lucide-react';

interface NavbarProps {
  clients: Client[];
  activeClient: Client;
  onSelectClient: (clientId: string) => void;
  onOpenCreateClientModal: () => void;
  onOpenDatabaseBackupModal: () => void;
  onViewAllClients: () => void;
  activeView: 'clients_directory' | 'client_dashboard';
}

export const Navbar: React.FC<NavbarProps> = ({
  clients,
  activeClient,
  onSelectClient,
  onOpenCreateClientModal,
  onOpenDatabaseBackupModal,
  onViewAllClients,
  activeView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#26262a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Brand Name */}
          <div 
            onClick={onViewAllClients}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-[#00d4a4] flex items-center justify-center text-[#0a0a0a] group-hover:scale-105 transition-transform">
              <Boxes className="w-4 h-4 font-bold" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#00d4a4] transition-colors">
              SocialPulse AI
            </span>
          </div>

          {/* Active Client Workspace Switcher */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-[#141416] border border-[#26262a] rounded-full px-3.5 py-1 text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#00d4a4]" />
              <span className="text-[10px] uppercase font-bold text-neutral-500">Workspace:</span>
              <select
                value={activeClient.id}
                onChange={(e) => onSelectClient(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141416] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-500 pointer-events-none" />
            </div>

            {/* Global Actions */}
            <button
              onClick={onOpenDatabaseBackupModal}
              className="p-1.5 rounded-full bg-[#141416] text-neutral-300 hover:text-white border border-[#26262a] transition-colors"
              title="Database Backup & Restore"
            >
              <Database className="w-3.5 h-3.5 text-[#00d4a4]" />
            </button>

            <button
              onClick={onViewAllClients}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeView === 'clients_directory'
                  ? 'bg-white text-[#0a0a0a] font-bold'
                  : 'bg-[#141416] text-neutral-300 hover:text-white border border-[#26262a]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>

            <button
              onClick={onOpenCreateClientModal}
              className="btn-mint px-3.5 py-1.5 text-xs font-bold flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#0a0a0a]" />
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
