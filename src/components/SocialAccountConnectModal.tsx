import React, { useState } from 'react';
import type { Client, SocialAccount, SocialPlatform } from '../types';
import { getSocialIcon } from './SocialIcons';
import { 
  CheckCircle2,
  Share2,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Check,
  CheckSquare,
  Square
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

const PLATFORM_OAUTH_PRESETS: Record<SocialPlatform, {
  name: string;
  brandColor: string;
  scopePermissions: string[];
  mockDiscoveredAccounts: (clientName: string) => DiscoveredAccount[];
}> = {
  facebook: {
    name: 'Facebook & Meta Business',
    brandColor: '#1877F2',
    scopePermissions: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'public_profile'],
    mockDiscoveredAccounts: (clientName) => [
      { id: 'fb_page_1', handle: `${clientName.replace(/\s+/g, '')}Official`, name: `${clientName} Verified Page`, followers: 48200, avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', selected: true },
      { id: 'fb_page_2', handle: `${clientName.replace(/\s+/g, '')}GlobalGroup`, name: `${clientName} Community Hub`, followers: 14500, avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80', selected: false }
    ]
  },
  instagram: {
    name: 'Instagram Business & Creator',
    brandColor: '#E4405F',
    scopePermissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_comments'],
    mockDiscoveredAccounts: (clientName) => [
      { id: 'ig_biz_1', handle: `@${clientName.toLowerCase().replace(/\s+/g, '_')}`, name: `${clientName} Instagram Business`, followers: 89300, avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80', selected: true },
      { id: 'ig_biz_2', handle: `@${clientName.toLowerCase().replace(/\s+/g, '_')}_life`, name: `${clientName} Behind-the-Scenes`, followers: 22100, avatarUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop&q=80', selected: false }
    ]
  },
  linkedin: {
    name: 'LinkedIn Organization & Company Page',
    brandColor: '#0A66C2',
    scopePermissions: ['r_organization_social', 'w_organization_social', 'rw_organization_admin'],
    mockDiscoveredAccounts: (clientName) => [
      { id: 'li_org_1', handle: `${clientName.toLowerCase().replace(/\s+/g, '-')}`, name: `${clientName} Corporate Page`, followers: 31200, avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', selected: true },
      { id: 'li_org_2', handle: `${clientName.toLowerCase().replace(/\s+/g, '-')}-careers`, name: `${clientName} Careers & Talent`, followers: 9400, avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=80', selected: false }
    ]
  },
  twitter: {
    name: 'Twitter / X Developer API v2',
    brandColor: '#1DA1F2',
    scopePermissions: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    mockDiscoveredAccounts: (clientName) => [
      { id: 'tw_usr_1', handle: `@${clientName.replace(/\s+/g, '')}AI`, name: `${clientName} Official X Handle`, followers: 18500, avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', selected: true }
    ]
  },
  tiktok: {
    name: 'TikTok for Business & Creators',
    brandColor: '#00f2fe',
    scopePermissions: ['user.info.basic', 'video.publish', 'video.upload'],
    mockDiscoveredAccounts: (clientName) => [
      { id: 'tt_creator_1', handle: `@${clientName.toLowerCase().replace(/\s+/g, '')}`, name: `${clientName} TikTok Official`, followers: 145000, avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80', selected: true }
    ]
  },
  pinterest: {
    name: 'Pinterest Business Catalog',
    brandColor: '#BD081C',
    scopePermissions: ['boards:read', 'pins:read', 'pins:write'],
    mockDiscoveredAccounts: (clientName) => [
      { id: 'pin_biz_1', handle: `${clientName.toLowerCase().replace(/\s+/g, '')}pins`, name: `${clientName} Pinterest Business`, followers: 54300, avatarUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop&q=80', selected: true }
    ]
  }
};

export const SocialAccountConnectModal: React.FC<SocialAccountConnectModalProps> = ({
  client,
  onUpdateClient,
  onClose
}) => {
  const [activeOAuthPlatform, setActiveOAuthPlatform] = useState<SocialPlatform | null>(null);
  const [oauthStep, setOauthStep] = useState<'login' | 'permissions' | 'select_accounts'>('login');
  
  const [loginEmail, setLoginEmail] = useState('agency_admin@marketinghub.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [discoveredAccounts, setDiscoveredAccounts] = useState<DiscoveredAccount[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const connectedAccounts = client.socialAccounts || [];

  const handleStartOAuthFlow = (platform: SocialPlatform) => {
    setActiveOAuthPlatform(platform);
    setOauthStep('login');
    setDiscoveredAccounts(PLATFORM_OAUTH_PRESETS[platform].mockDiscoveredAccounts(client.name));
  };

  const handleAuthenticateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setOauthStep('permissions');
    }, 800);
  };

  const handleGrantPermissions = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setOauthStep('select_accounts');
    }, 800);
  };

  const handleToggleAccountSelection = (accId: string) => {
    setDiscoveredAccounts(prev => prev.map(a => a.id === accId ? { ...a, selected: !a.selected } : a));
  };

  const handleConfirmAndConnectSelected = () => {
    if (!activeOAuthPlatform) return;

    const selectedList = discoveredAccounts.filter(a => a.selected);
    if (selectedList.length === 0) return;

    // Filter out existing accounts of this platform and replace with new selected ones
    const filteredExisting = connectedAccounts.filter(a => a.platform !== activeOAuthPlatform);
    const newlyConnected: SocialAccount[] = selectedList.map(item => ({
      id: item.id,
      platform: activeOAuthPlatform,
      handle: item.handle,
      connected: true,
      followerCount: item.followers,
      avatarUrl: item.avatarUrl,
      pageId: `page_${item.id}`,
      accessToken: `eaag_${Math.random().toString(36).substring(2, 16)}`,
      connectedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      statusMessage: 'OAuth 2.0 Connected (Verified 200 OK)'
    }));

    const updatedAccounts = [...filteredExisting, ...newlyConnected];

    onUpdateClient({
      ...client,
      socialAccounts: updatedAccounts
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setActiveOAuthPlatform(null);
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
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#26262a] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#00d4a4]/10 text-[#00d4a4] rounded-xl border border-[#00d4a4]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">OAuth 2.0 Social Account Picker</h3>
              <p className="text-xs text-neutral-400">Log in to your social accounts and pick pages to link with <span className="text-[#00d4a4] font-semibold">{client.name}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold text-xl px-2"
          >
            ×
          </button>
        </div>

        {/* Step 1: Main Platform OAuth Grid */}
        {!activeOAuthPlatform && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Select Social Network to Authorize & Link Accounts
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(PLATFORM_OAUTH_PRESETS) as SocialPlatform[]).map((plat) => {
                const preset = PLATFORM_OAUTH_PRESETS[plat];
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
                        <div className="p-2 rounded-lg bg-[#141416] border border-[#26262a]">
                          {getSocialIcon(plat, "w-4 h-4 text-white")}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">{preset.name}</h5>
                          <p className="text-[10px] text-neutral-500 font-mono-code">OAuth 2.0 Login</p>
                        </div>
                      </div>

                      {isLinked ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {connectedForPlat.length} Connected
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
                          <div key={acc.id} className="bg-[#141416] border border-[#26262a] rounded-lg p-2 flex items-center justify-between text-xs">
                            <span className="font-mono-code text-white font-semibold text-[11px] truncate">{acc.handle}</span>
                            <span className="text-[10px] text-neutral-400 font-mono-code">{(acc.followerCount / 1000).toFixed(1)}k fans</span>
                          </div>
                        ))}

                        <div className="pt-1 flex items-center justify-between">
                          <button
                            onClick={() => handleDisconnectPlatform(plat)}
                            className="text-rose-400 hover:underline text-[11px] font-medium"
                          >
                            Disconnect Platform
                          </button>
                          <button
                            onClick={() => handleStartOAuthFlow(plat)}
                            className="text-[#00d4a4] hover:underline font-bold text-[11px]"
                          >
                            Re-login & Pick Pages
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartOAuthFlow(plat)}
                        className="btn-mint w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold shadow-sm"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#0a0a0a]" />
                        <span>Log in with {plat.charAt(0).toUpperCase() + plat.slice(1)}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Interactive OAuth Popup Simulation */}
        {activeOAuthPlatform && (
          <div className="bg-[#0a0a0a] border border-[#00d4a4]/40 rounded-2xl p-6 space-y-5 animate-fadeIn">
            
            {/* OAuth Header Bar */}
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#141416] border border-[#26262a]">
                  {getSocialIcon(activeOAuthPlatform, "w-5 h-5")}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {PLATFORM_OAUTH_PRESETS[activeOAuthPlatform].name} Single Sign-On
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono-code">
                    https://auth.{activeOAuthPlatform}.com/oauth/v2/authorize
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveOAuthPlatform(null)}
                className="text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Back to Platforms
              </button>
            </div>

            {/* OAuth Step Indicator */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-400">
              <span className={`px-2.5 py-0.5 rounded-full border ${oauthStep === 'login' ? 'bg-[#00d4a4] text-[#0a0a0a] border-[#00d4a4] font-bold' : 'bg-[#141416] border-[#26262a]'}`}>
                1. Account Login
              </span>
              <span>→</span>
              <span className={`px-2.5 py-0.5 rounded-full border ${oauthStep === 'permissions' ? 'bg-[#00d4a4] text-[#0a0a0a] border-[#00d4a4] font-bold' : 'bg-[#141416] border-[#26262a]'}`}>
                2. Scopes Consent
              </span>
              <span>→</span>
              <span className={`px-2.5 py-0.5 rounded-full border ${oauthStep === 'select_accounts' ? 'bg-[#00d4a4] text-[#0a0a0a] border-[#00d4a4] font-bold' : 'bg-[#141416] border-[#26262a]'}`}>
                3. Select Pages to Link
              </span>
            </div>

            {/* Sub-step A: Account Login Screen */}
            {oauthStep === 'login' && (
              <form onSubmit={handleAuthenticateUser} className="space-y-4 text-xs">
                <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-neutral-300">
                    <UserCheck className="w-4 h-4 text-[#00d4a4]" />
                    <span className="font-bold text-white text-xs">Log in with your existing account</span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Email address / Username
                    </label>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="btn-mint w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  <span>{isAuthenticating ? 'Authenticating...' : `Log in to ${activeOAuthPlatform.toUpperCase()}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Sub-step B: Scope Permissions Consent */}
            {oauthStep === 'permissions' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-white font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#00d4a4]" />
                    <span>SocialPulse AI is requesting the following permissions:</span>
                  </div>

                  <div className="space-y-2">
                    {PLATFORM_OAUTH_PRESETS[activeOAuthPlatform].scopePermissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-neutral-300 font-mono-code text-[11px]">
                        <Check className="w-3.5 h-3.5 text-[#00d4a4]" />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-neutral-400 pt-1">
                    Logged in as <span className="text-white font-bold font-mono-code">{loginEmail}</span>
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setOauthStep('login')}
                    className="btn-pill-dark px-4 py-2 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleGrantPermissions}
                    disabled={isAuthenticating}
                    className="btn-mint px-5 py-2 font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span>{isAuthenticating ? 'Granting...' : 'Grant Permissions & Continue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Sub-step C: Discovered Accounts / Pages Picker */}
            {oauthStep === 'select_accounts' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold">
                    <span>Discovered accounts linked to {loginEmail}:</span>
                    <span className="text-[#00d4a4] font-bold">{discoveredAccounts.filter(a => a.selected).length} selected</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {discoveredAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => handleToggleAccountSelection(acc.id)}
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
                    onClick={() => setActiveOAuthPlatform(null)}
                    className="btn-pill-dark px-4 py-2 font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndConnectSelected}
                    disabled={discoveredAccounts.filter(a => a.selected).length === 0}
                    className="btn-mint px-6 py-2 font-bold shadow-sm disabled:opacity-30"
                  >
                    Confirm & Link Selected ({discoveredAccounts.filter(a => a.selected).length}) to {client.name}
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
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
