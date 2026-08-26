import type { Client, BrandAnalysis, SocialPost, PostCategory, SocialPlatform } from '../types';

const CATEGORIES: PostCategory[] = [
  'Educational & Tips',
  'Product Spotlight',
  'Behind The Scenes',
  'Thought Leadership',
  'Social Proof & Case Study',
  'Promotional & Offer'
];

const PLATFORM_PRESETS: SocialPlatform[][] = [
  ['instagram', 'facebook'],
  ['linkedin', 'twitter'],
  ['instagram', 'tiktok', 'facebook'],
  ['linkedin', 'facebook'],
  ['instagram', 'pinterest', 'facebook'],
  ['twitter', 'linkedin']
];

export function generateBrandGuideDesignMd(client: Client): string {
  const primaryColor = client.brandColors[0] || '#00d4a4';
  const secondaryColor = client.brandColors[1] || '#3772cf';
  const darkInk = client.brandColors[2] || '#0a0a0a';
  const cleanDomain = client.websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  return `## Brand Guide — ${client.name} (` + cleanDomain + `)

## Overview

${client.name} operates in the **${client.industry}** domain. The visual identity reads as modern, authoritative, and developer-grade. The brand pairs a deep dark canvas \`{colors.canvas}\` (\`${darkInk}\`) with a high-contrast ink text and a saturated primary accent \`{colors.primary}\` (\`${primaryColor}\`) for conversion targets.

The tone is **${client.tone}**. Typography relies on \`Inter\` for body and UI elements, paired with clean geometric headings. Components feature \`rounded-md\` (12px) borders and crisp hairline strokes (\`#26262a\`).

**Key Characteristics:**
- **Primary Conversion Accent**: \`{colors.primary}\` (\`${primaryColor}\`) — used selectively for CTAs, badges, and active state indicators.
- **Secondary Accent**: \`{colors.secondary}\` (\`${secondaryColor}\`) — used for supporting data highlights and gradient overlays.
- **Deep Surface Canvas**: \`{colors.canvas}\` (\`${darkInk}\`) — clean ultra-dark mode background.
- **Card Radius**: \`{rounded.md}\` (12px) for buttons and cards.
- **Typography Pairing**: Inter + JetBrains / Geist Mono for technical code & metadata.

## Colors

### Brand & Accent
- **Primary Accent** (\`{colors.primary}\` — \`${primaryColor}\`): Conversion signature. Primary CTA buttons, key metrics, active states.
- **Secondary Accent** (\`{colors.secondary}\` — \`${secondaryColor}\`): Supporting highlight for charts, badges, and gradient fills.

### Surface & Neutral
- **Canvas Dark** (\`{colors.canvas}\` — \`${darkInk}\`): Deep background canvas.
- **Card Surface** (\`{colors.surface}\` — \`#141416\`): Elevated card container fill.
- **Hairline Border** (\`{colors.border}\` — \`#26262a\`): Subtle stroke separation.

## Typography Hierarchy

| Token | Size | Weight | Line Height | Use Case |
|---|---|---|---|---|
| \`{typography.display-xl}\` | 56px | 800 | 1.15 | Hero headlines & campaign banners |
| \`{typography.display-lg}\` | 36px | 700 | 1.25 | Section headings & 30-day post titles |
| \`{typography.body-md}\` | 16px | 400 | 1.50 | Social captions & body paragraphs |
| \`{typography.mono-code}\` | 13px | 600 | 1.40 | Code blocks, hashtags, CTA links, metadata |

## Image & Visual Prompting Rules for AI Generation

When synthesizing 3D renders, social media visual posts, or promotional graphics for **${client.name}**, follow these exact visual rules:
1. **Primary Color Focus**: Incorporate glowing highlights in \`${primaryColor}\`.
2. **Background Environment**: Deep dark studio ambient lighting in \`${darkInk}\` with soft '#141416' card surfaces.
3. **Graphic Style**: Modern glassmorphism, 3D isometric objects, or sleek UI dashboard cards.
4. **Composition**: Clean centered framing with 12px rounded container cards, high contrast, and crisp vector overlays.

## Do's and Don'ts

### Do
- Reserve \`${primaryColor}\` for key action triggers and CTA badges.
- Keep card corners strictly at 12px (\`rounded-md\`).
- Pair dark surfaces with crisp \`#26262a\` hairline borders.

### Don't
- Don't use uncurated rainbow gradients.
- Don't use light grey borders. Keep contrast sharp and professional.
`;
}

export function analyzeBrandAndWebsite(client: Client): BrandAnalysis {
  const cleanDomain = client.websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const designMd = generateBrandGuideDesignMd(client);
  
  const crawledPages = [
    {
      title: `${client.name} - Home & Core Mission`,
      url: `${client.websiteUrl}`,
      summary: `Main landing hub for ${client.name} showcasing primary solutions, value proposition, and customer conversion paths.`,
      keywords: ['innovation', client.industry.toLowerCase(), 'growth', 'solutions', 'leader']
    },
    {
      title: `${client.name} - Solutions & Services`,
      url: `${client.websiteUrl}/services`,
      summary: `Deep dive into flagship products/services offered by ${client.name}. Outlines core benefits for target audience.`,
      keywords: ['services', 'pricing', 'features', 'efficiency', 'results']
    },
    {
      title: `${client.name} - Case Studies & Success Stories`,
      url: `${client.websiteUrl}/case-studies`,
      summary: `Verified testimonials, metrics-driven outcomes, and client transformations achieved by ${client.name}.`,
      keywords: ['case study', 'roi', 'growth metrics', 'trust', 'proven results']
    },
    {
      title: `${client.name} - Resources & Industry Insights`,
      url: `${client.websiteUrl}/blog`,
      summary: `Thought leadership articles, technical guides, and trend breakdowns published by ${client.name}.`,
      keywords: ['guides', 'industry trends', 'expert advice', 'strategy', 'best practices']
    }
  ];

  const contentPillars = [
    `Pillar 1: Educational Mastery (${client.industry} insights & actionable hacks)`,
    `Pillar 2: Product Excellence & Feature Highlights`,
    `Pillar 3: Authority Building & Executive Thought Leadership`,
    `Pillar 4: Social Proof, Client Transformations & Case Studies`,
    `Pillar 5: Brand Culture, Behind-the-Scenes & Community Growth`
  ];

  const recommendedHashtagClusters = [
    `#${client.name.replace(/\s+/g, '')} #${client.industry.replace(/\s+/g, '')} #GrowthMindset`,
    `#Innovation #${cleanDomain.replace(/\./g, '')} #TechTrends #ScaleUp`,
    `#IndustryLeaders #BusinessSuccess #DigitalTransformation #Strategy`,
    `#CustomerSuccess #ProTips #FutureOfWork #Productivity`
  ];

  return {
    analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    crawledPages,
    extractedTone: client.tone,
    visualMood: `Brand Guide Palette: Primary Accent ${client.brandColors[0] || '#00d4a4'} on Dark Canvas ${client.brandColors[2] || '#0a0a0a'} with 12px rounded cards and Inter/Mono typography.`,
    contentPillars,
    recommendedHashtagClusters,
    targetAudiencePersona: client.targetAudience || `Decision makers, enthusiasts, and active consumers in the ${client.industry} sector seeking top-tier solutions.`,
    brandHealthScore: 98,
    designMd
  };
}

export function generate30DayCalendar(client: Client): SocialPost[] {
  const posts: SocialPost[] = [];
  const startDate = new Date();

  const domain = client.websiteUrl.endsWith('/') ? client.websiteUrl.slice(0, -1) : client.websiteUrl;
  const brandName = client.name;
  const industry = client.industry;
  const primaryColor = client.brandColors[0] || '#00d4a4';
  const secondaryColor = client.brandColors[1] || '#3772cf';
  const darkCanvas = client.brandColors[2] || '#0a0a0a';

  for (let i = 1; i <= 30; i++) {
    const postDate = new Date(startDate);
    postDate.setDate(startDate.getDate() + (i - 1));
    const formattedDate = postDate.toISOString().split('T')[0];

    const category = CATEGORIES[(i - 1) % CATEGORIES.length];
    const platforms = PLATFORM_PRESETS[(i - 1) % PLATFORM_PRESETS.length];
    const timeSlots = ['09:15 AM', '11:30 AM', '02:00 PM', '04:45 PM', '07:30 PM'];
    const scheduledTime = timeSlots[(i - 1) % timeSlots.length];

    let title = '';
    let caption = '';
    let description = '';
    let cta = '';
    let targetUrl = `${domain}`;
    let imagePrompt = '';
    let hashtags: string[] = [];

    switch (category) {
      case 'Educational & Tips':
        title = `Day ${i}: 5 Proven ${industry} Strategies for Maximum Impact`;
        caption = `Stop guessing, start growing! 🚀 Here are 5 battle-tested strategies to elevate your results in ${industry} this year.\n\nKey Takeaways:\n1️⃣ Optimize early workflow\n2️⃣ Data-driven decision making\n3️⃣ Continuous customer feedback loop\n\nWhich of these are you implementing this week? Drop a comment below! 👇`;
        description = `In-depth breakdown of top 5 ${industry} practices designed to give our community actionable advice today.`;
        cta = `Read the complete breakdown on our blog at ${domain}/blog/strategies`;
        targetUrl = `${domain}/blog/strategies`;
        hashtags = [`#${industry.replace(/\s+/g, '')}Tips`, `#ProTips`, `#GrowthHacks`, `#${brandName.replace(/\s+/g, '')}`];
        imagePrompt = `Minimalist 3D isometric graphic tailored to ${brandName} Brand Guide. Features glowing primary accent ${primaryColor} and ${secondaryColor} elements on deep dark canvas ${darkCanvas}, 12px rounded cards, studio lighting, 8k resolution.`;
        break;

      case 'Product Spotlight':
        title = `Day ${i}: Unlocking Peak Performance with ${brandName}`;
        caption = `Did you know ${brandName} is built to save you up to 15+ hours every week? 💡\n\nOur platform streamlines your ${industry} workflow with smart automation, seamless integrations, and real-time insights.\n\nReady to scale without the stress? Let’s get started today!`;
        description = `Highlighting primary feature matrix and time-saving value proposition of ${brandName}.`;
        cta = `Claim your free demo at ${domain}/demo`;
        targetUrl = `${domain}/demo`;
        hashtags = [`#ProductSpotlight`, `#${brandName.replace(/\s+/g, '')}`, `#WorkflowAutomation`, `#Innovation`];
        imagePrompt = `Sleek dark mode UI dashboard mockup following ${brandName} Brand Guide. Glowing graphs in ${primaryColor}, dark surface ${darkCanvas}, clean Inter typography overlays, high-end studio lighting.`;
        break;

      case 'Behind The Scenes':
        title = `Day ${i}: How We Build ${brandName} Behind the Curtains`;
        caption = `Ever wondered what goes into building a leading product in ${industry}? ☕✨\n\nHere’s a peek inside our team’s weekly sync! From brainstorming new features to rigorous testing, every detail matters.\n\nWhat’s your favorite behind-the-scenes part of your team's workflow?`;
        description = `Humanizing the brand through authentic team moments and engineering culture highlights.`;
        cta = `Join our team or learn more at ${domain}/about`;
        targetUrl = `${domain}/about`;
        hashtags = [`#BehindTheScenes`, `#Culture`, `#TeamWork`, `#${brandName.replace(/\s+/g, '')}Life`];
        imagePrompt = `Authentic 35mm photograph of modern engineering workspace matching ${brandName} brand tone (${client.tone}). Warm ambient lighting, team collaboration around glass whiteboard, rich cinematic depth.`;
        break;

      case 'Thought Leadership':
        title = `Day ${i}: The Future of ${industry} Over the Next 5 Years`;
        caption = `The landscape of ${industry} is evolving faster than ever. ⚡\n\nWhere will the industry be in 2030? We analyzed market trends and identified 3 key shifts:\n• AI integration across core operations\n• Hyper-personalized customer experiences\n• Sustainable & scalable architectures.\n\nDo you agree with these predictions?`;
        description = `Executive perspective post establishing ${brandName} as a visionary industry leader.`;
        cta = `Download our full Trend Report at ${domain}/reports/2026-trends`;
        targetUrl = `${domain}/reports/2026-trends`;
        hashtags = [`#ThoughtLeadership`, `#FutureOfWork`, `#${industry.replace(/\s+/g, '')}Trends`, `#Leadership`];
        imagePrompt = `Futuristic technological network graphic aligned with ${brandName} Brand Guide. Glowing nodes in ${primaryColor}, dark metallic background ${darkCanvas}, ultra-detailed render.`;
        break;

      case 'Social Proof & Case Study':
        title = `Day ${i}: How Client X Achieved 310% ROI with ${brandName}`;
        caption = `Real Results. Real Growth. 📊\n\nSee how one of our partner brands transformed their ${industry} operations, slashing manual overhead by 60% and achieving 3.1x growth in under 90 days!\n\n"Working with ${brandName} transformed our entire execution speed."`;
        description = `Customer success story highlighting verifiable impact metrics and quote.`;
        cta = `Read the full case study at ${domain}/case-studies/client-x`;
        targetUrl = `${domain}/case-studies/client-x`;
        hashtags = [`#CaseStudy`, `#CustomerSuccess`, `#ROI`, `#ProvenResults`];
        imagePrompt = `High-impact financial chart graphic following ${brandName} Brand Guide. Upward trend line glowing in ${primaryColor}, dark card surface ${darkCanvas}, crisp text overlays.`;
        break;

      case 'Promotional & Offer':
        title = `Day ${i}: Exclusive Invitation for ${industry} Trailblazers`;
        caption = `Ready to take your ${industry} results to the next level? 🔥\n\nFor a limited time, we're unlocking exclusive access to ${brandName}'s premium feature suite with complimentary onboarding support.\n\nDon't let your competitors get ahead!`;
        description = `Targeted conversion campaign driving signups for ${brandName}.`;
        cta = `Claim your exclusive offer at ${domain}/pricing`;
        targetUrl = `${domain}/pricing`;
        hashtags = [`#SpecialOffer`, `#${brandName.replace(/\s+/g, '')}`, `#Exclusive`, `#UpgradeToday`];
        imagePrompt = `Sleek promotional render obeying ${brandName} Brand Guide. Saturated ${primaryColor} CTA badge, 12px rounded cards, dark studio backdrop, 8k resolution.`;
        break;
    }

    posts.push({
      id: `post_${client.id}_day_${i}`,
      clientId: client.id,
      dayNumber: i,
      scheduledDate: formattedDate,
      scheduledTime,
      title,
      category,
      platforms,
      caption,
      description,
      cta,
      targetUrl,
      hashtags,
      imagePrompt,
      imageUrl: generateSVGDataUrl(title, category, primaryColor, secondaryColor, i),
      imageSource: 'ai_generated',
      status: i <= 2 ? 'published' : (i <= 5 ? 'scheduled' : 'draft'),
      publishedAt: i <= 2 ? new Date().toISOString() : undefined,
      engagementMetrics: i <= 2 ? {
        likes: Math.floor(Math.random() * 300) + 120,
        shares: Math.floor(Math.random() * 45) + 12,
        comments: Math.floor(Math.random() * 35) + 8,
        clicks: Math.floor(Math.random() * 180) + 50
      } : undefined
    });
  }

  return posts;
}

export function generateSVGDataUrl(title: string, category: string, primaryColor: string, secondaryColor: string, day: number): string {
  const sanitizedTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sanitizedCat = category.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="grad_${day}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="${secondaryColor}" />
      </linearGradient>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0a0a" />
        <stop offset="100%" stop-color="#141416" />
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)" />
    <rect x="1" y="1" width="798" height="798" fill="none" stroke="#26262a" stroke-width="2" />
    
    <!-- Abstract Shapes -->
    <circle cx="650" cy="150" r="180" fill="url(#grad_${day})" opacity="0.15" />
    <circle cx="150" cy="650" r="220" fill="url(#grad_${day})" opacity="0.1" />
    
    <!-- Mintlify Container -->
    <rect x="75" y="100" width="650" height="600" rx="16" fill="#141416" stroke="#26262a" stroke-width="2" />
    
    <!-- Category Badge -->
    <rect x="120" y="150" width="220" height="40" rx="20" fill="${primaryColor}" />
    <text x="230" y="175" font-family="-apple-system, sans-serif" font-size="14" font-weight="700" fill="#0a0a0a" text-anchor="middle" letter-spacing="1">
      DAY ${day} • ${sanitizedCat.toUpperCase()}
    </text>
    
    <!-- Title Text -->
    <foreignObject x="120" y="230" width="560" height="280">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color: #ffffff; font-family: system-ui, -apple-system, sans-serif; font-size: 36px; font-weight: 800; line-height: 1.35;">
        ${sanitizedTitle}
      </div>
    </foreignObject>
    
    <!-- Footer CTA bar -->
    <line x1="120" y1="580" x2="680" y2="580" stroke="#26262a" stroke-width="2" />
    <text x="120" y="625" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="${primaryColor}">
      SocialPulse AI • Brand Guide Engine
    </text>
    <circle cx="650" cy="620" r="16" fill="${primaryColor}" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
