import React, { useState } from 'react';
import type { Client, SocialAccount, SocialPlatform } from '../types';
import { getSocialIcon } from './SocialIcons';
import { 
  CheckCircle2, 
  Share2, 
  Lock, 
  ArrowRight, 
  Check, 
  CheckSquare, 
  Square,
  UserCheck,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialAccountConnectModalProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
  onClose: () => void;
}

interface DiscoveredAccount {
  id: string;
  handle: string;
  name: string;
  followers: number;
  avatarUrl: string;
  selected: boolean;
}

const PLATFORM_PRESETS: Record<SocialPlatform, {
  name: string;
  buttonLabel: string;
  brandColor: string;
  mockAccounts: (clientName: string) => DiscoveredAccount[];
}> = {
  facebook: {
    name: 'Facebook Page',
    buttonLabel: 'Log in with Facebook',
    brandColor: '#1877F2',
    mockAccounts: (clientName) => [
      { id: 'fb_page_1', handle: `${clientName.replace(/\s+/g, '')}Official`, name: `${clientName} Official Page`, followers: 48200, avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', selected: true },
      { id: 'fb_page_2', handle: `${clientName.replace(/\s+/g, '')}Group`, name: `${clientName} Community Hub`, followers: 14500, avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80', selected: false }
    ]
  },
  instagram: {
    name: 'Instagram Business',
    buttonLabel: 'Log in with Instagram',
    brandColor: '#E4405F',
    mockAccounts: (clientName) => [
      { id: 'ig_biz_1', handle: `@${clientName.toLowerCase().replace(/\s+/g, '_')}`, name: `${clientName} Business Profile`, followers: 89300, avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80', selected: true },
      { id: 'ig_biz_2', handle: `@${clientName.toLowerCase().replace(/\s+/g, '_')}_life`, name: `${clientName} Behind the Scenes`, followers: 22100, avatarUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop&q=80', selected: false }
    ]
  },
  linkedin: {
    name: 'LinkedIn Company Page',
    buttonLabel: 'Log in with LinkedIn',
    brandColor: '#0A66C2',
    mockAccounts: (clientName) => [
      { id: 'li_org_1', handle: `${clientName.toLowerCase().replace(/\s+/g, '-')}`, name: `${clientName} Corporate Page`, followers: 31200, avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', selected: true },
      { id: 'li_org_2', handle: `${clientName.toLowerCase().replace(/\s+/g, '-')}-careers`, name: `${clientName} Careers`, followers: 9400, avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80', selected: false }
    ]
  },
  twitter: {
    name: 'Twitter / X Account',
    buttonLabel: 'Log in with Twitter',
    brandColor: '#ffffff',
    mockAccounts: (clientName) => [
      { id: 'tw_usr_1', handle: `@${clientName.replace(/\s+/g, '')}AI`, name: `${clientName} Official X`, followers: 18500, avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', selected: true }
    ]
  },
  tiktok: {
    name: 'TikTok Creator',
    buttonLabel: 'Log in with TikTok',
    brandColor: '#00f2fe',
    mockAccounts: (clientName) => [
      { id: 'tt_creator_1', handle: `@${clientName.toLowerCase().replace(/\s+/g, '')}`, name: `${clientName} TikTok Official`, followers: 145000, avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80', selected: true }
    ]
  },
  pinterest: {
    name: 'Pinterest Business',
    buttonLabel: 'Log in with Pinterest',
    brandColor: '#E60023',
    mockAccounts: (clientName) => [
      { id: 'pin_biz_1', handle: `${clientName.toLowerCase().replace(/\s+/g, '')}pins`, name: `${clientName} Pinterest`, followers: 54300, avatarUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop&q=80', selected: true }
    ]
  }
};

export const SocialAccountConnectModal: React.FC<SocialAccountConnectModalProps> = ({
  client,
  onUpdateClient,
  onClose
}) => {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | null>(null);
  const [step, setStep] = useState<'login' | 'select_page'>('login');
  const [userAccountName] = useState('Alex Mercer (Agency Admin)');
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectedAccounts = client.socialAccounts || [];

  const handleStartConnect = (platform: SocialPlatform) => {
    setActivePlatform(platform);
    setStep('login');
    setDiscoveredPages(PLATFORM_PRESETS[platform].mockAccounts(client.name));
  };

  const handleContinueAsUser = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setStep('select_page');
    }, 500);
  };

  const handleTogglePageSelection = (accId: string) => {
    setDiscoveredPages(prev => prev.map(a => a.id === accId ? { ...a, selected: !a.selected } : a));
  };

  const handleConfirmConnection = () => {
    if (!activePlatform) return;

    const selectedList = discoveredPages.filter(a => a.selected);
    if (selectedList.length === 0) return;

    const filteredExisting = connectedAccounts.filter(a => a.platform !== activePlatform);
    const newlyConnected: SocialAccount[] = selectedList.map(item => ({
      id: item.id,
      platform: activePlatform,
      handle: item.handle,
      connected: true,
      followerCount: item.followers,
      avatarUrl: item.avatarUrl,
      pageId: `page_${item.id}`,
      accessToken: `token_${Math.random().toString(36).substring(2, 12)}`,
      connectedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      statusMessage: 'Connected & Active (Verified)'
    }));

    onUpdateClient({
      ...client,
      socialAccounts: [...filteredExisting, ...newlyConnected]
    });

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setActivePlatform(null);
  };

  const handleDisconnectPlatform = (platform: SocialPlatform) => {
    const updated = connectedAccounts.filter(a => a.platform !== platform);
    onUpdateClient({
      ...client,
      socialAccounts: updated
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#26262a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#00d4a4]/10 text-[#00d4a4] rounded-xl border border-[#00d4a4]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Connect Social Media Accounts</h3>
              <p className="text-xs text-neutral-400">Link social accounts to <span className="text-[#00d4a4] font-semibold">{client.name}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold text-xl px-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simple 1-Click Platform Grid */}
        {!activePlatform && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Choose Platform to Connect
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(PLATFORM_PRESETS) as SocialPlatform[]).map((plat) => {
                const preset = PLATFORM_PRESETS[plat];
                const connectedForPlat = connectedAccounts.filter(a => a.platform === plat);
                const isLinked = connectedForPlat.length > 0;

                return (
                  <div
                    key={plat}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isLinked
                        ? 'bg-[#0a0a0a] border-[#00d4a4]/60 ring-1 ring-[#00d4a4]/20'
                        : 'bg-[#0a0a0a] border-[#26262a] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-[#141416] border border-[#26262a] flex items-center justify-center">
                          {getSocialIcon(plat, "w-5 h-5")}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{preset.name}</h5>
                        </div>
                      </div>

                      {isLinked ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#141416] text-neutral-500 border border-[#26262a]">
                          Not Linked
                        </span>
                      )}
                    </div>

                    {isLinked ? (
                      <div className="space-y-2">
                        {connectedForPlat.map((acc) => (
                          <div key={acc.id} className="bg-[#141416] border border-[#26262a] rounded-lg p-2.5 flex items-center justify-between text-xs">
                            <span className="font-mono-code text-white font-semibold text-[11px] truncate">{acc.handle}</span>
                            <span className="text-[10px] text-[#00d4a4] font-mono-code">{(acc.followerCount / 1000).toFixed(1)}k followers</span>
                          </div>
                        ))}

                        <div className="pt-1 flex items-center justify-between">
                          <button
                            onClick={() => handleDisconnectPlatform(plat)}
                            className="text-rose-400 hover:underline text-[11px] font-medium"
                          >
                            Disconnect
                          </button>
                          <button
                            onClick={() => handleStartConnect(plat)}
                            className="text-[#00d4a4] hover:underline font-bold text-[11px]"
                          >
                            Switch Account
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartConnect(plat)}
                        className="btn-mint w-full flex items-center justify-center space-x-2 py-2 text-xs font-bold shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#0a0a0a]" />
                        <span>{preset.buttonLabel}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Login & Page Picker Card */}
        {activePlatform && (
          <div className="bg-[#0a0a0a] border border-[#00d4a4]/40 rounded-2xl p-6 space-y-5 animate-fadeIn">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#141416] border border-[#26262a]">
                  {getSocialIcon(activePlatform, "w-6 h-6")}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Connect {PLATFORM_PRESETS[activePlatform].name}
                  </h4>
                  <p className="text-xs text-neutral-400">Linking account to <span className="text-[#00d4a4] font-semibold">{client.name}</span></p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePlatform(null)}
                className="text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
            </div>

            {/* Step 1: User Account Login */}
            {step === 'login' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-[#26262a] mx-auto flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-[#00d4a4]" />
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-white text-sm">{userAccountName}</h5>
                    <p className="text-neutral-400 text-xs mt-0.5">Logged in social account manager</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinueAsUser}
                  disabled={isConnecting}
                  className="btn-mint w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  <span>{isConnecting ? 'Connecting...' : `Continue as ${userAccountName.split(' ')[0]}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Select Page to Link */}
            {step === 'select_page' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold">
                    <span>Select page to link to {client.name}:</span>
                    <span className="text-[#00d4a4] font-bold">{discoveredPages.filter(a => a.selected).length} selected</span>
                  </div>

                  <div className="space-y-2">
                    {discoveredPages.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => handleTogglePageSelection(acc.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          acc.selected
                            ? 'bg-[#141416] border-[#00d4a4] ring-1 ring-[#00d4a4]/40'
                            : 'bg-[#141416] border-[#26262a] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img src={acc.avatarUrl} alt={acc.name} className="w-9 h-9 rounded-lg object-cover border border-[#26262a]" />
                          <div>
                            <h5 className="font-bold text-white text-xs">{acc.name}</h5>
                            <p className="text-[10px] text-neutral-400 font-mono-code">{acc.handle} • {(acc.followers / 1000).toFixed(1)}k followers</p>
                          </div>
                        </div>

                        <div>
                          {acc.selected ? (
                            <CheckSquare className="w-5 h-5 text-[#00d4a4]" />
                          ) : (
                            <Square className="w-5 h-5 text-neutral-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#26262a] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActivePlatform(null)}
                    className="btn-pill-dark px-4 py-2 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmConnection}
                    disabled={discoveredPages.filter(a => a.selected).length === 0}
                    className="btn-mint px-6 py-2 font-bold shadow-sm disabled:opacity-30 flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Connect Selected Page</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        <div className="pt-3 border-t border-[#26262a] flex justify-end">
          <button
            onClick={onClose}
            className="btn-mint px-6 py-2 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
