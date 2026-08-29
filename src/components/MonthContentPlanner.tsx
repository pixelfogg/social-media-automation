import React, { useState, useMemo, useEffect } from 'react';
import type { Client, SocialPost, SocialPlatform, GenerationSettings, PostCategory } from '../types';
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
  Image as ImageIcon,
  Calendar as CalendarIcon,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye
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

type ViewMode = 'grid' | 'calendar' | 'list';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ALL_CATEGORIES: PostCategory[] = [
  'Educational & Tips',
  'Product Spotlight',
  'Behind The Scenes',
  'Thought Leadership',
  'Social Proof & Case Study',
  'Promotional & Offer'
];

export const MonthContentPlanner: React.FC<MonthContentPlannerProps> = ({
  client,
  onUpdateClient,
  onOpenStudioForPost,
  onOpenPublisherForPost
}) => {
  // View & Month Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 = September (0-indexed)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Loading & Modals
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [generatingImagePostId, setGeneratingImagePostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [reschedulingPost, setReschedulingPost] = useState<SocialPost | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [newPostDate, setNewPostDate] = useState<string | null>(null); // For "Add Post on Date"
  const [previewPost, setPreviewPost] = useState<SocialPost | null>(null);

  const [genSettings, setGenSettings] = useState<GenerationSettings>({
    targetMonth: `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
    primaryFocusTopic: `${client.industry} Automation & Growth`,
    toneOverride: client.tone,
    targetPlatforms: ['facebook', 'instagram', 'linkedin', 'twitter']
  });

  // Sync genSettings when selected month/year changes
  useEffect(() => {
    setGenSettings(prev => ({
      ...prev,
      targetMonth: `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
    }));
  }, [selectedMonth, selectedYear]);

  const posts = client.posts || [];
  const currentMonthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const currentMonthYearString = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Posts strictly belonging to the currently selected month
  const monthPosts = useMemo(() => {
    return posts.filter(post => {
      if (post.scheduledDate) {
        return post.scheduledDate.startsWith(currentMonthPrefix);
      }
      return false;
    });
  }, [posts, currentMonthPrefix]);

  // Filter posts for current selected month + user query/filters
  const filteredPosts = useMemo(() => {
    return monthPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPlatform = selectedPlatform === 'all' || post.platforms.includes(selectedPlatform as SocialPlatform);
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;

      return matchesSearch && matchesPlatform && matchesCategory && matchesStatus;
    });
  }, [monthPosts, searchTerm, selectedPlatform, selectedCategory, selectedStatus]);

  // Calendar Grid Calculations strictly for active month
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun
    
    // Group posts by day number (1 to daysInMonth)
    const postsByDay: { [day: number]: SocialPost[] } = {};

    monthPosts.forEach(post => {
      if (post.scheduledDate && post.scheduledDate.startsWith(currentMonthPrefix)) {
        const parts = post.scheduledDate.split('-');
        const dayNumber = parseInt(parts[2], 10);
        if (dayNumber >= 1 && dayNumber <= daysInMonth) {
          if (!postsByDay[dayNumber]) postsByDay[dayNumber] = [];
          postsByDay[dayNumber].push(post);
        }
      }
    });

    return { daysInMonth, firstDayIndex, postsByDay };
  }, [monthPosts, selectedYear, selectedMonth, currentMonthPrefix]);

  // Month Statistics
  const monthStats = useMemo(() => {
    const total = monthPosts.length;
    const published = monthPosts.filter(p => p.status === 'published').length;
    const scheduled = monthPosts.filter(p => p.status === 'scheduled').length;
    const drafts = monthPosts.filter(p => p.status === 'draft').length;
    const daysWithPosts = Object.keys(calendarDays.postsByDay).length;
    const coveragePercent = Math.round((daysWithPosts / calendarDays.daysInMonth) * 100);

    return { total, published, scheduled, drafts, daysWithPosts, coveragePercent };
  }, [monthPosts, calendarDays]);

  // Regenerate / AI Generation with Month-specific content and multi-month preservation
  const handleRegenerateMonth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsRegenerating(true);

    try {
      const customClient = {
        ...client,
        tone: genSettings.toneOverride || client.tone
      };

      let freshMonthPosts: SocialPost[];
      try {
        freshMonthPosts = await generate30DayCalendarWithGemini(customClient, selectedYear, selectedMonth);
      } catch (err) {
        console.warn('Gemini generation fallback:', err);
        freshMonthPosts = generate30DayCalendar(customClient, selectedYear, selectedMonth);
      }

      // Preserve posts from all OTHER months, replace/append for current selected month
      const otherMonthsPosts = posts.filter(p => !p.scheduledDate || !p.scheduledDate.startsWith(currentMonthPrefix));

      onUpdateClient({
        ...client,
        posts: [...otherMonthsPosts, ...freshMonthPosts]
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
    const updated = posts.map(p => {
      if (p.scheduledDate?.startsWith(currentMonthPrefix) && p.status === 'draft') {
        return { ...p, status: 'scheduled' as const };
      }
      return p;
    });
    onUpdateClient({
      ...client,
      posts: updated
    });
  };

  const handleExportCSV = () => {
    const headers = ['Day', 'Scheduled Date', 'Time', 'Title', 'Category', 'Caption', 'Target URL', 'Hashtags', 'Platforms', 'Status'];
    const rows = filteredPosts.map(p => [
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
    link.setAttribute('download', `content_calendar_${client.name.toLowerCase().replace(/\s+/g, '_')}_${MONTH_NAMES[selectedMonth].toLowerCase()}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredPosts, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `content_calendar_${client.name.toLowerCase().replace(/\s+/g, '_')}_${MONTH_NAMES[selectedMonth].toLowerCase()}_${selectedYear}.json`);
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

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingPost) return;

    const parts = reschedulingPost.scheduledDate.split('-');
    const newDay = parseInt(parts[2], 10) || reschedulingPost.dayNumber;

    const updatedPosts = posts.map(p => 
      p.id === reschedulingPost.id 
        ? { ...reschedulingPost, dayNumber: newDay }
        : p
    );
    onUpdateClient({
      ...client,
      posts: updatedPosts
    });
    setReschedulingPost(null);
  };

  const handleCreatePostOnDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostDate) return;

    const dayNum = parseInt(newPostDate.split('-')[2], 10);
    const newPost: SocialPost = {
      id: `post_${client.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientId: client.id,
      dayNumber: dayNum,
      scheduledDate: newPostDate,
      scheduledTime: '10:00 AM',
      title: `${MONTH_NAMES[selectedMonth]} Day ${dayNum}: New Scheduled Campaign Post`,
      category: 'Product Spotlight',
      platforms: ['instagram', 'facebook', 'linkedin'],
      caption: `Discover our latest updates and solutions at ${client.name}! 🚀\n\nLearn more: ${client.websiteUrl}`,
      description: `Targeted post scheduled for ${newPostDate}`,
      cta: `Explore at ${client.websiteUrl}`,
      targetUrl: client.websiteUrl,
      hashtags: [`#${client.name.replace(/\s+/g, '')}`, `#${MONTH_NAMES[selectedMonth]}${selectedYear}`, `#Innovation`],
      imagePrompt: `Clean modern social card for ${client.name}, brand color ${client.brandColors[0] || '#00d4a4'}, 8k resolution`,
      imageSource: 'preset',
      status: 'scheduled'
    };

    onUpdateClient({
      ...client,
      posts: [...posts, newPost]
    });
    setNewPostDate(null);
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(p => p.id !== postId);
    onUpdateClient({
      ...client,
      posts: updatedPosts
    });
    if (previewPost?.id === postId) setPreviewPost(null);
  };

  const handleClearMonthPosts = () => {
    if (window.confirm(`Are you sure you want to clear all posts for ${currentMonthYearString}? (Posts in other months will be preserved)`)) {
      const remainingPosts = posts.filter(p => !p.scheduledDate || !p.scheduledDate.startsWith(currentMonthPrefix));
      onUpdateClient({
        ...client,
        posts: remainingPosts
      });
      setPreviewPost(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner with Month Selector */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
              AI Multi-Channel Content Planner
            </span>
            <span className="text-xs text-neutral-400">Client: <strong className="text-white">{client.name}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {currentMonthYearString} Content Calendar
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Manage, schedule, and visualize your unique monthly social pipeline across Instagram, LinkedIn, Facebook, and X.
          </p>
        </div>

        {/* Month Selector Widget */}
        <div className="bg-[#0a0a0a] border border-[#26262a] rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shadow-inner">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-[#141416] text-neutral-300 hover:text-white hover:bg-[#26262a] border border-[#26262a] transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-[#00d4a4]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-[#141416] border border-[#26262a] text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00d4a4] cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-[#141416] border border-[#26262a] text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00d4a4] cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-[#141416] text-neutral-300 hover:text-white hover:bg-[#26262a] border border-[#26262a] transition-all"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-[#26262a] hidden sm:block" />

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleRegenerateMonth()}
              disabled={isRegenerating}
              className="btn-mint flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold shadow-md shadow-[#00d4a4]/20 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Generating...' : `Auto-Plan ${MONTH_NAMES[selectedMonth].slice(0, 3)}`}</span>
            </button>

            <button
              onClick={() => setShowGenModal(true)}
              className="btn-pill-dark p-1.5 text-xs text-neutral-300 hover:text-white"
              title="Custom AI Generation Settings"
            >
              <Sliders className="w-4 h-4 text-[#00d4a4]" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3.5">
          <span className="text-[10px] text-neutral-400 font-mono-code uppercase font-bold block">Total in {MONTH_NAMES[selectedMonth].slice(0, 3)}</span>
          <div className="text-xl font-extrabold text-white mt-1 flex items-baseline gap-1.5">
            <span>{monthStats.total}</span>
            <span className="text-xs text-neutral-500 font-normal">posts</span>
          </div>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3.5">
          <span className="text-[10px] text-[#00d4a4] font-mono-code uppercase font-bold block">Published</span>
          <div className="text-xl font-extrabold text-[#00d4a4] mt-1">{monthStats.published}</div>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3.5">
          <span className="text-[10px] text-amber-400 font-mono-code uppercase font-bold block">Scheduled</span>
          <div className="text-xl font-extrabold text-amber-300 mt-1">{monthStats.scheduled}</div>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3.5">
          <span className="text-[10px] text-neutral-400 font-mono-code uppercase font-bold block">Drafts</span>
          <div className="text-xl font-extrabold text-neutral-300 mt-1">{monthStats.drafts}</div>
        </div>

        <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-neutral-400 font-mono-code uppercase font-bold block">Day Coverage</span>
          <div className="text-xl font-extrabold text-white mt-1 flex items-baseline gap-1.5">
            <span>{monthStats.daysWithPosts} / {calendarDays.daysInMonth}</span>
            <span className="text-xs text-[#00d4a4] font-semibold">({monthStats.coveragePercent}%)</span>
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-[#141416] border border-[#26262a] rounded-xl p-3 flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Left: View Mode Segmented Switcher & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-[#26262a]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#00d4a4] text-[#0a0a0a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#00d4a4] text-[#0a0a0a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#00d4a4] text-[#0a0a0a]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search month posts..."
              className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00d4a4]"
            />
          </div>
        </div>

        {/* Right: Category, Platform, Status Filters & Exports */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-[#0a0a0a] border border-[#26262a] text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter / X</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0a0a0a] border border-[#26262a] text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0a0a0a] border border-[#26262a] text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>

          <button
            onClick={handleExportCSV}
            disabled={monthPosts.length === 0}
            className="btn-pill-dark p-2 text-xs text-neutral-300 hover:text-white disabled:opacity-30"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00d4a4]" />
          </button>

          <button
            onClick={handleExportJSON}
            disabled={monthPosts.length === 0}
            className="btn-pill-dark p-2 text-xs text-neutral-300 hover:text-white disabled:opacity-30"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#00d4a4]" />
          </button>

          <button
            onClick={handleApproveAllDrafts}
            disabled={monthPosts.length === 0}
            className="btn-pill-dark px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white flex items-center space-x-1 disabled:opacity-30"
            title="Approve All Drafts for this Month"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span className="hidden sm:inline">Approve All</span>
          </button>

          {monthPosts.length > 0 && (
            <button
              onClick={handleClearMonthPosts}
              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              title={`Clear ${currentMonthYearString} posts`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE MONTHLY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-[#141416] border border-[#26262a] rounded-2xl overflow-hidden shadow-xl">
          
          {/* Calendar Header Weekdays */}
          <div className="grid grid-cols-7 border-b border-[#26262a] bg-[#0a0a0a] text-center font-mono-code text-[11px] font-bold text-neutral-400 py-3">
            {WEEKDAY_NAMES.map((day, idx) => (
              <div key={idx} className={idx === 0 || idx === 6 ? 'text-neutral-500' : 'text-neutral-300'}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr gap-[1px] bg-[#26262a]">
            {/* Empty Offset Cells for previous month days */}
            {Array.from({ length: calendarDays.firstDayIndex }).map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-[#0e0e10]/60 min-h-[140px] p-2 opacity-30 select-none" />
            ))}

            {/* Current Month Day Cells */}
            {Array.from({ length: calendarDays.daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayPosts = calendarDays.postsByDay[dayNum] || [];
              const isToday = new Date().toISOString().split('T')[0] === formattedDate;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`bg-[#141416] min-h-[140px] p-2 flex flex-col justify-between transition-colors group relative hover:bg-[#18181b] ${
                    isToday ? 'ring-1 ring-[#00d4a4] ring-inset' : ''
                  }`}
                >
                  {/* Day Number Header & Add Post Trigger */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-mono-code font-bold px-1.5 py-0.5 rounded ${
                      isToday 
                        ? 'bg-[#00d4a4] text-[#0a0a0a]' 
                        : dayPosts.length > 0
                        ? 'text-white'
                        : 'text-neutral-500'
                    }`}>
                      {dayNum}
                    </span>

                    <button
                      onClick={() => setNewPostDate(formattedDate)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-[#0a0a0a] text-neutral-400 hover:text-[#00d4a4] hover:bg-[#26262a] border border-[#26262a] transition-all"
                      title={`Add post on ${formattedDate}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Scheduled Posts for this Day */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[120px]">
                    {dayPosts.map((post) => {
                      const statusColor = 
                        post.status === 'published' ? 'border-[#00d4a4]/40 bg-[#00d4a4]/10 text-[#00d4a4]' :
                        post.status === 'scheduled' ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' :
                        'border-neutral-700 bg-neutral-800/80 text-neutral-300';

                      return (
                        <div
                          key={post.id}
                          onClick={() => setPreviewPost(post)}
                          className={`p-1.5 rounded-lg border text-[11px] cursor-pointer transition-all hover:scale-[1.02] shadow-xs ${statusColor}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center space-x-1">
                              {post.platforms.slice(0, 2).map((pl, pIdx) => (
                                <span key={pIdx} className="text-current opacity-80">
                                  {getSocialIcon(pl, "w-2.5 h-2.5")}
                                </span>
                              ))}
                            </div>
                            <span className="text-[9px] font-mono-code opacity-75">{post.scheduledTime}</span>
                          </div>

                          <p className="font-semibold text-white truncate text-[10px] leading-tight">
                            {post.title}
                          </p>
                        </div>
                      );
                    })}

                    {dayPosts.length === 0 && (
                      <div 
                        onClick={() => setNewPostDate(formattedDate)}
                        className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] text-neutral-500 hover:text-[#00d4a4] border border-dashed border-[#26262a] hover:border-[#00d4a4]/40 rounded-lg p-2 transition-all"
                      >
                        + Schedule Post
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 30-DAY CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#141416] border border-[#26262a] hover:border-[#3f3f46] rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Visual Asset Container */}
                <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden border-b border-[#26262a]">
                  <PostGraphicCard
                    key={post.imageUrl || post.id}
                    post={post}
                    primaryColor={client.brandColors[0] || '#00d4a4'}
                    secondaryColor={client.brandColors[1] || '#3772cf'}
                    className="group-hover:scale-102 transition-transform duration-300"
                  />
                  
                  {/* Generation Loading Overlay */}
                  {generatingImagePostId === post.id && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
                      <Sparkles className="w-6 h-6 text-[#00d4a4] animate-spin" />
                      <span className="text-[11px] font-bold text-white">Synthesizing with Gemini...</span>
                    </div>
                  )}
                  
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
                </div>

                {/* Body */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono-code bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#26262a]">
                        <Clock className="w-3 h-3 text-[#00d4a4]" />
                        {post.scheduledTime}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono-code">{post.scheduledDate}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {post.platforms.map((pl, pIdx) => (
                        <span key={pIdx} title={pl} className="text-neutral-400">
                          {getSocialIcon(pl, "w-3.5 h-3.5")}
                        </span>
                      ))}
                    </div>
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
                    onClick={() => setReschedulingPost(post)}
                    className="btn-pill-dark py-1 px-2.5 text-[11px] font-semibold flex items-center justify-center space-x-1"
                    title="Reschedule Date & Time"
                  >
                    <CalendarIcon className="w-3 h-3 text-[#00d4a4]" />
                    <span>Date</span>
                  </button>

                  <button
                    onClick={() => handleGeneratePostImage(post)}
                    disabled={generatingImagePostId === post.id}
                    className="btn-pill-dark py-1 px-2.5 text-[11px] font-semibold flex items-center justify-center space-x-1 border-[#00d4a4]/30 hover:border-[#00d4a4]/60 disabled:opacity-50"
                    title="Generate Image with Gemini"
                  >
                    <ImageIcon className={`w-3 h-3 text-[#00d4a4] ${generatingImagePostId === post.id ? 'animate-spin' : ''}`} />
                    <span>AI Image</span>
                  </button>

                  <button
                    onClick={() => onOpenStudioForPost(post)}
                    className="btn-pill-dark py-1 px-2.5 text-[11px] font-semibold flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-neutral-400" />
                    <span>Studio</span>
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
                  title="Delete post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: COMPACT LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#141416] border border-[#26262a] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0a0a] border-b border-[#26262a] text-neutral-400 font-mono-code uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Date / Day</th>
                  <th className="p-3.5">Title & Caption</th>
                  <th className="p-3.5">Channels</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262a]">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#18181b] transition-colors">
                    <td className="p-3.5 pl-5 font-mono-code whitespace-nowrap">
                      <div className="text-white font-bold">Day {post.dayNumber}</div>
                      <div className="text-[11px] text-neutral-500">{post.scheduledDate} · {post.scheduledTime}</div>
                    </td>
                    <td className="p-3.5 max-w-sm">
                      <div className="text-white font-bold truncate">{post.title}</div>
                      <div className="text-neutral-400 truncate text-[11px] mt-0.5">{post.caption}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        {post.platforms.map((pl, pIdx) => (
                          <span key={pIdx} title={pl} className="text-neutral-400">
                            {getSocialIcon(pl, "w-3.5 h-3.5")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#0a0a0a] text-neutral-300 border border-[#26262a] text-[10px] font-mono-code">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        post.status === 'published'
                          ? 'bg-[#00d4a4]/20 text-[#00d4a4] border border-[#00d4a4]/30'
                          : post.status === 'scheduled'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="btn-pill-dark p-1.5 text-neutral-300 hover:text-white"
                          title="Preview Post"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPost(post)}
                          className="btn-pill-dark p-1.5 text-neutral-300 hover:text-white"
                          title="Edit Post"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setReschedulingPost(post)}
                          className="btn-pill-dark p-1.5 text-neutral-300 hover:text-white"
                          title="Reschedule Date"
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-[#00d4a4]" />
                        </button>
                        <button
                          onClick={() => onOpenStudioForPost(post)}
                          className="btn-pill-dark p-1.5 text-neutral-300 hover:text-white"
                          title="Open in Prompt Studio"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
                        </button>
                        <button
                          onClick={() => onOpenPublisherForPost(post)}
                          className="btn-mint px-2.5 py-1 text-xs font-bold shadow-xs"
                          title="Publish Post"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State when active month has no posts */}
      {monthPosts.length === 0 && (
        <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#00d4a4]/10 border border-[#00d4a4]/20 flex items-center justify-center mx-auto text-[#00d4a4]">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Posts Scheduled for {currentMonthYearString}</h3>
            <p className="text-xs text-neutral-400">
              Each month maintains its own distinct campaign schedule. Generate a tailored {currentMonthYearString} strategy for <strong className="text-white">{client.name}</strong> or schedule individual dates on the calendar above.
            </p>
          </div>
          <button
            onClick={() => handleRegenerateMonth()}
            disabled={isRegenerating}
            className="btn-mint px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#00d4a4]/20 inline-flex items-center space-x-2"
          >
            <Sparkles className={`w-4 h-4 text-[#0a0a0a] ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Gemini AI Generating...' : `Auto-Generate ${currentMonthYearString} Posts`}</span>
          </button>
        </div>
      )}

      {/* MODAL 1: POST PREVIEW MODAL */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="relative aspect-video bg-[#0a0a0a] border-b border-[#26262a]">
              <PostGraphicCard
                post={previewPost}
                primaryColor={client.brandColors[0] || '#00d4a4'}
                secondaryColor={client.brandColors[1] || '#3772cf'}
              />
              <button
                onClick={() => setPreviewPost(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-1.5 rounded-full border border-white/20 z-20"
              >
                ×
              </button>
            </div>

            <div className="p-6 pt-0 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00d4a4]/10 text-[#00d4a4] font-mono-code font-bold text-xs border border-[#00d4a4]/30">
                    DAY {previewPost.dayNumber}
                  </span>
                  <span className="text-xs font-bold text-white uppercase">{previewPost.category}</span>
                </div>
                <span className="text-xs text-neutral-400 font-mono-code">{previewPost.scheduledDate} at {previewPost.scheduledTime}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">{previewPost.title}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">{previewPost.caption}</p>
                <div className="bg-[#0a0a0a] border border-[#26262a] rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono-code text-[11px]">CTA Target:</span>
                  <a href={previewPost.targetUrl} target="_blank" rel="noreferrer" className="text-[#00d4a4] font-mono-code hover:underline flex items-center gap-1">
                    <span>{previewPost.targetUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#26262a]">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const p = previewPost;
                      setPreviewPost(null);
                      setEditingPost(p);
                    }}
                    className="btn-pill-dark px-3 py-1.5 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      const p = previewPost;
                      setPreviewPost(null);
                      setReschedulingPost(p);
                    }}
                    className="btn-pill-dark px-3 py-1.5 text-xs font-semibold flex items-center space-x-1"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#00d4a4]" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => {
                      const p = previewPost;
                      setPreviewPost(null);
                      onOpenStudioForPost(p);
                    }}
                    className="btn-pill-dark px-3 py-1.5 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00d4a4]" />
                    <span>Studio</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const p = previewPost;
                    setPreviewPost(null);
                    onOpenPublisherForPost(p);
                  }}
                  className="btn-mint px-4 py-1.5 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Channels</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE DATE MODAL */}
      {reschedulingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-[#00d4a4]" />
                <h3 className="text-base font-bold text-white">Reschedule Post</h3>
              </div>
              <button
                onClick={() => setReschedulingPost(null)}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
              <div>
                <p className="text-neutral-300 font-semibold mb-1 truncate">{reschedulingPost.title}</p>
                <p className="text-neutral-500 text-[11px]">Choose a new date and time slot on the calendar.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reschedulingPost.scheduledDate}
                    onChange={(e) => setReschedulingPost({ ...reschedulingPost, scheduledDate: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Time Slot *
                  </label>
                  <input
                    type="text"
                    required
                    value={reschedulingPost.scheduledTime}
                    onChange={(e) => setReschedulingPost({ ...reschedulingPost, scheduledTime: e.target.value })}
                    placeholder="09:30 AM"
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                  Post Status
                </label>
                <select
                  value={reschedulingPost.status}
                  onChange={(e) => setReschedulingPost({ ...reschedulingPost, status: e.target.value as any })}
                  className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#26262a]">
                <button
                  type="button"
                  onClick={() => setReschedulingPost(null)}
                  className="btn-pill-dark px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-mint px-5 py-2 font-bold flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Update Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW POST ON DATE MODAL */}
      {newPostDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-[#00d4a4]" />
                <h3 className="text-base font-bold text-white">Add Post on {newPostDate}</h3>
              </div>
              <button
                onClick={() => setNewPostDate(null)}
                className="text-neutral-400 hover:text-white font-bold text-lg px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreatePostOnDate} className="space-y-4 text-xs">
              <p className="text-neutral-400">Schedule a new content card directly on <strong className="text-white">{newPostDate}</strong> for {client.name}.</p>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#26262a]">
                <button
                  type="button"
                  onClick={() => setNewPostDate(null)}
                  className="btn-pill-dark px-4 py-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-mint px-5 py-2 font-bold flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create & Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CUSTOM AI GENERATOR SETTINGS */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#00d4a4]" />
                <h3 className="text-base font-bold text-white">Custom AI Post Synthesizer for {currentMonthYearString}</h3>
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
                  Primary Focus Campaign Topic for {MONTH_NAMES[selectedMonth]}
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
                  <span>{isRegenerating ? 'Synthesizing...' : `Generate ${MONTH_NAMES[selectedMonth]} Campaign`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: FULL POST EDIT MODAL */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26262a] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Day {editingPost.dayNumber} Post</h3>
                <p className="text-xs text-neutral-400">Update post title, copy, scheduled date, and CTA link</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={editingPost.scheduledDate}
                    onChange={(e) => setEditingPost({ ...editingPost, scheduledDate: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#00d4a4]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 uppercase tracking-wider mb-1 text-[10px]">
                    Category
                  </label>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value as PostCategory })}
                    className="w-full bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    {ALL_CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
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
