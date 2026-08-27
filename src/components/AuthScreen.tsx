import React, { useState } from 'react';
import { betterAuth, type AuthUser } from '../services/betterAuth';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Fingerprint, 
  Boxes, 
  User, 
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'two_factor' | 'passkey'>('signin');
  
  // Form State
  const [email, setEmail] = useState('admin@socialpulse.ai');
  const [password, setPassword] = useState('Admin@SocialPulse2026!');
  const [fullName, setFullName] = useState('Sarah Chen');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // Status & Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await betterAuth.signInWithPassword(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed.');
      return;
    }

    if (result.requires2FA && result.tempAuthUserId) {
      setTempUserId(result.tempAuthUserId);
      setAuthMode('two_factor');
      return;
    }

    if (result.user) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onAuthSuccess(result.user);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await betterAuth.signUp(fullName, email, password);
    setIsLoading(false);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Failed to create account.');
      return;
    }

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onAuthSuccess(result.user);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUserId) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = betterAuth.verify2FACode(tempUserId, twoFactorCode);
    setIsLoading(false);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Invalid 2FA verification code.');
      return;
    }

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onAuthSuccess(result.user);
  };

  const handlePasskeyAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await betterAuth.signInWithPasskey(email);
    setIsLoading(false);

    if (result.success && result.user) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onAuthSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'Passkey verification failed.');
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#00d4a4]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="max-w-md w-full bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d4a4] flex items-center justify-center text-[#0a0a0a] mx-auto shadow-lg shadow-[#00d4a4]/20 font-bold">
            <Boxes className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">SocialPulse AI</h1>
          <p className="text-xs text-neutral-400">
            Secured by <span className="text-[#00d4a4] font-semibold">Better Auth</span> (Argon2id + PKCE Sessions)
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up vs Passkey) */}
        {authMode !== 'two_factor' && (
          <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-xl border border-[#26262a] text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'signin'
                  ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('passkey'); setErrorMessage(null); }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                authMode === 'passkey'
                  ? 'bg-[#00d4a4] text-[#0a0a0a] font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Passkey</span>
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form 1: Sign In */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Agency Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@socialpulse.ai"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-mint w-full flex items-center justify-center space-x-2 py-2.5 font-bold shadow-md shadow-[#00d4a4]/10 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Session...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form 2: Sign Up */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Marcus Vance"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#00d4a4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcus@agency.com"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Password (Minimum 8 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-mint w-full flex items-center justify-center space-x-2 py-2.5 font-bold shadow-md shadow-[#00d4a4]/10 disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register Agency Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form 3: 2FA TOTP Verification */}
        {authMode === 'two_factor' && (
          <form onSubmit={handleVerify2FA} className="space-y-4 text-xs">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/30 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Two-Factor Authentication</h3>
              <p className="text-[11px] text-neutral-400">Enter the 6-digit code from Google Authenticator or 1Password.</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1 text-center">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-2.5 text-center text-lg font-mono-code text-white tracking-widest focus:outline-none focus:border-[#00d4a4]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || twoFactorCode.length !== 6}
              className="btn-mint w-full flex items-center justify-center space-x-2 py-2.5 font-bold shadow-md disabled:opacity-50"
            >
              <span>{isLoading ? 'Validating Code...' : 'Verify & Continue'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setTwoFactorCode(''); setErrorMessage(null); }}
              className="w-full text-center text-neutral-400 hover:text-white text-xs pt-1"
            >
              ← Back to password login
            </button>
          </form>
        )}

        {/* Form 4: Passkey / Biometrics */}
        {authMode === 'passkey' && (
          <div className="space-y-4 text-xs text-center">
            <div className="p-6 bg-[#0a0a0a] border border-[#26262a] rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 mx-auto flex items-center justify-center">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Sign in with Passkey</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Use Touch ID, Face ID, Windows Hello, or YubiKey for instant biometric login.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePasskeyAuth}
                disabled={isLoading}
                className="btn-mint w-full flex items-center justify-center space-x-2 py-2.5 font-bold shadow-sm"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isLoading ? 'Waiting for Biometrics...' : 'Authenticate with Passkey'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Demo Role Selector */}
        <div className="pt-4 border-t border-[#26262a] space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold block text-center">
            Quick Fill Demo Accounts (Better Auth)
          </span>

          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-code">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@socialpulse.ai', 'Admin@SocialPulse2026!')}
              className="p-1.5 rounded-lg bg-[#0a0a0a] border border-[#26262a] hover:border-[#00d4a4]/50 text-neutral-300 hover:text-white truncate"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('manager@apexagency.com', 'Admin@SocialPulse2026!')}
              className="p-1.5 rounded-lg bg-[#0a0a0a] border border-[#26262a] hover:border-[#00d4a4]/50 text-neutral-300 hover:text-white truncate"
            >
              💼 Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('client@nexustech.io', 'Admin@SocialPulse2026!')}
              className="p-1.5 rounded-lg bg-[#0a0a0a] border border-[#26262a] hover:border-[#00d4a4]/50 text-neutral-300 hover:text-white truncate"
            >
              👁️ Viewer
            </button>
          </div>
        </div>

      </div>

      {/* Footer Security Badge */}
      <div className="mt-6 flex items-center space-x-2 text-xs text-neutral-500">
        <ShieldCheck className="w-4 h-4 text-[#00d4a4]" />
        <span>End-to-End Encrypted Session Tokens & Zero-Knowledge Storage</span>
      </div>
    </div>
  );
};
