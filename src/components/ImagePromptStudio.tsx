import React, { useState } from 'react';
import type { Client, SocialPost } from '../types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Sliders, 
  Palette
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';

interface ImagePromptStudioProps {
  client: Client;
  selectedPost: SocialPost | null;
  onSelectPost: (post: SocialPost | null) => void;
  onUpdatePost: (post: SocialPost) => void;
}

export const ImagePromptStudio: React.FC<ImagePromptStudioProps> = ({
  client,
  selectedPost,
  onSelectPost,
  onUpdatePost
}) => {
  const posts = client.posts || [];
  const activePost = selectedPost || posts[0];

  const [promptStyle, setPromptStyle] = useState('3D Isometric Glassmorphism');
  const [lighting, setLighting] = useState('Deep Studio Dark Ambient');
  const [aspectRatio, setAspectRatio] = useState('--ar 1:1');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeMockupTab, setActiveMockupTab] = useState<'instagram' | 'facebook' | 'linkedin'>('instagram');

  const primaryColor = client.brandColors[0] || '#00d4a4';
  const darkCanvas = client.brandColors[2] || '#0a0a0a';

  if (!activePost) {
    return (
      <div className="p-8 text-center text-neutral-400">
        No posts available for {client.name}. Generate a 30-day planner first.
      </div>
    );
  }

  const synthesizedPrompt = `Ultra-modern visual graphic for "${activePost.title}". Designed following ${client.name} Brand Guide (DESIGN.md). Environment: ${lighting} in dark canvas ${darkCanvas}. Key Visual Features: ${promptStyle}, glowing accents in primary color ${primaryColor}, clean 12px rounded cards, high contrast typography overlays, 8k resolution, cinematic lighting --v 6.0 ${aspectRatio}`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(synthesizedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleUpdateActivePrompt = () => {
    onUpdatePost({
      ...activePost,
      imagePrompt: synthesizedPrompt
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
              Brand Guide-Driven Prompt Studio
            </span>
            <span className="text-xs text-neutral-400">Client: <strong className="text-white">{client.name}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Text-to-Image Prompt Synthesizer
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Generates Midjourney v6 & Flux prompts incorporating <span className="text-[#00d4a4] font-semibold">{client.name}'s DESIGN.md</span> brand colors ({primaryColor}), dark canvas tones, and visual rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Post Select Dropdown */}
          <div className="flex items-center space-x-2 bg-[#0a0a0a] border border-[#26262a] rounded-xl px-3 py-2 text-xs">
            <span className="text-neutral-400 font-semibold">Post:</span>
            <select
              value={activePost.id}
              onChange={(e) => {
                const p = posts.find(item => item.id === e.target.value);
                if (p) onSelectPost(p);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-2"
            >
              {posts.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#141416] text-white">
                  Day {p.dayNumber}: {p.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUpdateActivePrompt}
            className="btn-mint flex items-center space-x-2 px-4 py-2 text-xs font-bold shadow-lg shadow-[#00d4a4]/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0a0a0a]" />
            <span>Generate & Save Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Prompt Controls & Synthesis */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Post Details */}
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00d4a4]/10 text-[#00d4a4] font-mono-code font-bold border border-[#00d4a4]/30">
                DAY {activePost.dayNumber} • {activePost.category}
              </span>
              <span className="text-neutral-400 font-mono-code">{activePost.scheduledDate} ({activePost.scheduledTime})</span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug">
              {activePost.title}
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
              {activePost.caption}
            </p>
          </div>

          {/* Brand Guide Visual Tokens Summary */}
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#00d4a4]" />
              Injected Brand Guide Tokens ({client.name})
            </h4>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono-code">Primary CTA</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: primaryColor }} />
                  <span className="font-bold text-white font-mono-code">{primaryColor}</span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono-code">Dark Canvas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: darkCanvas }} />
                  <span className="font-bold text-white font-mono-code">{darkCanvas}</span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono-code">Shape Radius</span>
                <span className="font-bold text-[#00d4a4] font-mono-code">rounded-md (12px)</span>
              </div>
            </div>
          </div>

          {/* Parameter Tuning Controls */}
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-400" />
              Prompt Parameter Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Visual Style</label>
                <select
                  value={promptStyle}
                  onChange={(e) => setPromptStyle(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-semibold focus:outline-none"
                >
                  <option value="3D Isometric Glassmorphism">3D Isometric</option>
                  <option value="Sleek UI Dashboard & Charts">UI Dashboard</option>
                  <option value="Minimalist Vector Illustration">Minimalist Vector</option>
                  <option value="Photorealistic 35mm Studio">35mm Photo</option>
                  <option value="Cyberpunk Neon Technology">Futuristic Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Lighting & Mood</label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-semibold focus:outline-none"
                >
                  <option value="Deep Studio Dark Ambient">Studio Dark</option>
                  <option value="Dramatic High Contrast Glow">High Contrast</option>
                  <option value="Soft Neutral Daylight">Soft Daylight</option>
                  <option value="Cinematic Volumetric Fog">Volumetric</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-semibold focus:outline-none font-mono-code"
                >
                  <option value="--ar 1:1">1:1 Square (Feed)</option>
                  <option value="--ar 4:5">4:5 Vertical (Instagram)</option>
                  <option value="--ar 16:9">16:9 Landscape (LinkedIn)</option>
                  <option value="--ar 9:16">9:16 Story / Reel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Synthesized Prompt Box */}
          <div className="bg-[#141416] border border-[#00d4a4]/40 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-2.5">
              <span className="text-xs font-bold text-[#00d4a4] flex items-center gap-1.5 font-mono-code">
                <Sparkles className="w-3.5 h-3.5" />
                Synthesized Midjourney v6 / Flux Prompt
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyPrompt}
                  className="btn-mint px-3 py-1.5 text-xs font-bold flex items-center space-x-1 shadow-sm"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#0a0a0a]" /> : <Copy className="w-3.5 h-3.5 text-[#0a0a0a]" />}
                  <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-200 font-mono-code bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 leading-relaxed">
              {synthesizedPrompt}
            </p>

            <button
              onClick={handleUpdateActivePrompt}
              className="btn-pill-dark w-full py-2 text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <span>Attach Prompt to Day {activePost.dayNumber} Post Record</span>
            </button>
          </div>

        </div>

        {/* Right Column (5 cols): Feed Mockup Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Live Feed Mockup Preview
              </h3>

              {/* Feed Tabs */}
              <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#26262a]">
                <button
                  onClick={() => setActiveMockupTab('instagram')}
                  className={`p-1.5 rounded transition-all ${activeMockupTab === 'instagram' ? 'bg-[#141416] text-[#00d4a4]' : 'text-neutral-500'}`}
                >
                  {getSocialIcon('instagram', 'w-3.5 h-3.5')}
                </button>
                <button
                  onClick={() => setActiveMockupTab('facebook')}
                  className={`p-1.5 rounded transition-all ${activeMockupTab === 'facebook' ? 'bg-[#141416] text-[#00d4a4]' : 'text-neutral-500'}`}
                >
                  {getSocialIcon('facebook', 'w-3.5 h-3.5')}
                </button>
                <button
                  onClick={() => setActiveMockupTab('linkedin')}
                  className={`p-1.5 rounded transition-all ${activeMockupTab === 'linkedin' ? 'bg-[#141416] text-[#00d4a4]' : 'text-neutral-500'}`}
                >
                  {getSocialIcon('linkedin', 'w-3.5 h-3.5')}
                </button>
              </div>
            </div>

            {/* Mockup Card */}
            <div className="bg-[#0a0a0a] border border-[#26262a] rounded-2xl overflow-hidden shadow-xl space-y-3">
              {/* Header */}
              <div className="p-3.5 pb-0 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img src={client.logoUrl} alt={client.name} className="w-8 h-8 rounded-full object-cover border border-[#26262a]" />
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">{client.name}</h5>
                    <p className="text-[10px] text-neutral-500 font-mono-code pt-0.5">Sponsored • {client.websiteUrl.replace(/^https?:\/\//, '')}</p>
                  </div>
                </div>
                {getSocialIcon(activeMockupTab, 'w-4 h-4 text-neutral-500')}
              </div>

              {/* Visual Card Image */}
              <div className="aspect-square bg-[#141416] overflow-hidden relative">
                <img src={activePost.imageUrl} alt={activePost.title} className="w-full h-full object-cover" />
              </div>

              {/* Copywriting Preview */}
              <div className="p-4 pt-1 space-y-2 text-xs">
                <p className="text-neutral-200 leading-relaxed line-clamp-3">
                  {activePost.caption}
                </p>

                <a
                  href={activePost.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00d4a4] font-mono-code font-bold hover:underline block text-[11px] truncate"
                >
                  👉 {activePost.targetUrl}
                </a>

                <div className="flex flex-wrap gap-1 pt-1">
                  {activePost.hashtags.map((ht, hIdx) => (
                    <span key={hIdx} className="text-[10px] text-neutral-500 font-mono-code">
                      {ht}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
