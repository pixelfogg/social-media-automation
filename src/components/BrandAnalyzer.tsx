import React, { useState } from 'react';
import type { Client, BrandAnalysis } from '../types';
import { getSocialIcon } from './SocialIcons';
import { 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Palette, 
  Hash, 
  Target, 
  ShieldCheck, 
  ExternalLink,
  Cpu,
  Key,
  Share2,
  Plus,
  FileCode,
  Copy,
  Check
} from 'lucide-react';
import { analyzeBrandAndWebsite } from '../services/aiGenerator';

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
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'brand_guide_md'>('overview');
  const [copiedMd, setCopiedMd] = useState(false);

  const analysis: BrandAnalysis = client.brandAnalysis || analyzeBrandAndWebsite(client);
  const clientSocialAccounts = client.socialAccounts || [];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setProgressMessage(`Crawling ${client.websiteUrl}...`);

    setTimeout(() => {
      setProgressMessage('Parsing HTML metadata & building DESIGN.md Brand Guide...');
    }, 800);

    setTimeout(() => {
      setProgressMessage('Extracting color tokens, typography scales & prompt rules...');
    }, 1600);

    setTimeout(() => {
      const updatedAnalysis = analyzeBrandAndWebsite(client);
      onUpdateClient({
        ...client,
        brandAnalysis: updatedAnalysis
      });
      setIsAnalyzing(false);
      setProgressMessage('');
    }, 2400);
  };

  const handleCopyDesignMd = () => {
    navigator.clipboard.writeText(analysis.designMd || '');
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00d4a4]" />
              Client Dashboard & Intelligence
            </span>
            <span className="text-xs text-neutral-400">Client: <strong className="text-white">{client.name}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {client.name} — Workspace Dashboard
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Dedicated client profile, generated <code className="text-[#00d4a4] font-mono-code font-bold">DESIGN.md</code> Brand Guide specification, social authorizations, and image prompt visual rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenConnectSocialModal}
            className="btn-mint flex items-center space-x-2 px-5 py-2.5 text-xs font-bold shadow-sm"
          >
            <Key className="w-4 h-4 text-[#0a0a0a]" />
            <span>Connect Accounts for {client.name}</span>
          </button>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="btn-pill-dark flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#00d4a4] ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Crawling & Generating Brand Guide...' : 'Re-Crawl Site & Build DESIGN.md'}</span>
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

      {/* VIEW SELECTOR TABS */}
      <div className="flex items-center space-x-2 border-b border-[#26262a] pb-3">
        <button
          onClick={() => setActiveViewTab('overview')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeViewTab === 'overview'
              ? 'bg-[#00d4a4] text-[#0a0a0a]'
              : 'bg-[#141416] text-neutral-400 hover:text-white border border-[#26262a]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Website Index & Accounts Overview</span>
        </button>

        <button
          onClick={() => setActiveViewTab('brand_guide_md')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeViewTab === 'brand_guide_md'
              ? 'bg-[#00d4a4] text-[#0a0a0a]'
              : 'bg-[#141416] text-neutral-400 hover:text-white border border-[#26262a]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Generated Markdown Brand Guide (DESIGN.md)</span>
        </button>
      </div>

      {activeViewTab === 'overview' ? (
        <>
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
        </>
      ) : (
        /* GENERATED MARKDOWN BRAND GUIDE VIEW */
        <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#26262a] pb-4">
            <div className="flex items-center space-x-2.5">
              <FileCode className="w-5 h-5 text-[#00d4a4]" />
              <div>
                <h3 className="text-base font-bold text-white">{client.name} — Auto-Generated DESIGN.md Brand Guide</h3>
                <p className="text-xs text-neutral-400">Extracted website visual tokens, color palettes, and Midjourney image prompt rules</p>
              </div>
            </div>

            <button
              onClick={handleCopyDesignMd}
              className="btn-mint flex items-center space-x-1.5 px-4 py-2 text-xs font-bold shadow-sm"
            >
              {copiedMd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0a0a0a]" />
                  <span>Copied Brand Guide!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#0a0a0a]" />
                  <span>Copy Markdown DESIGN.md</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-5 overflow-x-auto">
            <pre className="text-xs text-neutral-200 font-mono-code leading-relaxed whitespace-pre-wrap">
              {analysis.designMd}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
