import { useState, useEffect } from 'react';
import type { Client, SocialPost } from './types';
import { 
  getClients, 
  getActiveClientId, 
  setActiveClientId, 
  updateClient, 
  deleteClient, 
  updatePostInClient 
} from './services/db';
import { Navbar } from './components/Navbar';
import { ClientManager } from './components/ClientManager';
import { ClientDashboard } from './components/ClientDashboard';
import { SocialAccountConnectModal } from './components/SocialAccountConnectModal';
import { DatabaseBackupModal } from './components/DatabaseBackupModal';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveId] = useState<string>('');
  const [activeView, setActiveView] = useState<'clients_directory' | 'client_dashboard'>('client_dashboard');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshWorkspaceData = () => {
    const loadedClients = getClients();
    setClients(loadedClients);
    const initialActiveId = getActiveClientId();
    setActiveId(initialActiveId);
  };

  useEffect(() => {
    refreshWorkspaceData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectClient = (id: string) => {
    setActiveId(id);
    setActiveClientId(id);
    const selected = clients.find(c => c.id === id);
    if (selected) {
      showToast(`Switched active workspace to "${selected.name}"`);
    }
    setActiveView('client_dashboard');
  };

  const handleSaveClient = (client: Client) => {
    const updatedList = updateClient(client);
    setClients(updatedList);
    setActiveId(client.id);
    setActiveClientId(client.id);
    showToast(`Saved client profile & generated 30-day strategy for "${client.name}"`);
    setActiveView('client_dashboard');
  };

  const handleDeleteClient = (id: string) => {
    const clientToDelete = clients.find(c => c.id === id);
    const updatedList = deleteClient(id);
    setClients(updatedList);
    if (updatedList.length > 0) {
      const nextId = updatedList[0].id;
      setActiveId(nextId);
      setActiveClientId(nextId);
    }
    if (clientToDelete) {
      showToast(`Deleted client "${clientToDelete.name}" from database.`);
    }
  };

  const handleUpdateActiveClient = (updatedClient: Client) => {
    const updatedList = updateClient(updatedClient);
    setClients(updatedList);
    showToast(`Updated strategy for "${updatedClient.name}"`);
  };

  const handleUpdatePost = (updatedPost: SocialPost) => {
    if (!activeClientId) return;
    const updatedList = updatePostInClient(activeClientId, updatedPost);
    setClients(updatedList);
    showToast(`Updated Post Day ${updatedPost.dayNumber}`);
  };

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0];

  if (!activeClient) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center text-white space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#00d4a4] animate-spin mx-auto" />
          <p className="text-neutral-400 text-sm font-semibold">Initializing SocialPulse AI Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased selection:bg-[#00d4a4] selection:text-[#0a0a0a] pb-20">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-[#141416] border border-[#00d4a4]/50 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#00d4a4] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Social Account Connect & Authorization Modal */}
      {showConnectModal && (
        <SocialAccountConnectModal
          client={activeClient}
          onUpdateClient={handleUpdateActiveClient}
          onClose={() => setShowConnectModal(false)}
        />
      )}

      {/* Database Backup & Restore Modal */}
      {showBackupModal && (
        <DatabaseBackupModal
          onClose={() => setShowBackupModal(false)}
          onRefreshWorkspace={refreshWorkspaceData}
        />
      )}

      {/* Sleek Global Header Bar */}
      <Navbar
        clients={clients}
        activeClient={activeClient}
        onSelectClient={handleSelectClient}
        onOpenCreateClientModal={() => setActiveView('clients_directory')}
        onOpenDatabaseBackupModal={() => setShowBackupModal(true)}
        onViewAllClients={() => setActiveView('clients_directory')}
        activeView={activeView}
      />

      {/* Main Workspace Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* View 1: Clients Portfolio Directory */}
        {activeView === 'clients_directory' && (
          <ClientManager
            clients={clients}
            activeClient={activeClient}
            onSelectClient={handleSelectClient}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onOpenDashboard={(id) => {
              handleSelectClient(id);
              setActiveView('client_dashboard');
            }}
            onOpenConnectSocialModal={() => setShowConnectModal(true)}
          />
        )}

        {/* View 2: Active Client Workspace Dashboard with Sub-Tabs */}
        {activeView === 'client_dashboard' && (
          <ClientDashboard
            client={activeClient}
            onUpdateClient={handleUpdateActiveClient}
            onUpdatePost={handleUpdatePost}
            onOpenConnectSocialModal={() => setShowConnectModal(true)}
          />
        )}

      </main>
    </div>
  );
}
