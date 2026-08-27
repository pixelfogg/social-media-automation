import React, { useState } from 'react';
import type { Client, BrandTone } from '../types';
import { 
  Building2, 
  Globe, 
  FileText, 
  Share2, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Sparkles,
  ArrowRight,
  Database,
  Key
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';
import { analyzeBrandAndWebsite } from '../services/aiGenerator';
import { analyzeWebsiteWithGemini } from '../services/geminiService';

interface ClientManagerProps {
  clients: Client[];
  activeClient: Client;
  onSelectClient: (clientId: string) => void;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onOpenDashboard: (clientId: string) => void;
  onOpenConnectSocialModal: () => void;
}

const BRAND_TONES: BrandTone[] = [
  'Professional & Authoritative',
  'Bold, Energetic & Direct',
  'Witty, Trendy & Casual',
  'Empathetic & Warm',
  'Luxury & Minimalist'
];

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  activeClient,
  onSelectClient,
  onSaveClient,
  onDeleteClient,
  onOpenDashboard,
  onOpenConnectSocialModal
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

  const handleOpenCreate = () => {
    setEditingClient({
      id: `client_${Date.now()}`,
      name: '',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      websiteUrl: 'https://',
      industry: 'Technology & Digital Services',
      brandGuideText: 'Enter brand voice, mission, target value proposition, key colors, and style guidelines...',
      tone: 'Professional & Authoritative',
      targetAudience: 'Business leaders, industry professionals, and consumers seeking modern solutions',
      brandColors: ['#00d4a4', '#3772cf', '#0a0a0a'],
      socialAccounts: [],
      createdAt: new Date().toISOString().split('T')[0],
      dailyScheduleEnabled: true,
      dailyScheduleTime: '09:00 AM'
    });
    setShowModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name) return;

    const fullClient: Client = {
      id: editingClient.id || `client_${Date.now()}`,
      name: editingClient.name,
      logoUrl: editingClient.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      websiteUrl: editingClient.websiteUrl || 'https://example.com',
      industry: editingClient.industry || 'Technology & Digital Services',
      brandGuideText: editingClient.brandGuideText || '',
      tone: editingClient.tone || 'Professional & Authoritative',
      targetAudience: editingClient.targetAudience || 'Modern teams and consumers',
      brandColors: editingClient.brandColors || ['#00d4a4', '#3772cf', '#0a0a0a'],
      socialAccounts: editingClient.socialAccounts || [],
      posts: editingClient.posts || [],
      createdAt: editingClient.createdAt || new Date().toISOString().split('T')[0],
      dailyScheduleEnabled: editingClient.dailyScheduleEnabled ?? true,
      dailyScheduleTime: editingClient.dailyScheduleTime || '09:00 AM'
    };

    // Process with Gemini AI for instant authentic brand analysis only
    try {
      fullClient.brandAnalysis = await analyzeWebsiteWithGemini(fullClient);
    } catch (err) {
      if (!fullClient.brandAnalysis) {
        fullClient.brandAnalysis = analyzeBrandAndWebsite(fullClient);
      }
    }

    onSaveClient(fullClient);
    setShowModal(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#00d4a4]" />
              Database Directory
            </span>
            <span className="text-xs text-neutral-400">Multi-Client Agency Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Client Profiles & Social Integrations
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Store and manage client brand guidelines, website URLs, logos, and authorized social media handles in persistent database storage.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenConnectSocialModal}
            className="btn-pill-dark flex items-center space-x-2 px-4 py-2.5 text-xs font-bold"
          >
            <Key className="w-4 h-4 text-[#00d4a4]" />
            <span>Connect Accounts API</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="btn-mint flex items-center space-x-2 px-5 py-2.5 text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Client</span>
          </button>
        </div>
      </div>

      {/* Client Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => {
          const isActive = client.id === activeClient.id;
          return (
            <div
              key={client.id}
              className={`p-6 rounded-2xl border transition-all space-y-5 ${
                isActive
                  ? 'bg-[#141416] border-[#00d4a4] ring-1 ring-[#00d4a4]/40 shadow-lg'
                  : 'bg-[#141416] border-[#26262a] hover:border-[#3f3f46]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#26262a]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white">
                        {client.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/30">
                          Active Workspace
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#00d4a4] font-medium">{client.industry}</p>
                    <a
                      href={client.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-neutral-400 hover:text-white mt-0.5 transition-colors"
                    >
                      <Globe className="w-3 h-3 text-neutral-500" />
                      <span>{client.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteClient(client.id)}
                  disabled={clients.length <= 1}
                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-20"
                  title="Delete Client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Brand Guide & Voice Tone */}
              <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#00d4a4]" />
                    Brand Tone & Voice
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#141416] text-neutral-200 border border-[#26262a]">
                    {client.tone}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {client.brandGuideText}
                </p>
              </div>

              {/* Connected Social Media Accounts & Connect Button */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                    Connected Social Handles
                  </span>
                  <button
                    onClick={() => {
                      onSelectClient(client.id);
                      onOpenConnectSocialModal();
                    }}
                    className="text-[11px] font-bold text-[#00d4a4] hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>+ Connect Handles ({client.socialAccounts.length})</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {client.socialAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center space-x-2 bg-[#0a0a0a] border border-[#26262a] rounded-xl p-2 px-2.5 text-xs"
                    >
                      {getSocialIcon(acc.platform, "w-3.5 h-3.5")}
                      <div className="overflow-hidden">
                        <p className="font-medium text-neutral-200 truncate text-[11px]">{acc.handle}</p>
                        <p className="text-[10px] text-neutral-500">{(acc.followerCount / 1000).toFixed(1)}k followers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-[#26262a]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-neutral-400">Content Queue:</span>
                  <span className="px-2 py-0.5 text-xs font-semibold text-[#00d4a4] bg-[#00d4a4]/10 rounded border border-[#00d4a4]/20">
                    {client.posts.length} Days Ready
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {!isActive && (
                    <button
                      onClick={() => onSelectClient(client.id)}
                      className="btn-pill-dark px-3 py-1.5 text-xs font-semibold"
                    >
                      Select Workspace
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectClient(client.id);
                      onOpenConnectSocialModal();
                    }}
                    className="btn-pill-dark px-3 py-1.5 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Key className="w-3 h-3 text-[#00d4a4]" />
                    <span>Manage APIs</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onSelectClient(client.id);
                      onOpenDashboard(client.id);
                    }}
                    className="btn-mint flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold shadow-sm"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#00d4a4]/10 text-[#00d4a4] rounded-lg border border-[#00d4a4]/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Client Profile</h3>
                  <p className="text-xs text-neutral-400">Specify brand guidelines, tone, and website URL</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Client / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.name || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    placeholder="e.g. Acme SaaS"
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Industry Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.industry || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                    placeholder="e.g. Developer Tools"
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingClient.websiteUrl || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, websiteUrl: e.target.value })}
                    placeholder="https://acmesaas.com"
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Brand Voice Tone *
                  </label>
                  <select
                    value={editingClient.tone || BRAND_TONES[0]}
                    onChange={(e) => setEditingClient({ ...editingClient, tone: e.target.value as BrandTone })}
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4]"
                  >
                    {BRAND_TONES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Brand Guidelines & Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={editingClient.brandGuideText || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, brandGuideText: e.target.value })}
                  placeholder="Paste brand voice rules, key offerings, and target themes..."
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg p-3 text-white focus:outline-none focus:border-[#00d4a4] leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#26262a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-pill-dark px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-mint flex items-center space-x-1.5 px-5 py-2 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
