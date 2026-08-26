import React from 'react';
import type { Client } from '../types';
import { 
  Building2, 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  Globe, 
  Share2,
  Boxes,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  clients: Client[];
  activeClient: Client;
  onSelectClient: (clientId: string) => void;
  activeTab: 'clients' | 'analyzer' | 'planner' | 'studio' | 'publisher';
  setActiveTab: (tab: 'clients' | 'analyzer' | 'planner' | 'studio' | 'publisher') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  clients,
  activeClient,
  onSelectClient,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#26262a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Clean Title */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-md bg-[#00d4a4] flex items-center justify-center text-[#0a0a0a]">
              <Boxes className="w-4 h-4 font-bold" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              SocialPulse AI
            </span>
          </div>

          {/* Active Client Workspace Switcher */}
          <div className="flex items-center space-x-2 bg-[#141416] border border-[#26262a] rounded-full px-3 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#00d4a4]" />
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

          {/* Minimalist Navigation Pills */}
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'clients'
                  ? 'bg-white text-[#0a0a0a] font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Clients Portfolio</span>
            </button>

            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'analyzer'
                  ? 'bg-white text-[#0a0a0a] font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Dashboard & Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'planner'
                  ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>30-Day Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'studio'
                  ? 'bg-white text-[#0a0a0a] font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>AI Visual Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('publisher')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'publisher'
                  ? 'bg-white text-[#0a0a0a] font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publishing Hub</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
