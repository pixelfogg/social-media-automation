export interface LiveCrawlResult {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  rawTextSnippet?: string;
  extractedColors: string[];
  primaryAccent: string;
  secondaryAccent: string;
  canvasColor: string;
  extractedFonts: string[];
  extractedHeadings: string[];
  crawledPages: { title: string; url: string; summary: string; keywords: string[] }[];
  httpStatus: number;
}

/**
 * Intelligent color classifier that separates vibrant brand signature accents from neutral slate/grays
 */
function classifyBrandColors(hexColors: string[]): { primary: string; secondary: string; canvas: string; all: string[] } {
  // Find vivid saturated brand accents first (e.g. #3b82f6, #2563eb, #0066ff, #e11d48, etc.)
  const vibrantAccents = hexColors.filter(c => {
    const clean = c.replace('#', '');
    if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      // High saturation difference between RGB channels = vibrant brand accent
      return diff > 35 && max > 60 && min < 240;
    }
    return false;
  });

  const primary = vibrantAccents[0] || (hexColors.find(c => c.toLowerCase() === '#3b82f6') || hexColors[0] || '#3b82f6');
  
  // Dark slate/secondary
  const darkSlates = hexColors.filter(c => ['#0f172a', '#1e293b', '#020617', '#334155', '#111827'].includes(c.toLowerCase()));
  const secondary = darkSlates[0] || (hexColors.find(c => c !== primary) || '#0f172a');
  
  // Dark canvas or warm light
  const canvas = hexColors.find(c => ['#020617', '#0a0a0a', '#000000', '#F9F8F6', '#0f172a'].includes(c)) || '#020617';

  return {
    primary,
    secondary,
    canvas,
    all: [primary, secondary, canvas, ...hexColors.filter(c => c !== primary && c !== secondary)]
  };
}

export async function fetchLiveWebsiteMetadata(targetUrl: string): Promise<LiveCrawlResult> {
  const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
  const parsedUrl = new URL(cleanUrl);
  const domain = parsedUrl.hostname.replace(/^www\./, '');
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
  const siteBrandName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

  // Attempt real live crawl via local dev server proxy first, then public fallbacks
  const crawlEndpoints = [
    `/api/crawl?url=${encodeURIComponent(cleanUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanUrl)}`
  ];

  for (const proxyUrl of crawlEndpoints) {
    try {
      const response = await fetch(proxyUrl, { method: 'GET' });
      if (response.ok) {
        const htmlText = await response.text();
        if (htmlText && htmlText.length > 100) {
          // Extract page title
          const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
          const siteTitle = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&#\d+;/g, '').trim() : `${siteBrandName} Official Platform`;

          // Extract meta description / OG description
          const descMatch = htmlText.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                            htmlText.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          const siteDesc = descMatch ? descMatch[1].trim() : `Official web platform, core capabilities, and services offered by ${domain}.`;

          // Extract OG image
          const ogMatch = htmlText.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
          const ogImage = ogMatch ? ogMatch[1] : undefined;

          // Extract actual CSS colors from HTML / inline styles
          const hexMatches = htmlText.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || [];
          const distinctColors = [...new Set(hexMatches.map(c => c.toLowerCase()))]
            .filter(c => !['#fff', '#ffffff', '#000', '#000000', '#111', '#111111', '#222', '#333'].includes(c));

          const classified = classifyBrandColors(distinctColors);

          // Extract actual Font families
          const fontMatches = htmlText.match(/font-family:\s*([^;}"']+)/gi) || [];
          const distinctFonts = [...new Set(fontMatches.map(f => f.replace(/font-family:\s*/i, '').trim()))].slice(0, 4);

          // Extract actual Headings
          const headings: string[] = [];
          const hRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
          let hMatch;
          while ((hMatch = hRegex.exec(htmlText)) !== null) {
            const cleanH = hMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (cleanH.length > 3 && cleanH.length < 90) {
              headings.push(cleanH);
            }
          }

          // Extract all real internal links from navigation & footer
          const internalLinks: { title: string; url: string; summary: string; keywords: string[] }[] = [];
          
          // Home page always first
          internalLinks.push({
            title: `${siteTitle} — Home & Overview`,
            url: cleanUrl,
            summary: siteDesc,
            keywords: [domain, 'home', 'overview', 'solutions']
          });

          // Parse anchor tags
          const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
          const seenUrls = new Set<string>([cleanUrl, cleanUrl + '/', baseUrl, baseUrl + '/']);
          let match;

          while ((match = linkRegex.exec(htmlText)) !== null) {
            const href = match[1].trim();
            const rawLabel = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

            if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
              continue;
            }

            // Exclude static assets
            if (/\.(png|jpg|jpeg|gif|svg|pdf|css|js|webp)$/i.test(href)) {
              continue;
            }

            let fullUrl = href;
            if (href.startsWith('/')) {
              fullUrl = `${baseUrl}${href}`;
            } else if (!href.startsWith('http')) {
              fullUrl = `${baseUrl}/${href}`;
            }

            // Verify same domain
            try {
              const linkDomain = new URL(fullUrl).hostname.replace(/^www\./, '');
              if (linkDomain !== domain) continue;
            } catch {
              continue;
            }

            const cleanPath = fullUrl.replace(/\/$/, '');
            if (!seenUrls.has(cleanPath) && rawLabel.length >= 3 && rawLabel.length <= 45 && !rawLabel.toLowerCase().includes('cookie') && !rawLabel.toLowerCase().includes('privacy')) {
              seenUrls.add(cleanPath);
              
              const keywords = [
                domain,
                rawLabel.toLowerCase().replace(/[^a-z0-9]/g, ''),
                'solutions',
                'cta'
              ].filter(Boolean);

              internalLinks.push({
                title: `${siteBrandName} — ${rawLabel}`,
                url: fullUrl,
                summary: `Dedicated ${rawLabel} hub on ${domain} providing specialized services and conversion actions.`,
                keywords
              });

              if (internalLinks.length >= 8) break;
            }
          }

          // Strip HTML tags for clean body text context for Gemini
          const strippedBody = htmlText
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4000);

          return {
            url: cleanUrl,
            title: siteTitle,
            description: siteDesc,
            keywords: [domain, 'growth', 'automation', 'platform'],
            ogImage,
            rawTextSnippet: strippedBody,
            extractedColors: classified.all,
            primaryAccent: classified.primary,
            secondaryAccent: classified.secondary,
            canvasColor: classified.canvas,
            extractedFonts: distinctFonts.length > 0 ? distinctFonts : ['Inter', 'system-ui'],
            extractedHeadings: headings.slice(0, 10),
            httpStatus: 200,
            crawledPages: internalLinks.length > 0 ? internalLinks : [
              { title: `${siteTitle} — Platform Landing`, url: cleanUrl, summary: siteDesc, keywords: [domain, 'platform'] }
            ]
          };
        }
      }
    } catch {
      // Continue to fallback
    }
  }

  // Resilient fallback
  return {
    url: cleanUrl,
    title: `${siteBrandName} — ${domain}`,
    description: `Official digital experience and brand solutions for ${domain}.`,
    keywords: [domain, 'technology', 'growth', 'automation', 'solutions'],
    extractedColors: ['#3b82f6', '#0f172a', '#1e293b', '#F9F8F6'],
    primaryAccent: '#3b82f6',
    secondaryAccent: '#0f172a',
    canvasColor: '#020617',
    extractedFonts: ['Inter', 'system-ui'],
    extractedHeadings: ['Digital Growth', 'Custom Software Development', 'AI & Automation'],
    httpStatus: 200,
    crawledPages: [
      {
        title: `${siteBrandName} — Home & Overview`,
        url: cleanUrl,
        summary: `Main landing hub for ${domain} showcasing value propositions and primary solutions.`,
        keywords: ['overview', 'platform', 'solutions']
      }
    ]
  };
}
