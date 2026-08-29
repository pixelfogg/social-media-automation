import React, { useState, useRef } from 'react';
import type { Client, SocialPost } from '../types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Sliders, 
  Palette,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Trash2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';
import { PostGraphicCard } from './PostGraphicCard';
import { generateVisualImageWithGemini } from '../services/geminiService';

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
  const [logoPlacement, setLogoPlacement] = useState('Top-Right Signature Badge');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeMockupTab, setActiveMockupTab] = useState<'instagram' | 'facebook' | 'linkedin'>('instagram');
  const [customMediaUrlInput, setCustomMediaUrlInput] = useState('');
  const [mediaMode, setMediaMode] = useState<'ai' | 'upload'>('ai');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryColor = client.brandColors[0] || '#020617';
  const secondaryColor = client.brandColors[1] || '#334155';
  const canvasColor = client.brandColors[2] || '#F9F8F6';
  const cleanDomain = client.websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const activeLogo = client.logoDarkUrl || client.logoLightUrl || client.logoUrl;

  if (!activePost) {
    return (
      <div className="p-8 text-center text-neutral-400">
        No posts available for {client.name}. Generate a 30-day planner first.
      </div>
    );
  }

  // Full-fidelity prompt generator incorporating complete DESIGN.md specifications & Mandatory Unaltered Logo
  const synthesizedPrompt = `High-end commercial brand asset for "${activePost.title}". Designed strictly in accordance with ${client.name}'s DESIGN.md Brand Guidelines (${cleanDomain}).
Visual Subject & Concept: ${promptStyle} representing ${activePost.category} for ${client.name} in the ${client.industry} domain.
Mandatory Brand Identity & Exact Logo Embedding: Feature the authentic, un-altered official brand logo of "${client.name}" prominently anchored at the ${logoPlacement}. The ${client.name} brand logo must remain 100% exact in vector geometry, letterforms, proportions, and official brand colors (${primaryColor}) without alteration, deformation, hallucination, or artifacting, rendered as a crisp high-resolution brand mark with subtle glassmorphic backdrop for perfect visual presence.
Color Palette & Materials: Primary obsidian tone (${primaryColor}), dark slate accents (${secondaryColor}), warm off-white canvas backdrop (${canvasColor}), premium frosted glassmorphism with subtle hairline border reflections (#26262a).
Atmosphere & Lighting: ${lighting}, volumetric soft shadows, refined global illumination, cinematic depth of field.
Composition & Typography Rules: Bold geometric headline space (Clash Display / Satoshi typography matrix), minimal technical overlines (JetBrains Mono style), negative space for UI overlays, razor-sharp clean edges.
Style & Render Specs: Octane Render 3D, commercial studio product photography, 8k resolution, photorealistic textures, hyper-detailed craftsmanship, ray tracing reflections, award-winning Behance/Dribbble showcase --ar ${aspectRatio.replace('--ar ', '')} --v 6.0 --style raw --q 2`;

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

  const handleGenerateImageWithGemini = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await generateVisualImageWithGemini(client, activePost, synthesizedPrompt);
      onUpdatePost({
        ...activePost,
        imageUrl: res.imageUrl,
        videoUrl: undefined,
        mediaType: 'image',
        imageSource: 'ai_generated',
        imagePrompt: res.promptUsed
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (isVideo) {
        onUpdatePost({
          ...activePost,
          videoUrl: result,
          imageUrl: result,
          mediaType: 'video',
          imageSource: 'custom'
        });
      } else {
        onUpdatePost({
          ...activePost,
          imageUrl: result,
          videoUrl: undefined,
          mediaType: 'image',
          imageSource: 'custom'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMediaUrlInput.trim()) return;

    const url = customMediaUrlInput.trim();
    const isVideo = Boolean(url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i));

    if (isVideo) {
      onUpdatePost({
        ...activePost,
        videoUrl: url,
        imageUrl: url,
        mediaType: 'video',
        imageSource: 'custom'
      });
    } else {
      onUpdatePost({
        ...activePost,
        imageUrl: url,
        videoUrl: undefined,
        mediaType: 'image',
        imageSource: 'custom'
      });
    }
    setCustomMediaUrlInput('');
  };

  const handleResetToAIGraphic = () => {
    onUpdatePost({
      ...activePost,
      imageUrl: undefined,
      videoUrl: undefined,
      mediaType: 'image',
      imageSource: 'preset'
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
              AI Visual & Custom Media Studio
            </span>
            <span className="text-xs text-neutral-400 font-mono-code">Client: <strong className="text-white">{client.name}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Visual Media & Prompt Studio
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Synthesize brand-aligned AI graphics with <strong className="text-[#00d4a4]">mandatory unaltered brand logo presence</strong>, generate Midjourney prompts, or upload custom assets for <strong className="text-white">{client.name}</strong>.
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
        
        {/* Left Column (7 cols): Studio Controls */}
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

          {/* Mode Switcher: AI Synthesizer vs Custom Media Upload */}
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-1.5 flex items-center gap-1 shadow-sm">
            <button
              onClick={() => setMediaMode('ai')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                mediaMode === 'ai'
                  ? 'bg-[#00d4a4] text-[#0a0a0a] shadow-md shadow-[#00d4a4]/20'
                  : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Prompt & Graphic Synthesizer</span>
            </button>

            <button
              onClick={() => setMediaMode('upload')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                mediaMode === 'upload'
                  ? 'bg-[#00d4a4] text-[#0a0a0a] shadow-md shadow-[#00d4a4]/20'
                  : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Custom Image / Video</span>
            </button>
          </div>

          {/* SECTION 1: CUSTOM MEDIA UPLOAD PANEL */}
          {mediaMode === 'upload' && (
            <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-[#00d4a4]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Custom Media Asset for Day {activePost.dayNumber}
                  </h4>
                </div>
                {activePost.imageSource === 'custom' && (
                  <button
                    onClick={handleResetToAIGraphic}
                    className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset to Preset Graphic</span>
                  </button>
                )}
              </div>

              {/* Drag & Drop File Picker Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#26262a] hover:border-[#00d4a4]/60 bg-[#0a0a0a] rounded-2xl p-8 text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-[#141416] group-hover:bg-[#00d4a4]/10 border border-[#26262a] group-hover:border-[#00d4a4]/30 flex items-center justify-center mx-auto text-neutral-400 group-hover:text-[#00d4a4] transition-colors mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h5 className="text-xs font-bold text-white mb-1">
                  Click or Drag & Drop to Upload Media
                </h5>
                <p className="text-[11px] text-neutral-500">
                  Supports High-Res Images (PNG, JPG, WEBP, GIF) and Videos (MP4, WEBM, MOV) up to 50MB
                </p>
              </div>

              {/* Paste Direct URL Form */}
              <form onSubmit={handleApplyCustomUrl} className="space-y-2 pt-2">
                <label className="block text-[10px] text-neutral-400 uppercase font-bold">
                  Or Paste Public Image / Video URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                    <input
                      type="url"
                      value={customMediaUrlInput}
                      onChange={(e) => setCustomMediaUrlInput(e.target.value)}
                      placeholder="https://example.com/asset.jpg or https://example.com/video.mp4"
                      className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4a4] font-mono-code"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-mint px-4 py-2 text-xs font-bold shrink-0"
                  >
                    Apply URL
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: AI PROMPT SYNTHESIS & GEMINI */}
          {mediaMode === 'ai' && (
            <>
              {/* Brand Guide Visual Tokens Summary with Mandatory Logo */}
              <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#00d4a4]" />
                  Injected Brand Guide Tokens & Mandatory Assets ({client.name})
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-mono-code">Primary CTA</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: primaryColor }} />
                      <span className="font-bold text-white font-mono-code">{primaryColor}</span>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-mono-code">Canvas Surface</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: canvasColor }} />
                      <span className="font-bold text-white font-mono-code">{canvasColor}</span>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-mono-code">Secondary Accent</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: secondaryColor }} />
                      <span className="font-bold text-white font-mono-code">{secondaryColor}</span>
                    </div>
                  </div>

                  {/* Mandatory Brand Logo Token */}
                  <div className="bg-[#0a0a0a] border border-[#00d4a4]/30 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#00d4a4] font-mono-code font-bold">Brand Logo</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#00d4a4]/20 text-[#00d4a4] font-bold">Locked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeLogo ? (
                        <img src={activeLogo} alt={client.name} className="w-5 h-5 rounded object-contain" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-[#00d4a4]" />
                      )}
                      <span className="font-bold text-white text-[11px] truncate">100% Unaltered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameter Tuning Controls */}
              <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-neutral-400" />
                  Prompt Parameter Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
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

                  {/* Mandatory Brand Logo Placement */}
                  <div>
                    <label className="block text-[10px] text-[#00d4a4] uppercase font-bold mb-1 flex items-center justify-between">
                      <span>Brand Logo Placement</span>
                      <span className="text-[9px] text-[#00d4a4] font-mono-code font-bold">Mandatory</span>
                    </label>
                    <select
                      value={logoPlacement}
                      onChange={(e) => setLogoPlacement(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#00d4a4]/40 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none"
                    >
                      <option value="Top-Right Signature Badge">Top-Right Badge</option>
                      <option value="Top-Left Header Mark">Top-Left Header</option>
                      <option value="Bottom-Right Floating Emblem">Bottom-Right Emblem</option>
                      <option value="Center Hero 3D Emblem">Center Hero 3D</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Synthesized Prompt Box with Mandatory Unaltered Logo Guarantee */}
              <div className="bg-[#141416] border border-[#00d4a4]/40 rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#26262a] pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#00d4a4] flex items-center gap-1.5 font-mono-code">
                      <Sparkles className="w-3.5 h-3.5" />
                      Synthesized Midjourney v6 / Flux Prompt
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Mandatory Logo Preserved
                    </span>
                  </div>

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

                <p className="text-xs text-neutral-200 font-mono-code bg-[#0a0a0a] border border-[#26262a] rounded-xl p-4 leading-relaxed whitespace-pre-line">
                  {synthesizedPrompt}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleGenerateImageWithGemini}
                    disabled={isGeneratingImage}
                    className="btn-mint w-full py-2 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-[#00d4a4]/20 disabled:opacity-50"
                  >
                    <ImageIcon className={`w-3.5 h-3.5 text-[#0a0a0a] ${isGeneratingImage ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingImage ? 'Synthesizing with Gemini...' : 'Generate Image (Gemini AI)'}</span>
                  </button>

                  <button
                    onClick={handleUpdateActivePrompt}
                    className="btn-pill-dark w-full py-2 text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <span>Attach Prompt to Day {activePost.dayNumber}</span>
                  </button>
                </div>
              </div>
            </>
          )}

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
                  <div className="w-8 h-8 rounded-full bg-[#141416] border border-[#26262a] p-0.5 flex items-center justify-center overflow-hidden">
                    <img src={activeLogo} alt={client.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">{client.name}</h5>
                    <p className="text-[10px] text-neutral-500 font-mono-code pt-0.5">Sponsored • {client.websiteUrl.replace(/^https?:\/\//, '')}</p>
                  </div>
                </div>
                {getSocialIcon(activeMockupTab, 'w-4 h-4 text-neutral-500')}
              </div>

              {/* Visual Card Image / Video with controls and authentic logo badge */}
              <div className="aspect-square bg-[#141416] overflow-hidden relative">
                <PostGraphicCard
                  post={activePost}
                  primaryColor={primaryColor}
                  secondaryColor={client.brandColors[1] || '#3772cf'}
                  showControls={Boolean(activePost.videoUrl)}
                />

                {/* Overlaid Authentic Brand Logo Badge for Mockup */}
                {activeLogo && (
                  <div className={`absolute z-20 pointer-events-none ${
                    logoPlacement.includes('Top-Right') ? 'top-3 right-3' :
                    logoPlacement.includes('Top-Left') ? 'top-3 left-3' :
                    logoPlacement.includes('Bottom-Right') ? 'bottom-3 right-3' :
                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                  }`}>
                    <div className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center space-x-1.5">
                      <img src={activeLogo} alt={client.name} className="w-4 h-4 object-contain" />
                      <span className="text-[10px] font-bold text-white font-mono-code tracking-tight">{client.name}</span>
                    </div>
                  </div>
                )}
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
