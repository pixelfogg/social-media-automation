import React, { useState } from 'react';
import type { Client, SocialPost, SocialPlatform, GenerationSettings } from '../types';
import { 
  Sparkles, 
  Search, 
  Edit3, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  Send,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Sliders,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';
import { PostGraphicCard } from './PostGraphicCard';
import { generate30DayCalendar } from '../services/aiGenerator';
import { generate30DayCalendarWithGemini, generateVisualImageWithGemini } from '../services/geminiService';

interface MonthContentPlannerProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
  onOpenStudioForPost: (post: SocialPost) => void;
  onOpenPublisherForPost: (post: SocialPost) => void;
}

export const MonthContentPlanner: React.FC<MonthContentPlannerProps> = ({
  client,
  onUpdateClient,
  onOpenStudioForPost,
  onOpenPublisherForPost
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatingImagePostId, setGeneratingImagePostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);

  const [genSettings, setGenSettings] = useState<GenerationSettings>({
    targetMonth: 'September 2026',
    primaryFocusTopic: `${client.industry} Automation & Growth`,
    toneOverride: client.tone,
    targetPlatforms: ['facebook', 'instagram', 'linkedin', 'twitter']
  });

  const posts = client.posts || [];

  const handleRegenerateMonth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsRegenerating(true);

    try {
      const customClient = {
        ...client,
        tone: genSettings.toneOverride || client.tone
      };
      const freshPosts = await generate30DayCalendarWithGemini(customClient);
      onUpdateClient({
        ...client,
        posts: freshPosts
      });
    } catch (err) {
      console.warn('Gemini 30-day generation error:', err);
      const customClient = {
        ...client,
        tone: genSettings.toneOverride || client.tone
      };
      const freshPosts = generate30DayCalendar(customClient);
      onUpdateClient({
        ...client,
        posts: freshPosts
      });
    } finally {
      setIsRegenerating(false);
      setShowGenModal(false);
    }
  };

  const handleGeneratePostImage = async (post: SocialPost) => {
    setGeneratingImagePostId(post.id);
    try {
      const result = await generateVisualImageWithGemini(client, post);
      const updatedPosts = posts.map(p => p.id === post.id ? { ...p, imageUrl: result.imageUrl, imagePrompt: result.promptUsed } : p);
      onUpdateClient({
        ...client,
        posts: updatedPosts
      });
    } catch (err) {
      console.error('Error generating image with Gemini:', err);
    } finally {
      setGeneratingImagePostId(null);
    }
  };

  const handleApproveAllDrafts = () => {
    const updated = posts.map(p => p.status === 'draft' ? { ...p, status: 'scheduled' as const } : p);
    onUpdateClient({
      ...client,
      posts: updated
    });
  };

  const handleExportCSV = () => {
    const headers = ['Day', 'Scheduled Date', 'Time', 'Title', 'Category', 'Caption', 'Target URL', 'Hashtags', 'Platforms', 'Status'];
    const rows = posts.map(p => [
      p.dayNumber,
      p.scheduledDate,
      p.scheduledTime,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.caption.replace(/"/g, '""')}"`,
      `"${p.targetUrl}"`,
      `"${p.hashtags.join(' ')}"`,
      `"${p.platforms.join(', ')}"`,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `content_calendar_${client.name.toLowerCase().replace(/\s+/g, '_')}_30days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(posts, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `content_calendar_${client.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSavePostEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const updatedPosts = posts.map(p => p.id === editingPost.id ? editingPost : p);
    onUpdateClient({
      ...client,
      posts: updatedPosts
    });
    setEditingPost(null);
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(p => p.id !== postId);
    onUpdateClient({
      ...client,
      posts: updatedPosts
    });
  };

  const handleClearAllPosts = () => {
    if (window.confirm(`Are you sure you want to clear all posts for ${client.name}?`)) {
      onUpdateClient({
        ...client,
        posts: []
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.hashtags.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = selectedPlatform === 'all' || post.platforms.includes(selectedPlatform as SocialPlatform);
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;

    return matchesSearch && matchesPlatform && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
              AI 30-Day Content Generator
            </span>
            <span className="text-xs text-neutral-400">Total Posts: {posts.length} Days Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            30-Day Social Media Planner
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Full 30-day content matrix customized for <span className="text-white font-semibold">{client.name}</span> with captions, hashtags, platform tags, and client website URLs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-pill-dark flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold"
            title="Export Calendar as CSV file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-pill-dark flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold"
            title="Export Calendar as JSON file"
          >
            <Download className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleApproveAllDrafts}
            className="btn-pill-dark flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span>Approve All Drafts</span>
          </button>

          {posts.length > 0 && (
            <button
              onClick={handleClearAllPosts}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 flex items-center space-x-1.5"
              title="Clear all generated posts for this client"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Posts</span>
            </button>
          )}

          <button
            onClick={() => handleRegenerateMonth()}
            disabled={isRegenerating}
            className="btn-mint flex items-center space-x-2 px-4 py-2 text-xs font-bold shadow-lg shadow-[#00d4a4]/20 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#0a0a0a] ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Gemini AI Generating 30 Posts...' : (posts.length === 0 ? 'Generate 30-Day Posts (Gemini AI)' : 'Re-Generate 30 Posts (Gemini AI)')}</span>
          </button>

          <button
            onClick={() => setShowGenModal(true)}
            className="btn-pill-dark flex items-center space-x-2 px-3 py-2 text-xs font-semibold"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span>Custom Settings</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search titles, copy, hashtags..."
            className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00d4a4]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-[#0a0a0a] border border-[#26262a] text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter / X</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0a0a0a] border border-[#26262a] text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Educational & Tips">Educational & Tips</option>
            <option value="Product Spotlight">Product Spotlight</option>
            <option value="Behind The Scenes">Behind The Scenes</option>
            <option value="Thought Leadership">Thought Leadership</option>
            <option value="Social Proof & Case Study">Case Study & ROI</option>
            <option value="Promotional & Offer">Promotional & Offer</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0a0a0a] border border-[#26262a] text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>

        </div>
      </div>

      {/* 30-Day Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#141416] border border-[#26262a] hover:border-[#3f3f46] rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-sm"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden border-b border-[#26262a]">
                <PostGraphicCard
                  post={post}
                  primaryColor={client.brandColors[0] || '#00d4a4'}
                  secondaryColor={client.brandColors[1] || '#3772cf'}
                  className="group-hover:scale-102 transition-transform duration-300"
                />
                
                {/* Generation Loading Overlay */}
                {generatingImagePostId === post.id && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
                    <Sparkles className="w-6 h-6 text-[#00d4a4] animate-spin" />
                    <span className="text-[11px] font-bold text-white">Synthesizing with Gemini...</span>
                  </div>
                )}
                
                {/* Day Badge */}
                <div className="absolute top-2.5 left-2.5 bg-[#0a0a0a]/90 border border-[#26262a] text-white font-mono-code font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow z-10">
                  DAY {post.dayNumber}
                </div>

                {/* Status Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                    post.status === 'published'
                      ? 'bg-[#00d4a4]/20 text-[#00d4a4] border border-[#00d4a4]/30'
                      : post.status === 'scheduled'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    {post.status}
                  </span>
                </div>

                {/* Platform Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-[#0a0a0a]/90 px-2.5 py-1 rounded-lg border border-[#26262a]">
                  <span className="flex items-center gap-1 font-mono-code text-neutral-300">
                    <Clock className="w-3 h-3 text-[#00d4a4]" />
                    {post.scheduledTime}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {post.platforms.map((pl, pIdx) => (
                      <span key={pIdx} title={pl}>
                        {getSocialIcon(pl, "w-3 h-3 text-neutral-300")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#0a0a0a] text-neutral-300 border border-[#26262a]">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono-code">{post.scheduledDate}</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#00d4a4] transition-colors line-clamp-1">
                  {post.title}
                </h3>

                <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                  {post.caption}
                </p>

                {/* Target URL */}
                <div className="bg-[#0a0a0a] border border-[#26262a] rounded-lg p-2 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 truncate">CTA Link:</span>
                  <a
                    href={post.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00d4a4] hover:underline font-mono-code truncate flex items-center gap-1 max-w-[180px]"
                  >
                    <span>{post.targetUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {post.hashtags.slice(0, 3).map((ht, hIdx) => (
                    <span key={hIdx} className="text-[10px] text-neutral-400 bg-[#0a0a0a] px-1.5 py-0.5 rounded border border-[#26262a] font-mono-code">
                      {ht}
                    </span>
                  ))}
                  {post.hashtags.length > 3 && (
                    <span className="text-[10px] text-neutral-500">+{post.hashtags.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-3 pt-0 flex items-center justify-between gap-1.5 border-t border-[#26262a] mt-2 pt-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingPost(post)}
                  className="btn-pill-dark py-1 px-2.5 text-[11px] font-semibold flex items-center justify-center space-x-1"
                >
                  <Edit3 className="w-3 h-3 text-neutral-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleGeneratePostImage(post)}
                  disabled={generatingImagePostId === post.id}
                  className="btn-pill-dark py-1 px-2.5 text-[11px] font-semibold flex items-center justify-center space-x-1 border-[#00d4a4]/30 hover:border-[#00d4a4]/60 disabled:opacity-50"
                  title="Generate Visual Image with Gemini AI & Brand Guide"
                >
                  <ImageIcon className={`w-3 h-3 text-[#00d4a4] ${generatingImagePostId === post.id ? 'animate-spin' : ''}`} />
                  <span>{generatingImagePostId === post.id ? 'Generating...' : 'AI Image'}</span>
                </button>

                <button
                  onClick={() => onOpenStudioForPost(post)}
                  className="btn-pill-dark py-1 px-2.5 text-[11px] font-semibold flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-neutral-400" />
                  <span>Prompt</span>
                </button>

                <button
                  onClick={() => onOpenPublisherForPost(post)}
                  className="btn-mint py-1 px-2.5 text-[11px] font-bold flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Publish</span>
                </button>
              </div>

              <button
                onClick={() => handleDeletePost(post.id)}
                className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete this post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State when no posts generated yet */}
      {filteredPosts.length === 0 && (
        <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#00d4a4]/10 border border-[#00d4a4]/20 flex items-center justify-center mx-auto text-[#00d4a4]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Content Posts Generated Yet</h3>
            <p className="text-xs text-neutral-400">
              Click the button below to generate a tailored 30-day viral content strategy for <strong className="text-white">{client.name}</strong> using Gemini AI.
            </p>
          </div>
          <button
            onClick={() => handleRegenerateMonth()}
            disabled={isRegenerating}
            className="btn-mint px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#00d4a4]/20 inline-flex items-center space-x-2"
          >
            <Sparkles className={`w-4 h-4 text-[#0a0a0a] ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Gemini AI Generating 30 Posts...' : 'Generate 30-Day Posts (Gemini AI)'}</span>
          </button>
        </div>
      )}

      {/* Custom Generation Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#00d4a4]" />
                <h3 className="text-base font-bold text-white">Custom 30-Day AI Post Synthesizer</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegenerateMonth} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Target Month & Year
                </label>
                <input
                  type="text"
                  required
                  value={genSettings.targetMonth}
                  onChange={(e) => setGenSettings({ ...genSettings, targetMonth: e.target.value })}
                  placeholder="September 2026"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Primary Product / Focus Campaign Topic
                </label>
                <input
                  type="text"
                  required
                  value={genSettings.primaryFocusTopic}
                  onChange={(e) => setGenSettings({ ...genSettings, primaryFocusTopic: e.target.value })}
                  placeholder="e.g. Enterprise Cloud AI & Automation Launch"
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#26262a]">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="btn-pill-dark px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegenerating}
                  className="btn-mint flex items-center space-x-1.5 px-5 py-2 font-bold disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Synthesizing...' : 'Generate 30-Day Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Day {editingPost.dayNumber} Post</h3>
                <p className="text-xs text-neutral-400">Update post title, copy, CTA link, and hashtags</p>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSavePostEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Copywriting & Caption *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg p-3 text-white focus:outline-none focus:border-[#00d4a4] leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Website Target CTA URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingPost.targetUrl}
                  onChange={(e) => setEditingPost({ ...editingPost, targetUrl: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4] font-mono-code"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Hashtags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={editingPost.hashtags.join(', ')}
                  onChange={(e) => setEditingPost({
                    ...editingPost,
                    hashtags: e.target.value.split(',').map(h => h.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00d4a4] font-mono-code"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#26262a]">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="btn-pill-dark px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-mint px-5 py-2 font-bold"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
