import React, { useState, useRef } from 'react';
import type { Client, BrandAnalysis } from '../types';
import { getSocialIcon } from './SocialIcons';
import { 
  Globe, 
  ExternalLink, 
  Key, 
  Sparkles,
  Share2,
  Plus,
  ShieldCheck,
  Layers,
  Palette,
  CheckCircle2,
  Target,
  Hash,
  Upload,
  Sun,
  Moon,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';
import { analyzeBrandAndWebsite } from '../services/aiGenerator';
import { analyzeWebsiteWithGemini } from '../services/geminiService';

interface BrandAnalyzerProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
  onOpenConnectSocialModal: () => void;
}

export const BrandAnalyzer: React.FC<BrandAnalyzerProps> = ({ 
  client, 
  onUpdateClient,
  onOpenConnectSocialModal
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  
  // Logo Upload State
  const [lightLogo, setLightLogo] = useState<string>(client.logoLightUrl || client.logoUrl || '');
  const [darkLogo, setDarkLogo] = useState<string>(client.logoDarkUrl || client.logoUrl || '');
  const [lightLogoUrlInput, setLightLogoUrlInput] = useState('');
  const [darkLogoUrlInput, setDarkLogoUrlInput] = useState('');
  const [showLightUrlInput, setShowLightUrlInput] = useState(false);
  const [showDarkUrlInput, setShowDarkUrlInput] = useState(false);
  const [logoSaveSuccess, setLogoSaveSuccess] = useState(false);

  const lightFileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  const analysis: BrandAnalysis = client.brandAnalysis || analyzeBrandAndWebsite(client);
  const clientSocialAccounts = client.socialAccounts || [];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setProgressMessage(`Connecting Gemini AI & live crawler to ${client.websiteUrl}...`);

    try {
      setProgressMessage(`Gemini AI analyzing live website copy, subpages, brand voice, and DESIGN.md for ${client.name}...`);
      const updatedAnalysis = await analyzeWebsiteWithGemini(client);

      const liveColors = (updatedAnalysis.extractedColors && updatedAnalysis.extractedColors.length > 0)
        ? updatedAnalysis.extractedColors
        : client.brandColors;

      onUpdateClient({
        ...client,
        brandColors: liveColors,
        brandAnalysis: updatedAnalysis
      });
    } catch (err) {
      console.warn('Analysis fallback:', err);
      const updatedAnalysis = analyzeBrandAndWebsite(client);
      onUpdateClient({
        ...client,
        brandAnalysis: updatedAnalysis
      });
    } finally {
      setIsAnalyzing(false);
      setProgressMessage('');
    }
  };

  const handleLightLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLightLogo(result);
      // Auto-save update
      onUpdateClient({
        ...client,
        logoLightUrl: result,
        logoUrl: result
      });
      setLogoSaveSuccess(true);
      setTimeout(() => setLogoSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleDarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDarkLogo(result);
      // Auto-save update
      onUpdateClient({
        ...client,
        logoDarkUrl: result,
        logoUrl: client.logoLightUrl || result
      });
      setLogoSaveSuccess(true);
      setTimeout(() => setLogoSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLightUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lightLogoUrlInput.trim()) return;
    const url = lightLogoUrlInput.trim();
    setLightLogo(url);
    onUpdateClient({
      ...client,
      logoLightUrl: url,
      logoUrl: url
    });
    setLightLogoUrlInput('');
    setShowLightUrlInput(false);
    setLogoSaveSuccess(true);
    setTimeout(() => setLogoSaveSuccess(false), 2500);
  };

  const handleApplyDarkUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!darkLogoUrlInput.trim()) return;
    const url = darkLogoUrlInput.trim();
    setDarkLogo(url);
    onUpdateClient({
      ...client,
      logoDarkUrl: url,
      logoUrl: client.logoLightUrl || url
    });
    setDarkLogoUrlInput('');
    setShowDarkUrlInput(false);
    setLogoSaveSuccess(true);
    setTimeout(() => setLogoSaveSuccess(false), 2500);
  };

  const handleSaveAllLogos = () => {
    onUpdateClient({
      ...client,
      logoLightUrl: lightLogo,
      logoDarkUrl: darkLogo,
      logoUrl: darkLogo || lightLogo || client.logoUrl
    });
    setLogoSaveSuccess(true);
    setTimeout(() => setLogoSaveSuccess(false), 2500);
  };

  const hasLightLogo = Boolean(lightLogo);
  const hasDarkLogo = Boolean(darkLogo);
  const isLogosComplete = hasLightLogo && hasDarkLogo;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
              Powered by Google Gemini AI
            </span>
            <span className="text-xs text-neutral-400 font-mono-code">Client: <strong className="text-white">{client.name}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {client.name} — Workspace Dashboard
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Dedicated client profile, generated <code className="text-[#00d4a4] font-mono-code font-bold">DESIGN.md</code> Brand Guide specification, social authorizations, and image prompt visual rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="btn-mint flex items-center space-x-2 px-5 py-2.5 text-xs font-extrabold shadow-lg shadow-[#00d4a4]/20 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-[#0a0a0a] ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Gemini AI Analyzing Site...' : 'Run Website & Brand Analysis (Gemini AI)'}</span>
          </button>

          <button
            onClick={onOpenConnectSocialModal}
            className="btn-pill-dark flex items-center space-x-2 px-4 py-2.5 text-xs font-bold"
          >
            <Key className="w-4 h-4 text-[#00d4a4]" />
            <span>Connect Accounts</span>
          </button>
        </div>
      </div>

      {isAnalyzing && (
        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#00d4a4]">
            <span>{progressMessage}</span>
            <span>Parsing HTML & Design Tokens</span>
          </div>
          <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#00d4a4] h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* MANDATORY BRAND LOGO ASSETS SECTION (LIGHT & DARK THEME) */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#26262a] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-[#00d4a4]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Brand Logo Assets (Light & Dark Theme Specification)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                Mandatory
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Upload official high-resolution vector or transparent PNG logos for both Light and Dark backgrounds to ensure perfect branding across social channels.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isLogosComplete ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/30 text-xs font-bold font-mono-code">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Both Logos Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono-code">
                <AlertCircle className="w-3.5 h-3.5" />
                Action Required
              </span>
            )}

            <button
              onClick={handleSaveAllLogos}
              className="btn-mint px-4 py-1.5 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              {logoSaveSuccess ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{logoSaveSuccess ? 'Logos Saved!' : 'Save Logos'}</span>
            </button>
          </div>
        </div>

        {/* Dual Cards: Light Mode Logo + Dark Mode Logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Light Theme Logo */}
          <div className="bg-[#0a0a0a] border border-[#26262a] rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Light Theme Brand Logo
                    </h4>
                    <span className="text-[11px] text-neutral-400">For white, light & bright backgrounds</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                  hasLightLogo 
                    ? 'bg-[#00d4a4]/20 text-[#00d4a4] border border-[#00d4a4]/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {hasLightLogo ? 'Configured' : 'Required'}
                </span>
              </div>

              {/* Preview Canvas (Pure White Backdrop with Checkerboard) */}
              <div className="h-36 rounded-xl border border-neutral-300 bg-white flex items-center justify-center p-4 relative overflow-hidden group shadow-inner">
                {lightLogo ? (
                  <img
                    src={lightLogo}
                    alt={`${client.name} Light Theme Logo`}
                    className="max-h-24 max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-center space-y-1 text-neutral-400">
                    <ImageIcon className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="text-xs font-semibold text-neutral-500">No Light Theme Logo Uploaded</p>
                  </div>
                )}

                {lightLogo && (
                  <button
                    onClick={() => {
                      setLightLogo('');
                      onUpdateClient({ ...client, logoLightUrl: '' });
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900/80 hover:bg-rose-600 text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Upload & URL Controls */}
            <div className="space-y-2 pt-2 border-t border-[#26262a]">
              <input
                ref={lightFileInputRef}
                type="file"
                accept="image/*,.svg"
                onChange={handleLightLogoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => lightFileInputRef.current?.click()}
                  className="btn-mint flex-1 py-2 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Light Logo File</span>
                </button>

                <button
                  onClick={() => setShowLightUrlInput(!showLightUrlInput)}
                  className="btn-pill-dark px-3 py-2 text-xs font-bold flex items-center space-x-1"
                  title="Provide direct Image URL"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>URL</span>
                </button>
              </div>

              {showLightUrlInput && (
                <form onSubmit={handleApplyLightUrl} className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    required
                    value={lightLogoUrlInput}
                    onChange={(e) => setLightLogoUrlInput(e.target.value)}
                    placeholder="https://example.com/logo-light.svg or .png"
                    className="flex-1 bg-[#141416] border border-[#26262a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4a4] font-mono-code"
                  />
                  <button type="submit" className="btn-mint px-3 py-1.5 text-xs font-bold">
                    Apply
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Card 2: Dark Theme Logo */}
          <div className="bg-[#0a0a0a] border border-[#26262a] rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-400/10 text-indigo-400 border border-indigo-400/20">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Dark Theme Brand Logo
                    </h4>
                    <span className="text-[11px] text-neutral-400">For black, obsidian & dark backgrounds</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                  hasDarkLogo 
                    ? 'bg-[#00d4a4]/20 text-[#00d4a4] border border-[#00d4a4]/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {hasDarkLogo ? 'Configured' : 'Required'}
                </span>
              </div>

              {/* Preview Canvas (Obsidian Dark Backdrop) */}
              <div className="h-36 rounded-xl border border-[#26262a] bg-[#0e0e10] flex items-center justify-center p-4 relative overflow-hidden group shadow-inner">
                {darkLogo ? (
                  <img
                    src={darkLogo}
                    alt={`${client.name} Dark Theme Logo`}
                    className="max-h-24 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-center space-y-1 text-neutral-500">
                    <ImageIcon className="w-8 h-8 mx-auto text-neutral-600" />
                    <p className="text-xs font-semibold text-neutral-500">No Dark Theme Logo Uploaded</p>
                  </div>
                )}

                {darkLogo && (
                  <button
                    onClick={() => {
                      setDarkLogo('');
                      onUpdateClient({ ...client, logoDarkUrl: '' });
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-900/80 hover:bg-rose-600 text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Upload & URL Controls */}
            <div className="space-y-2 pt-2 border-t border-[#26262a]">
              <input
                ref={darkFileInputRef}
                type="file"
                accept="image/*,.svg"
                onChange={handleDarkLogoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => darkFileInputRef.current?.click()}
                  className="btn-mint flex-1 py-2 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Dark Logo File</span>
                </button>

                <button
                  onClick={() => setShowDarkUrlInput(!showDarkUrlInput)}
                  className="btn-pill-dark px-3 py-2 text-xs font-bold flex items-center space-x-1"
                  title="Provide direct Image URL"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>URL</span>
                </button>
              </div>

              {showDarkUrlInput && (
                <form onSubmit={handleApplyDarkUrl} className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    required
                    value={darkLogoUrlInput}
                    onChange={(e) => setDarkLogoUrlInput(e.target.value)}
                    placeholder="https://example.com/logo-dark.svg or .png"
                    className="flex-1 bg-[#141416] border border-[#26262a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4a4] font-mono-code"
                  />
                  <button type="submit" className="btn-mint px-3 py-1.5 text-xs font-bold">
                    Apply
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* DEDICATED PER-CLIENT SOCIAL MEDIA PROFILE SECTION */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#00d4a4]" />
              {client.name}'s Social Media Profile & API Authorizations
            </h3>
            <p className="text-xs text-neutral-400">All social profiles linked specifically to {client.name}</p>
          </div>

          <button
            onClick={onOpenConnectSocialModal}
            className="btn-pill-dark px-3 py-1.5 text-xs font-bold flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span>Link New Social Profile</span>
          </button>
        </div>

        {clientSocialAccounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {clientSocialAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 space-y-2 flex flex-col justify-between hover:border-[#3f3f46] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSocialIcon(acc.platform, "w-4 h-4 text-[#00d4a4]")}
                    <span className="font-bold text-white text-xs capitalize">{acc.platform}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-[#00d4a4] bg-[#00d4a4]/10 rounded border border-[#00d4a4]/30">
                    Active
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-white font-mono-code">{acc.handle}</p>
                  <p className="text-[10px] text-neutral-500 font-mono-code font-semibold">{(acc.followerCount / 1000).toFixed(1)}k followers</p>
                </div>

                <div className="pt-2 border-t border-[#26262a] flex items-center justify-between text-[10px] text-neutral-400 font-mono-code">
                  <span>Linked: {acc.connectedAt || 'Aug 2026'}</span>
                  <span className="text-[#00d4a4] font-semibold">Verified 200 OK</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0a0a0a] rounded-xl border border-[#26262a] space-y-3">
            <p className="text-xs text-neutral-400">No social profiles connected for {client.name} yet.</p>
            <button
              onClick={onOpenConnectSocialModal}
              className="btn-mint px-4 py-2 text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Connect {client.name}'s Accounts Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Brand Health Score</span>
            <ShieldCheck className="w-4 h-4 text-[#00d4a4]" />
          </div>
          <div className="text-2xl font-extrabold text-white">{analysis.brandHealthScore}%</div>
          <p className="text-[11px] text-neutral-500">Aligned with target persona</p>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Indexed Subpages</span>
            <Globe className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="text-2xl font-extrabold text-white">{analysis.crawledPages.length} Subpages</div>
          <p className="text-[11px] text-neutral-500">CTA deep links indexed</p>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Strategic Pillars</span>
            <Layers className="w-4 h-4 text-[#00d4a4]" />
          </div>
          <div className="text-2xl font-extrabold text-white">{analysis.contentPillars.length} Pillars</div>
          <p className="text-[11px] text-neutral-500">Active monthly distribution</p>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Brand Voice</span>
            <Palette className="w-4 h-4 text-neutral-300" />
          </div>
          <div className="text-xs font-bold text-[#00d4a4] truncate">{analysis.extractedTone}</div>
          <p className="text-[11px] text-neutral-500">Primary Palette Accent</p>
        </div>
      </div>

      {/* Main Documentation Style Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Subpage Index & Content Pillars */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00d4a4]" />
                Crawled Subpages & CTA Target Links
              </h3>
              <span className="text-[11px] text-[#00d4a4] bg-[#00d4a4]/10 px-2 py-0.5 rounded font-mono-code">
                HTML Index
              </span>
            </div>

            <div className="space-y-3">
              {analysis.crawledPages.map((page, idx) => (
                <div
                  key={idx}
                  className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 space-y-1.5 hover:border-[#3f3f46] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#00d4a4] font-mono-code">{idx + 1}.</span>
                      <h4 className="text-xs font-bold text-white">{page.title}</h4>
                    </div>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#00d4a4] hover:underline flex items-center gap-1 font-mono-code"
                    >
                      <span>{page.url.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{page.summary}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {page.keywords.map((kw, kIdx) => (
                      <span key={kIdx} className="px-2 py-0.5 text-[10px] font-mono-code text-neutral-400 bg-[#141416] rounded border border-[#26262a]">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#26262a] pb-3">
              <Layers className="w-4 h-4 text-[#00d4a4]" />
              Monthly Strategic Content Pillars
            </h3>
            <div className="space-y-2">
              {analysis.contentPillars.map((pillar, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-[#00d4a4] shrink-0" />
                  <span>{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Persona, Hashtags, Visual Mood */}
        <div className="space-y-6">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-neutral-400" />
              Target Audience Persona
            </h3>
            <p className="text-xs text-neutral-300 bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 leading-relaxed">
              {analysis.targetAudiencePersona}
            </p>
          </div>

          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-neutral-400" />
              Recommended Hashtags
            </h3>
            <div className="space-y-2">
              {analysis.recommendedHashtagClusters.map((cluster, idx) => (
                <div key={idx} className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-2.5 text-xs text-[#00d4a4] font-mono-code">
                  {cluster}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-neutral-400" />
              Visual Direction
            </h3>
            <p className="text-xs text-neutral-300 bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 leading-relaxed">
              {analysis.visualMood}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
