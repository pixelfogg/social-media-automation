export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'pinterest';

export type BrandTone = 
  | 'Professional & Authoritative'
  | 'Bold, Energetic & Direct'
  | 'Witty, Trendy & Casual'
  | 'Empathetic & Warm'
  | 'Luxury & Minimalist';

export type PostCategory = 
  | 'Educational & Tips'
  | 'Product Spotlight'
  | 'Behind The Scenes'
  | 'Thought Leadership'
  | 'Social Proof & Case Study'
  | 'Promotional & Offer';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  connected: boolean;
  followerCount: number;
  avatarUrl?: string;
  pageId?: string;
  accessToken?: string;
  connectedAt?: string;
  statusMessage?: string;
}

export interface CrawledPage {
  title: string;
  url: string;
  summary: string;
  keywords: string[];
}

export interface BrandAnalysis {
  analyzedAt: string;
  crawledPages: CrawledPage[];
  extractedTone: string;
  visualMood: string;
  contentPillars: string[];
  recommendedHashtagClusters: string[];
  targetAudiencePersona: string;
  brandHealthScore: number;
  designMd: string; // Dynamic generated Markdown Brand Guide following design specification
}

export interface SocialPost {
  id: string;
  clientId: string;
  dayNumber: number; // 1 - 30
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. "10:30 AM"
  title: string;
  category: PostCategory;
  platforms: SocialPlatform[];
  caption: string;
  description: string;
  cta: string;
  targetUrl: string;
  hashtags: string[];
  imagePrompt: string;
  imageUrl?: string;
  imageSource: 'ai_generated' | 'uploaded' | 'preset';
  status: 'draft' | 'scheduled' | 'published';
  publishedAt?: string;
  engagementMetrics?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
}

export interface GenerationSettings {
  targetMonth: string; // e.g. "September 2026"
  primaryFocusTopic: string;
  toneOverride?: BrandTone;
  targetPlatforms: SocialPlatform[];
}

export interface Client {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  industry: string;
  brandGuideText: string;
  tone: BrandTone;
  targetAudience: string;
  brandColors: string[];
  socialAccounts: SocialAccount[];
  brandAnalysis?: BrandAnalysis;
  posts: SocialPost[];
  createdAt: string;
  dailyScheduleEnabled: boolean;
  dailyScheduleTime: string;
}
