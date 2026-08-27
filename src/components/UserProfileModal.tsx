import React, { useState } from 'react';
import { betterAuth, type AuthUser, type UserSession } from '../services/betterAuth';
import { getGeminiApiKey, saveGeminiApiKey } from '../services/geminiService';
import { 
  Smartphone, 
  Laptop, 
  LogOut, 
  X, 
  QrCode,
  Trash2,
  Sparkles,
  Key,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  user: AuthUser;
  onUpdateUser: (updatedUser: AuthUser) => void;
  onSignOut: () => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'gemini_api' | 'sessions'>('profile');
  const [twoFactorActive, setTwoFactorActive] = useState(user.twoFactorEnabled);
  const [sessions, setSessions] = useState<UserSession[]>(betterAuth.getUserSessions(user.id));
  const [copiedKey, setCopiedKey] = useState(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(getGeminiApiKey());
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleToggle2FA = () => {
    const nextState = !twoFactorActive;
    setTwoFactorActive(nextState);
    betterAuth.toggleTwoFactor(user.id, nextState);
    onUpdateUser({
      ...user,
      twoFactorEnabled: nextState
    });

    if (nextState) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    betterAuth.revokeSession(sessionId);
    setSessions(betterAuth.getUserSessions(user.id));
  };

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(geminiApiKeyInput);
    setApiKeySaved(true);
    confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#26262a] pb-4">
          <div className="flex items-center space-x-3">
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#00d4a4]/40" />
            <div>
              <h3 className="text-base font-bold text-white">{user.name}</h3>
              <p className="text-xs text-neutral-400 font-mono-code">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white font-bold text-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-xl border border-[#26262a] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gemini_api')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'gemini_api'
                ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Gemini AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'security'
                ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            2FA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'sessions'
                ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sessions ({sessions.length})
          </button>
        </div>

        {/* Tab 1: Profile & RBAC */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Assigned RBAC Role:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00d4a4]/10 text-[#00d4a4] font-mono-code font-bold uppercase border border-[#00d4a4]/30">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Account ID:</span>
                <span className="font-mono-code text-neutral-300">{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Created:</span>
                <span className="font-mono-code text-neutral-300">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of SocialPulse AI</span>
              </button>

              <button onClick={onClose} className="btn-mint px-5 py-2 font-bold">
                Done
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Gemini AI Key Configuration */}
        {activeTab === 'gemini_api' && (
          <form onSubmit={handleSaveApiKey} className="space-y-4 text-xs">
            <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Sparkles className="w-4 h-4 text-[#00d4a4]" />
                <span>Google Gemini AI Engine</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Powers real-time website crawling, authentic brand voice discovery, DESIGN.md generation, and 30-day viral content writing.
              </p>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                  Active Gemini API Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={geminiApiKeyInput}
                    onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                    placeholder="AQ.Ab8RN6KU..."
                    className="w-full bg-[#141416] border border-[#26262a] rounded-lg pl-9 pr-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>
              </div>

              {apiKeySaved && (
                <div className="flex items-center space-x-2 text-[#00d4a4] font-mono-code text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Gemini API Key saved and active!</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button type="submit" className="btn-mint px-5 py-2 font-bold">
                Save API Key
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: 2FA & TOTP Authenticator */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-[#00d4a4]" />
                  <div>
                    <h5 className="font-bold text-white text-xs">Two-Factor Authentication (TOTP)</h5>
                    <p className="text-[10px] text-neutral-400">Require an authenticator app code during sign-in</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                    twoFactorActive
                      ? 'bg-[#00d4a4] text-[#0a0a0a] border-[#00d4a4]'
                      : 'bg-[#141416] text-neutral-400 border-[#26262a]'
                  }`}
                >
                  {twoFactorActive ? 'Enabled ✓' : 'Disabled'}
                </button>
              </div>

              {twoFactorActive && (
                <div className="pt-3 border-t border-[#26262a] space-y-3">
                  <div className="flex items-center space-x-3 bg-[#141416] p-3 rounded-lg border border-[#26262a]">
                    <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-black" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-neutral-400 block font-bold uppercase">Manual Setup Key:</span>
                      <span className="font-mono-code font-bold text-[#00d4a4] text-xs">JBSW Y3DP EHPK 3PXP</span>
                      <button
                        type="button"
                        onClick={handleCopySecretKey}
                        className="text-[10px] text-neutral-400 hover:text-white underline block"
                      >
                        {copiedKey ? 'Key Copied!' : 'Copy Secret Key'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="btn-mint px-5 py-2 font-bold">
                Save & Close
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <Laptop className="w-4 h-4 text-[#00d4a4]" />
                    <div>
                      <h5 className="font-bold text-white text-xs">{sess.deviceLabel}</h5>
                      <p className="text-[10px] text-neutral-400 font-mono-code">{sess.ipAddress} • {sess.userAgent}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="text-rose-400 hover:text-rose-300 p-1.5"
                    title="Revoke Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="btn-mint px-5 py-2 font-bold">
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
