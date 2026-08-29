import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Client, SocialPost } from './types';
import { 
  getClients, 
  getActiveClientId, 
  setActiveClientId, 
  updateClient, 
  deleteClient, 
  updatePostInClient 
} from './services/db';
import { betterAuth, type AuthUser } from './services/betterAuth';
import { AuthScreen } from './components/AuthScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { Navbar } from './components/Navbar';
import { ClientManager } from './components/ClientManager';
import { ClientDashboard, type ClientDashboardTab } from './components/ClientDashboard';
import { SocialAccountConnectModal } from './components/SocialAccountConnectModal';
import { DatabaseBackupModal } from './components/DatabaseBackupModal';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => betterAuth.getSession()?.user || null);
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [activeClientId, setActiveId] = useState<string>(() => getActiveClientId());
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshWorkspaceData = () => {
    const loadedClients = getClients();
    setClients(loadedClients);
    const initialActiveId = getActiveClientId();
    setActiveId(initialActiveId);
  };

  // URL Path Synchronization
  // Routes:
  // /clients -> Clients Directory (Default Landing Page)
  // /dashboard/:clientId/:tab? -> Client Workspace Dashboard
  useEffect(() => {
    // If not authenticated, ensure the URL is clean at /
    if (!currentUser) {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      return;
    }

    if (clients.length === 0) return;

    const path = location.pathname;

    if (path === '/' || path === '') {
      // Default to clients directory
      navigate('/clients', { replace: true });
    } else if (path.startsWith('/dashboard/')) {
      const parts = path.split('/').filter(Boolean);
      const urlClientId = parts[1];
      if (urlClientId && urlClientId !== activeClientId && clients.some(c => c.id === urlClientId)) {
        setActiveId(urlClientId);
        setActiveClientId(urlClientId);
      }
    }
  }, [location.pathname, clients, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
    navigate('/clients', { replace: true });
  };

  const handleSignOut = () => {
    betterAuth.signOut();
    setCurrentUser(null);
    setShowUserProfileModal(false);
    showToast('Signed out of SocialPulse AI.');
    navigate('/', { replace: true });
  };

  const handleSelectClient = (id: string) => {
    setActiveId(id);
    setActiveClientId(id);
    const selected = clients.find(c => c.id === id);
    if (selected) {
      showToast(`Switched active workspace to "${selected.name}"`);
    }
    // Get current tab from URL or default to overview
    const currentTab = getActiveTabFromUrl();
    navigate(`/dashboard/${id}/${currentTab}`);
  };

  const handleSaveClient = (client: Client) => {
    const updatedList = updateClient(client);
    setClients(updatedList);
    setActiveId(client.id);
    setActiveClientId(client.id);
    showToast(`Saved client profile & generated 30-day strategy for "${client.name}"`);
    navigate(`/dashboard/${client.id}/overview`);
  };

  const handleDeleteClient = (id: string) => {
    const clientToDelete = clients.find(c => c.id === id);
    const updatedList = deleteClient(id);
    setClients(updatedList);
    if (updatedList.length > 0) {
      const nextId = updatedList[0].id;
      setActiveId(nextId);
      setActiveClientId(nextId);
      navigate(`/dashboard/${nextId}/overview`);
    } else {
      navigate('/clients');
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

  // Helper to extract active tab from URL: /dashboard/:clientId/:tab
  const getActiveTabFromUrl = (): ClientDashboardTab => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'dashboard' && parts[2]) {
      const tab = parts[2] as ClientDashboardTab;
      if (['overview', 'brand_guide_md', 'planner', 'studio', 'publisher'].includes(tab)) {
        return tab;
      }
    }
    return 'overview';
  };

  const isClientsDirectoryView = location.pathname === '/clients';

  // If user is not authenticated, render Better Auth Gateway
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

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

      {/* User Profile & Security Settings Modal */}
      {showUserProfileModal && (
        <UserProfileModal
          user={currentUser}
          onUpdateUser={setCurrentUser}
          onSignOut={handleSignOut}
          onClose={() => setShowUserProfileModal(false)}
        />
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

      {/* Sleek Global Header Bar with Better Auth Profile */}
      <Navbar
        clients={clients}
        activeClient={activeClient}
        currentUser={currentUser}
        onSelectClient={handleSelectClient}
        onOpenCreateClientModal={() => navigate('/clients')}
        onOpenDatabaseBackupModal={() => setShowBackupModal(true)}
        onOpenUserProfileModal={() => setShowUserProfileModal(true)}
        onViewAllClients={() => navigate('/clients')}
        activeView={isClientsDirectoryView ? 'clients_directory' : 'client_dashboard'}
      />

      {/* Main Workspace Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* View 1: Clients Portfolio Directory (/clients) */}
        {isClientsDirectoryView && (
          <ClientManager
            clients={clients}
            activeClient={activeClient}
            onSelectClient={handleSelectClient}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onOpenDashboard={(id) => {
              handleSelectClient(id);
              navigate(`/dashboard/${id}/overview`);
            }}
            onOpenConnectSocialModal={() => setShowConnectModal(true)}
          />
        )}

        {/* View 2: Active Client Workspace Dashboard with Sub-Tabs (/dashboard/:clientId/:tab) */}
        {!isClientsDirectoryView && (
          <ClientDashboard
            client={activeClient}
            activeTab={getActiveTabFromUrl()}
            onTabChange={(tab) => navigate(`/dashboard/${activeClient.id}/${tab}`)}
            onUpdateClient={handleUpdateActiveClient}
            onUpdatePost={handleUpdatePost}
            onOpenConnectSocialModal={() => setShowConnectModal(true)}
          />
        )}

      </main>
    </div>
  );
}
