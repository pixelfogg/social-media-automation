import React, { useState } from 'react';
import type { Client, SocialPost } from '../types';
import { 
  Send, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Play, 
  Pause, 
  Calendar, 
  Activity
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';
import confetti from 'canvas-confetti';

interface PublisherQueueProps {
  client: Client;
  selectedPost: SocialPost | null;
  onUpdateClient: (updatedClient: Client) => void;
  onUpdatePost: (updatedPost: SocialPost) => void;
}

export const PublisherQueue: React.FC<PublisherQueueProps> = ({
  client,
  selectedPost,
  onUpdateClient,
  onUpdatePost
}) => {
  const posts = client.posts || [];
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'immediate' | 'daily_scheduler'>('immediate');
  const [selectedPostForImmediate, setSelectedPostForImmediate] = useState<SocialPost>(selectedPost || posts[0]);
  const [publishingLogs, setPublishingLogs] = useState<string[]>([]);

  const handlePostNow = (postToPublish: SocialPost) => {
    setPublishingId(postToPublish.id);
    setPublishingLogs([`Initializing API dispatch for ${client.name}...`]);

    setTimeout(() => {
      setPublishingLogs(prev => [...prev, `Connecting to Facebook Graph API (@${client.name})... Success [200 OK]`]);
    }, 600);

    setTimeout(() => {
      setPublishingLogs(prev => [...prev, `Uploading image asset to Instagram Business API... Success [200 OK]`]);
    }, 1200);

    setTimeout(() => {
      setPublishingLogs(prev => [...prev, `Publishing post copy to LinkedIn REST API... Success [200 OK]`]);
    }, 1800);

    setTimeout(() => {
      const updated: SocialPost = {
        ...postToPublish,
        status: 'published',
        publishedAt: new Date().toISOString(),
        engagementMetrics: {
          likes: Math.floor(Math.random() * 250) + 80,
          shares: Math.floor(Math.random() * 40) + 10,
          comments: Math.floor(Math.random() * 30) + 5,
          clicks: Math.floor(Math.random() * 150) + 40
        }
      };

      onUpdatePost(updated);
      setPublishingId(null);
      setPublishingLogs(prev => [...prev, `🎉 Post Day ${postToPublish.dayNumber} successfully published across channels!`]);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 2400);
  };

  const handleToggleDailySchedule = () => {
    const updatedClient = {
      ...client,
      dailyScheduleEnabled: !client.dailyScheduleEnabled
    };
    onUpdateClient(updatedClient);
  };

  const handleUpdateScheduleTime = (time: string) => {
    const updatedClient = {
      ...client,
      dailyScheduleTime: time
    };
    onUpdateClient(updatedClient);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Mintlify Header Banner */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#00d4a4]" />
              Publishing Engine
            </span>
            <span className="text-xs text-neutral-400">Client: {client.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Instant Publishing & Daily Push Scheduler
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Dispatch posts immediately or configure the daily 1-post automated push scheduler.
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center space-x-1 bg-[#0a0a0a] p-1 rounded-full border border-[#26262a]">
          <button
            onClick={() => setActiveTab('immediate')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'immediate'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Post Immediately</span>
          </button>

          <button
            onClick={() => setActiveTab('daily_scheduler')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'daily_scheduler'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Push Daily 1 Post</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Post Immediately */}
      {activeTab === 'immediate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Post Selection Drawer */}
          <div className="lg:col-span-5 bg-[#141416] border border-[#26262a] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00d4a4]" />
              Select Post to Publish Now
            </h3>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {posts.map((post) => {
                const isSelected = selectedPostForImmediate?.id === post.id;
                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostForImmediate(post)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#0a0a0a] border-[#00d4a4] ring-1 ring-[#00d4a4]/30'
                        : 'bg-[#0a0a0a] border-[#26262a] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#141416] rounded border border-[#26262a] font-mono-code">
                        DAY {post.dayNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        post.status === 'published' ? 'bg-[#00d4a4]/20 text-[#00d4a4]' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{post.title}</h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">{post.caption}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Post Preview & API Dispatch Log */}
          <div className="lg:col-span-7 space-y-6">
            {selectedPostForImmediate && (
              <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between border-b border-[#26262a] pb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedPostForImmediate.imageUrl}
                      alt={selectedPostForImmediate.title}
                      className="w-16 h-16 rounded-xl object-cover border border-[#26262a]"
                    />
                    <div>
                      <span className="text-[10px] text-[#00d4a4] font-bold uppercase font-mono-code">
                        DAY {selectedPostForImmediate.dayNumber} • {selectedPostForImmediate.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{selectedPostForImmediate.title}</h3>
                      <p className="text-xs text-neutral-500 font-mono-code">Date: {selectedPostForImmediate.scheduledDate}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePostNow(selectedPostForImmediate)}
                    disabled={publishingId === selectedPostForImmediate.id}
                    className="btn-mint flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${publishingId === selectedPostForImmediate.id ? 'animate-spin' : ''}`} />
                    <span>{publishingId === selectedPostForImmediate.id ? 'Publishing...' : 'Post Now'}</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Connected Social Channels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {client.socialAccounts.map((acc) => (
                      <div key={acc.id} className="flex items-center space-x-2 bg-[#0a0a0a] border border-[#26262a] rounded-lg px-3 py-1.5 text-xs">
                        {getSocialIcon(acc.platform, "w-3.5 h-3.5")}
                        <span className="font-semibold text-neutral-200 text-[11px]">{acc.handle}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00d4a4]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 text-xs text-neutral-300 space-y-1">
                  <span className="font-semibold text-neutral-400 text-[11px] block">Post Copy:</span>
                  <p className="whitespace-pre-line leading-relaxed text-xs">{selectedPostForImmediate.caption}</p>
                </div>

                {publishingLogs.length > 0 && (
                  <div className="bg-[#1c1c1e] border border-[#26262a] rounded-xl p-4 space-y-1 font-mono-code text-xs">
                    <div className="flex items-center justify-between text-neutral-400 text-[10px] border-b border-[#26262a] pb-1 mb-2 font-sans font-semibold">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-[#00d4a4]" />
                        API Dispatch Log
                      </span>
                      <span>Mintlify Gateway</span>
                    </div>
                    {publishingLogs.map((log, idx) => (
                      <div key={idx} className="text-[#00d4a4] flex items-center gap-2">
                        <span>&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Push Daily 1 Post */}
      {activeTab === 'daily_scheduler' && (
        <div className="space-y-6">
          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Daily 1-Post Push Automation</h3>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  client.dailyScheduleEnabled
                    ? 'bg-[#00d4a4]/10 text-[#00d4a4] border-[#00d4a4]/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}>
                  {client.dailyScheduleEnabled ? '● ACTIVE' : '○ PAUSED'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Pushes 1 post automatically every day at your configured release time across connected social handles.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-[#0a0a0a] p-2 rounded-xl border border-[#26262a]">
              <div className="flex flex-col px-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Release Time</span>
                <select
                  value={client.dailyScheduleTime || '09:30 AM'}
                  onChange={(e) => handleUpdateScheduleTime(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="08:00 AM" className="bg-[#141416]">08:00 AM EST</option>
                  <option value="09:30 AM" className="bg-[#141416]">09:30 AM EST</option>
                  <option value="11:00 AM" className="bg-[#141416]">11:00 AM EST</option>
                  <option value="02:30 PM" className="bg-[#141416]">02:30 PM EST</option>
                </select>
              </div>

              <button
                onClick={handleToggleDailySchedule}
                className={`flex items-center space-x-1.5 font-bold text-xs px-4 py-2 rounded-lg transition-all ${
                  client.dailyScheduleEnabled
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'btn-mint'
                }`}
              >
                {client.dailyScheduleEnabled ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Automation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Enable Automation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00d4a4]" />
              Automated 30-Day Queue Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#0a0a0a] border border-[#26262a] rounded-xl p-3.5 space-y-2 hover:border-[#3f3f46] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded bg-[#00d4a4] text-[#0a0a0a] font-bold text-[10px] font-mono-code flex items-center justify-center">
                        D{post.dayNumber}
                      </span>
                      <span className="font-mono-code text-neutral-300">{post.scheduledDate}</span>
                    </div>

                    <span className="text-[10px] font-bold text-[#00d4a4] bg-[#00d4a4]/10 px-2 py-0.5 rounded font-mono-code">
                      {client.dailyScheduleTime}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{post.title}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{post.caption}</p>

                  <div className="pt-2 border-t border-[#26262a] flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500">Channels:</span>
                    <div className="flex items-center space-x-1">
                      {post.platforms.map((pl, idx) => (
                        <span key={idx}>{getSocialIcon(pl, "w-3 h-3 text-neutral-300")}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
