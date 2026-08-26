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
import { BrandAnalyzer } from './components/BrandAnalyzer';
import { MonthContentPlanner } from './components/MonthContentPlanner';
import { ImagePromptStudio } from './components/ImagePromptStudio';
import { PublisherQueue } from './components/PublisherQueue';
import { SocialAccountConnectModal } from './components/SocialAccountConnectModal';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'clients' | 'analyzer' | 'planner' | 'studio' | 'publisher'>('clients');
  const [studioPost, setStudioPost] = useState<SocialPost | null>(null);
  const [publisherPost, setPublisherPost] = useState<SocialPost | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedClients = getClients();
    setClients(loadedClients);
    const initialActiveId = getActiveClientId();
    setActiveId(initialActiveId);
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
  };

  const handleSaveClient = (client: Client) => {
    const updatedList = updateClient(client);
    setClients(updatedList);
    setActiveId(client.id);
    setActiveClientId(client.id);
    showToast(`Saved client profile & generated 30-day strategy for "${client.name}"`);
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

      {/* Sleek Minimal Header */}
      <Navbar
        clients={clients}
        activeClient={activeClient}
        onSelectClient={handleSelectClient}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Step 1 & 2: Clients Portfolio & Social Accounts */}
        {activeTab === 'clients' && (
          <ClientManager
            clients={clients}
            activeClient={activeClient}
            onSelectClient={handleSelectClient}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onOpenDashboard={(id) => {
              handleSelectClient(id);
              setActiveTab('analyzer');
            }}
            onOpenConnectSocialModal={() => setShowConnectModal(true)}
          />
        )}

        {/* Step 3: Client Dashboard & Brand Intelligence */}
        {activeTab === 'analyzer' && (
          <BrandAnalyzer
            client={activeClient}
            onUpdateClient={handleUpdateActiveClient}
            onOpenConnectSocialModal={() => setShowConnectModal(true)}
          />
        )}

        {/* Step 4: 30-Day Social Media Content Planner */}
        {activeTab === 'planner' && (
          <MonthContentPlanner
            client={activeClient}
            onUpdateClient={handleUpdateActiveClient}
            onOpenStudioForPost={(post) => {
              setStudioPost(post);
              setActiveTab('studio');
            }}
            onOpenPublisherForPost={(post) => {
              setPublisherPost(post);
              setActiveTab('publisher');
            }}
          />
        )}

        {/* Step 5: AI Visual & Prompt Generator */}
        {activeTab === 'studio' && (
          <ImagePromptStudio
            client={activeClient}
            selectedPost={studioPost}
            onSelectPost={setStudioPost}
            onUpdatePost={handleUpdatePost}
          />
        )}

        {/* Step 6: Instant Publishing & Daily Push Scheduler */}
        {activeTab === 'publisher' && (
          <PublisherQueue
            client={activeClient}
            selectedPost={publisherPost}
            onUpdateClient={handleUpdateActiveClient}
            onUpdatePost={handleUpdatePost}
          />
        )}

      </main>
    </div>
  );
}
