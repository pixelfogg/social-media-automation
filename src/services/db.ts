import type { Client, SocialPost } from '../types';
import { analyzeBrandAndWebsite, generate30DayCalendar } from './aiGenerator';

const DB_STORAGE_KEY = 'socialpulse_ai_clients_db_v1';
const ACTIVE_CLIENT_KEY = 'socialpulse_ai_active_client_id';

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client_1',
    name: 'Nexus Tech Solutions',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    websiteUrl: 'https://nexustechsolutions.io',
    industry: 'Enterprise Software & Cloud AI',
    brandGuideText: 'Nexus Tech represents cutting-edge enterprise automation. Tone must be authoritative, sophisticated, and results-focused. Primary color is Electric Indigo (#6366F1), secondary is Deep Violet (#4F46E5). Target B2B decision makers.',
    tone: 'Professional & Authoritative',
    targetAudience: 'CTOs, VPs of Engineering, IT Directors at Mid-to-Enterprise companies',
    brandColors: ['#6366F1', '#4F46E5', '#06B6D4'],
    socialAccounts: [
      { id: 'sa_1', platform: 'linkedin', handle: 'nexus-tech-solutions', connected: true, followerCount: 42800 },
      { id: 'sa_2', platform: 'twitter', handle: '@NexusTechAI', connected: true, followerCount: 18500 },
      { id: 'sa_3', platform: 'facebook', handle: 'NexusTechOfficial', connected: true, followerCount: 12400 }
    ],
    posts: [],
    createdAt: '2026-08-01',
    dailyScheduleEnabled: true,
    dailyScheduleTime: '09:30 AM'
  },
  {
    id: 'client_2',
    name: 'Apex Growth Agency',
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    websiteUrl: 'https://apexgrowth.agency',
    industry: 'Performance Marketing & Brand Scaling',
    brandGuideText: 'Apex Growth helps D2C brands scale from 6 to 8 figures. Tone is bold, high-energy, direct, and ROI-driven. Primary color is Crimson Red (#EF4444) and Sunset Amber (#F59E0B).',
    tone: 'Bold, Energetic & Direct',
    targetAudience: 'E-commerce Founders, Marketing VPs, DTC Brand Directors',
    brandColors: ['#EF4444', '#F59E0B', '#10B981'],
    socialAccounts: [
      { id: 'sa_4', platform: 'instagram', handle: '@apexgrowth agency', connected: true, followerCount: 89300 },
      { id: 'sa_5', platform: 'linkedin', handle: 'apex-growth-agency', connected: true, followerCount: 31200 },
      { id: 'sa_6', platform: 'tiktok', handle: '@apexgrowth', connected: true, followerCount: 145000 }
    ],
    posts: [],
    createdAt: '2026-08-05',
    dailyScheduleEnabled: true,
    dailyScheduleTime: '11:00 AM'
  },
  {
    id: 'client_4',
    name: 'Vanguard Peak Fitness',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
    websiteUrl: 'https://vanguardpeakfitness.com',
    industry: 'High-Performance Athletics & Wellness',
    brandGuideText: 'Vanguard Peak provides elite athletic training equipment and biohacking guidance. Tone is empowering, passionate, and relentless. Primary color Emerald Green (#10B981) and Obsidian Black (#0F172A).',
    tone: 'Empathetic & Warm',
    targetAudience: 'Athletes, fitness professionals, and wellness conscious individuals aged 22-45',
    brandColors: ['#10B981', '#059669', '#3B82F6'],
    socialAccounts: [
      { id: 'sa_7', platform: 'instagram', handle: '@vanguardpeakfit', connected: true, followerCount: 64200 },
      { id: 'sa_8', platform: 'facebook', handle: 'VanguardPeakFitness', connected: true, followerCount: 22100 },
      { id: 'sa_9', platform: 'pinterest', handle: 'vanguardfitness', connected: true, followerCount: 15400 }
    ],
    posts: [],
    createdAt: '2026-08-10',
    dailyScheduleEnabled: false,
    dailyScheduleTime: '08:00 AM'
  },
  {
    id: 'client_5',
    name: 'Lumina Organic Skincare',
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80',
    websiteUrl: 'https://luminaskincare.co',
    industry: 'Clean Beauty & Eco Luxury',
    brandGuideText: 'Lumina creates 100% organic botanical skincare formulas. Tone is serene, minimalist, luxury, and educational. Primary palette Rose Gold (#F43F5E) and Pearl Blush (#FCE7F3).',
    tone: 'Luxury & Minimalist',
    targetAudience: 'Eco-conscious skincare consumers, spa enthusiasts, luxury lifestyle shoppers',
    brandColors: ['#F43F5E', '#EC4899', '#8B5CF6'],
    socialAccounts: [
      { id: 'sa_10', platform: 'instagram', handle: '@luminaskincare', connected: true, followerCount: 112000 },
      { id: 'sa_11', platform: 'pinterest', handle: 'luminaorganic', connected: true, followerCount: 54300 },
      { id: 'sa_12', platform: 'tiktok', handle: '@luminabeauty', connected: true, followerCount: 87100 }
    ],
    posts: [],
    createdAt: '2026-08-15',
    dailyScheduleEnabled: true,
    dailyScheduleTime: '01:00 PM'
  }
];

export function getClients(): Client[] {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      const initialized = INITIAL_CLIENTS.map(client => {
        const brandAnalysis = analyzeBrandAndWebsite(client);
        const posts = generate30DayCalendar(client);
        return {
          ...client,
          brandAnalysis,
          posts
        };
      });
      saveClients(initialized);
      return initialized;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse database from LocalStorage:', err);
    return INITIAL_CLIENTS;
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed to save database to LocalStorage:', err);
  }
}

export function getActiveClientId(): string {
  const stored = localStorage.getItem(ACTIVE_CLIENT_KEY);
  if (stored) return stored;
  const clients = getClients();
  return clients[0]?.id || 'client_1';
}

export function setActiveClientId(id: string): void {
  localStorage.setItem(ACTIVE_CLIENT_KEY, id);
}

export function updateClient(updatedClient: Client): Client[] {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === updatedClient.id);
  if (index !== -1) {
    clients[index] = updatedClient;
  } else {
    clients.push(updatedClient);
  }
  saveClients(clients);
  return clients;
}

export function deleteClient(id: string): Client[] {
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
  return clients;
}

export function updatePostInClient(clientId: string, updatedPost: SocialPost): Client[] {
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (client) {
    const postIdx = client.posts.findIndex(p => p.id === updatedPost.id);
    if (postIdx !== -1) {
      client.posts[postIdx] = updatedPost;
    } else {
      client.posts.push(updatedPost);
    }
    return updateClient(client);
  }
  return clients;
}
