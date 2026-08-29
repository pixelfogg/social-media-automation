import React, { useState } from 'react';
import type { Client, SocialPost } from '../types';
import { BrandAnalyzer } from './BrandAnalyzer';
import { BrandGuidePage } from './BrandGuidePage';
import { MonthContentPlanner } from './MonthContentPlanner';
import { ImagePromptStudio } from './ImagePromptStudio';
import { PublisherQueue } from './PublisherQueue';
import { 
  Globe, 
  FileCode, 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  Key, 
  ExternalLink,
  Share2
} from 'lucide-react';
import { getSocialIcon } from './SocialIcons';

export type ClientDashboardTab = 
  | 'overview' 
  | 'brand_guide_md' 
  | 'planner' 
  | 'studio' 
  | 'publisher';

interface ClientDashboardProps {
  client: Client;
  activeTab?: ClientDashboardTab;
  onTabChange?: (tab: ClientDashboardTab) => void;
  onUpdateClient: (updatedClient: Client) => void;
  onUpdatePost: (updatedPost: SocialPost) => void;
  onOpenConnectSocialModal: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  client,
  activeTab: controlledTab,
  onTabChange,
  onUpdateClient,
  onUpdatePost,
  onOpenConnectSocialModal
}) => {
  const [internalTab, setInternalTab] = useState<ClientDashboardTab>('overview');
  const [selectedStudioPost, setSelectedStudioPost] = useState<SocialPost | null>(null);
  const [selectedPublisherPost, setSelectedPublisherPost] = useState<SocialPost | null>(null);

  const activeTab = controlledTab || internalTab;

  const handleTabClick = (tab: ClientDashboardTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const posts = client.posts || [];
  const socialAccounts = client.socialAccounts || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Client Header Workspace Bar */}
      <div className="bg-[#141416] border border-[#26262a] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] border border-[#26262a] flex items-center justify-center p-1.5 overflow-hidden">
            <img
              src={client.logoDarkUrl || client.logoLightUrl || client.logoUrl}
              alt={client.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {client.name}
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#00d4a4]/10 text-[#00d4a4] border border-[#00d4a4]/20">
                Active Client Workspace
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center space-x-2">
              <span className="text-[#00d4a4] font-semibold">{client.industry}</span>
              <span>•</span>
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white underline font-mono-code inline-flex items-center gap-1"
              >
                <span>{client.websiteUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Connected Socials Bar & Authorize Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-[#0a0a0a] border border-[#26262a] rounded-xl px-3 py-2 text-xs">
            <Share2 className="w-3.5 h-3.5 text-[#00d4a4]" />
            <span className="text-neutral-400 font-semibold">Linked:</span>
            <div className="flex items-center space-x-1">
              {socialAccounts.map((sa) => (
                <span key={sa.id} title={sa.handle}>
                  {getSocialIcon(sa.platform, "w-3.5 h-3.5 text-neutral-300")}
                </span>
              ))}
              {socialAccounts.length === 0 && (
                <span className="text-neutral-500 text-[11px]">No accounts connected</span>
              )}
            </div>
          </div>

          <button
            onClick={onOpenConnectSocialModal}
            className="btn-mint flex items-center space-x-1.5 px-4 py-2 text-xs font-bold shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-[#0a0a0a]" />
            <span>Connect Accounts ({socialAccounts.length})</span>
          </button>
        </div>
      </div>

      {/* CLIENT DASHBOARD SUB-NAVIGATION TAB BAR */}
      <div className="bg-[#141416] border border-[#26262a] rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-1 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => handleTabClick('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Overview & Accounts</span>
          </button>

          <button
            onClick={() => handleTabClick('brand_guide_md')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'brand_guide_md'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Brand Guide (DESIGN.md)</span>
          </button>

          <button
            onClick={() => handleTabClick('planner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'planner'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>30-Day Content Planner</span>
          </button>

          <button
            onClick={() => handleTabClick('studio')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'studio'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>AI Visual Studio</span>
          </button>

          <button
            onClick={() => handleTabClick('publisher')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'publisher'
                ? 'bg-[#00d4a4] text-[#0a0a0a]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0a0a0a]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publishing Hub</span>
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-2 px-3 text-[11px] text-neutral-400 font-mono-code">
          <span>Posts Queue:</span>
          <span className="text-[#00d4a4] font-bold">{posts.length} Days Ready</span>
        </div>
      </div>

      {/* DASHBOARD TAB CONTENTS */}
      <div className="pt-2">
        {/* Tab 1: Overview & Accounts */}
        {activeTab === 'overview' && (
          <BrandAnalyzer
            client={client}
            onUpdateClient={onUpdateClient}
            onOpenConnectSocialModal={onOpenConnectSocialModal}
          />
        )}

        {/* Tab 2: Dedicated Brand Guide (DESIGN.md) & Visual Showcase */}
        {activeTab === 'brand_guide_md' && (
          <BrandGuidePage
            client={client}
            onUpdateClient={onUpdateClient}
          />
        )}

        {/* Tab 3: 30-Day Content Planner */}
        {activeTab === 'planner' && (
          <MonthContentPlanner
            client={client}
            onUpdateClient={onUpdateClient}
            onOpenStudioForPost={(post: SocialPost) => {
              setSelectedStudioPost(post);
              handleTabClick('studio');
            }}
            onOpenPublisherForPost={(post: SocialPost) => {
              setSelectedPublisherPost(post);
              handleTabClick('publisher');
            }}
          />
        )}

        {/* Tab 4: AI Visual & Prompt Studio */}
        {activeTab === 'studio' && (
          <ImagePromptStudio
            client={client}
            selectedPost={selectedStudioPost}
            onSelectPost={setSelectedStudioPost}
            onUpdatePost={onUpdatePost}
          />
        )}

        {/* Tab 5: Publishing Hub & Daily Push Scheduler */}
        {activeTab === 'publisher' && (
          <PublisherQueue
            client={client}
            selectedPost={selectedPublisherPost}
            onUpdateClient={onUpdateClient}
            onUpdatePost={onUpdatePost}
          />
        )}
      </div>
    </div>
  );
};
