import React, { useState } from 'react';
import type { Client, BrandAnalysis } from '../types';
import { DesignMdVisualPreview } from './DesignMdVisualPreview';
import { 
  FileCode, 
  Copy, 
  Check, 
  Eye, 
  Code, 
  RefreshCw
} from 'lucide-react';
import { analyzeBrandAndWebsite } from '../services/aiGenerator';
import { analyzeWebsiteWithGemini } from '../services/geminiService';

interface BrandGuidePageProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
}

export const BrandGuidePage: React.FC<BrandGuidePageProps> = ({ client, onUpdateClient }) => {
  const [guideMode, setGuideMode] = useState<'visual' | 'raw_markdown'>('visual');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const analysis: BrandAnalysis = client.brandAnalysis || analyzeBrandAndWebsite(client);
  const primaryColor = client.brandColors[0] || '#3b82f6';

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updated = await analyzeWebsiteWithGemini(client);
      const liveColors = (updated.extractedColors && updated.extractedColors.length > 0)
        ? updated.extractedColors
        : client.brandColors;

      onUpdateClient({
        ...client,
        brandColors: liveColors,
        brandAnalysis: updated
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(analysis.designMd);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner for Dedicated Brand Guide Page */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono-code"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              getdesign.md Engine
            </span>
            <span className="text-xs text-neutral-400 font-mono-code">DESIGN.md Specification</span>
          </div>

          <h2 className="text-xl font-extrabold text-white pt-1">
            {client.name} — Brand Guide & Design System
          </h2>
          <p className="text-xs text-neutral-400 pt-0.5">
            Auto-extracted from live website architecture, CSS styles, typography scale, and token specifications.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-[#0a0a0a] p-1 rounded-xl border border-[#26262a] flex items-center space-x-1">
            <button
              onClick={() => setGuideMode('visual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                guideMode === 'visual'
                  ? 'bg-[#141416] text-white shadow-sm border border-[#26262a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" style={{ color: guideMode === 'visual' ? primaryColor : undefined }} />
              <span>Visual Showcase</span>
            </button>

            <button
              onClick={() => setGuideMode('raw_markdown')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                guideMode === 'raw_markdown'
                  ? 'bg-[#141416] text-white shadow-sm border border-[#26262a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" style={{ color: guideMode === 'raw_markdown' ? primaryColor : undefined }} />
              <span>Raw DESIGN.md</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-200 bg-[#0a0a0a] border border-[#26262a] hover:border-[#3f3f46] hover:text-white transition-all flex items-center space-x-1.5"
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy DESIGN.md</span>
              </>
            )}
          </button>

          {/* Regenerate Button - styled identically to Connect Accounts button for unified UI consistency */}
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="btn-mint flex items-center space-x-1.5 px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0a0a0a] ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Re-crawling...' : 'Re-crawl Website'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Visual Showcase OR Raw Markdown */}
      {guideMode === 'visual' ? (
        <DesignMdVisualPreview client={client} analysis={analysis} />
      ) : (
        <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4" style={{ color: primaryColor }} />
              <h3 className="text-sm font-bold text-white">Raw Markdown Source ({client.name}/DESIGN.md)</h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono-code">GitHub Flavored Markdown</span>
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
