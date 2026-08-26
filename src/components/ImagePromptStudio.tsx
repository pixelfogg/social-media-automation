import React, { useState } from 'react';
import type { Client, SocialPost } from '../types';
import { 
  Sparkles, 
  Upload, 
  Wand2, 
  Copy, 
  Check, 
  Eye, 
  Layout
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';
import { generateSVGDataUrl } from '../services/aiGenerator';

interface ImagePromptStudioProps {
  client: Client;
  selectedPost: SocialPost | null;
  onSelectPost: (post: SocialPost) => void;
  onUpdatePost: (updatedPost: SocialPost) => void;
}

export const ImagePromptStudio: React.FC<ImagePromptStudioProps> = ({
  client,
  selectedPost,
  onSelectPost,
  onUpdatePost
}) => {
  const posts = client.posts || [];
  const currentPost = selectedPost || posts[0];

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [artStyle, setArtStyle] = useState('3D Neomorphic Isometric');
  const [aspectRatio, setAspectRatio] = useState('1:1 Square');
  const [previewPlatform, setPreviewPlatform] = useState<'instagram' | 'facebook' | 'linkedin'>('instagram');

  if (!currentPost) {
    return (
      <div className="p-8 text-center text-neutral-400 bg-[#141416] rounded-2xl border border-[#26262a]">
        No posts available for this client.
      </div>
    );
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPost.imagePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleRegenerateImageWithPrompt = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const primaryColor = client.brandColors[0] || '#00d4a4';
      const secondaryColor = client.brandColors[1] || '#1c1c1e';
      const newSvgUrl = generateSVGDataUrl(currentPost.title, currentPost.category, primaryColor, secondaryColor, currentPost.dayNumber);

      const updated = {
        ...currentPost,
        imageUrl: newSvgUrl,
        imageSource: 'ai_generated' as const
      };

      onUpdatePost(updated);
      setIsGenerating(false);
    }, 1200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdatePost({
          ...currentPost,
          imageUrl: dataUrl,
          imageSource: 'uploaded' as const
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Mintlify Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-[#00d4a4]" />
              AI Prompt Synthesis Studio
            </span>
            <span className="text-xs text-neutral-400">Midjourney / DALL-E 3 / Flux PRO</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Post Visual & Text-to-Image Prompts
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Synthesized AI prompts tailored for every post. Copy prompts directly or render custom SVG post graphics.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Post Drawer */}
        <div className="lg:col-span-4 space-y-3 bg-[#141416] border border-[#26262a] rounded-2xl p-4 max-h-[700px] overflow-y-auto">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-[#00d4a4]" />
            30-Day Post Queue
          </h3>

          <div className="space-y-2">
            {posts.map((post) => {
              const isSelected = post.id === currentPost.id;
              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-[#0a0a0a] border-[#00d4a4] ring-1 ring-[#00d4a4]/30'
                      : 'bg-[#0a0a0a] border-[#26262a] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#141416] overflow-hidden shrink-0 border border-[#26262a]">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 font-mono-code">
                      <span>DAY {post.dayNumber}</span>
                      <span className="text-[#00d4a4]">{post.category.slice(0, 12)}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5">{post.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code-Block Style Prompt Synthesizer & Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#26262a] pb-4">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-bold text-[#00d4a4] bg-[#00d4a4]/10 rounded border border-[#00d4a4]/20 font-mono-code">
                  DAY {currentPost.dayNumber} • {currentPost.category}
                </span>
                <h2 className="text-lg font-bold text-white mt-1.5">{currentPost.title}</h2>
              </div>

              <label className="btn-pill-dark flex items-center space-x-1.5 px-3 py-2 text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#00d4a4]" />
                <span>Upload Asset</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* Mintlify Code Block Container for AI Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
                  Synthesized Text-to-Image Prompt
                </label>

                {/* Mintlify Copy Button */}
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center space-x-1 text-xs text-neutral-300 hover:text-white bg-[#1c1c1e] px-2.5 py-1 rounded border border-[#26262a] font-mono-code"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#00d4a4]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Midjourney Prompt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dark Code Surface */}
              <div className="bg-[#1c1c1e] border border-[#26262a] rounded-xl p-4 text-xs font-mono-code text-neutral-200 leading-relaxed">
                <div className="text-[10px] text-neutral-500 mb-1 font-sans font-semibold">// Midjourney v6 / Flux 1.1 PRO format</div>
                {currentPost.imagePrompt}
              </div>
            </div>

            {/* Prompt Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Visual Style</label>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="3D Neomorphic Isometric">3D Neomorphic Isometric</option>
                  <option value="Photorealistic Studio Lighting">Photorealistic Studio Lighting</option>
                  <option value="Minimalist Vector Illustration">Minimalist Vector Illustration</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="1:1 Square">1:1 Square (Instagram / FB)</option>
                  <option value="4:5 Portrait">4:5 Vertical (Feed)</option>
                  <option value="16:9 Landscape">16:9 Landscape (LinkedIn / X)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRegenerateImageWithPrompt}
                  disabled={isGenerating}
                  className="btn-mint w-full flex items-center justify-center space-x-1.5 py-2 px-3 font-bold text-xs disabled:opacity-50"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating...' : 'Render Image via Prompt'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Social Feed Preview Card */}
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00d4a4]" />
                Live Feed Mockup Preview
              </h3>

              <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#26262a]">
                <button
                  onClick={() => setPreviewPlatform('instagram')}
                  className={`p-1 px-2.5 rounded text-[11px] font-medium flex items-center space-x-1 ${
                    previewPlatform === 'instagram' ? 'bg-[#1c1c1e] text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  {getSocialIcon('instagram', 'w-3 h-3')}
                  <span>Instagram</span>
                </button>
                <button
                  onClick={() => setPreviewPlatform('facebook')}
                  className={`p-1 px-2.5 rounded text-[11px] font-medium flex items-center space-x-1 ${
                    previewPlatform === 'facebook' ? 'bg-[#1c1c1e] text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  {getSocialIcon('facebook', 'w-3 h-3')}
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => setPreviewPlatform('linkedin')}
                  className={`p-1 px-2.5 rounded text-[11px] font-medium flex items-center space-x-1 ${
                    previewPlatform === 'linkedin' ? 'bg-[#1c1c1e] text-white font-bold' : 'text-neutral-400'
                  }`}
                >
                  {getSocialIcon('linkedin', 'w-3 h-3')}
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Post Card */}
            <div className="max-w-md mx-auto bg-[#0a0a0a] border border-[#26262a] rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center space-x-3">
                <img src={client.logoUrl} alt={client.name} className="w-8 h-8 rounded-full object-cover border border-[#26262a]" />
                <div>
                  <h4 className="text-xs font-bold text-white">{client.name}</h4>
                  <p className="text-[10px] text-neutral-500 font-mono-code">Scheduled Day {currentPost.dayNumber}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
                {currentPost.caption}
              </p>

              <div className="aspect-square bg-[#141416] rounded-xl overflow-hidden border border-[#26262a]">
                <img src={currentPost.imageUrl} alt={currentPost.title} className="w-full h-full object-cover" />
              </div>

              <div className="bg-[#141416] border border-[#26262a] rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-500 font-mono-code">{client.websiteUrl.replace(/^https?:\/\//, '')}</p>
                  <p className="font-bold text-white truncate max-w-[200px]">{currentPost.title}</p>
                </div>
                <span className="px-3 py-1 bg-[#00d4a4] text-[#0a0a0a] font-bold text-[11px] rounded-md">
                  Visit Link
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
