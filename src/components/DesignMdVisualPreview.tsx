import React, { useState } from 'react';
import type { Client, BrandAnalysis } from '../types';
import { 
  Palette, 
  Type, 
  CreditCard, 
  Sliders, 
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

interface DesignMdVisualPreviewProps {
  client: Client;
  analysis?: BrandAnalysis;
}

export const DesignMdVisualPreview: React.FC<DesignMdVisualPreviewProps> = ({ client }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('light');

  const primaryColor = client.brandColors[0] || '#3b82f6';
  const secondaryColor = client.brandColors[1] || '#0f172a';
  const cleanDomain = client.websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Curated color swatches based strictly on extracted live website colors
  const accentHighlight = client.brandColors[2] || `${primaryColor}cc`;
  const brandTint = `${primaryColor}18`;

  const brandSwatches = [
    { name: 'Brand Primary', role: 'Primary CTA & conversion signature', token: '{colors.primary}', hex: primaryColor },
    { name: 'Brand Secondary', role: 'Secondary structural & text tone', token: '{colors.secondary}', hex: secondaryColor },
    { name: 'Brand Accent', role: 'Badges, metrics, focus rings', token: '{colors.accent}', hex: accentHighlight },
    { name: 'Brand Wash / Tint', role: 'Subtle container washes & soft fills', token: '{colors.tint}', hex: brandTint }
  ];

  const surfaceSwatches = [
    { name: 'Canvas Dark', role: 'Pure background surface', token: '{colors.canvas-dark}', hex: client.brandColors[3] || '#020617' },
    { name: 'Surface Card', role: 'Elevated modular containers', token: '{colors.surface-card}', hex: '#0f172a' },
    { name: 'Surface Light', role: 'Light mode canvas', token: '{colors.canvas-light}', hex: '#F9F8F6' },
    { name: 'Surface Gray', role: 'Neutral boundary fills', token: '{colors.surface-neutral}', hex: '#f1f5f9' },
    { name: 'Border Subtle', role: 'Hairline structural dividers', token: '{colors.border-subtle}', hex: '#1e293b' },
    { name: 'Border Strong', role: 'Hover perimeters & focus state', token: '{colors.border-strong}', hex: '#334155' }
  ];

  const typographyScales = [
    { name: 'Display Hero', size: '56px', weight: '800 (ExtraBold)', sample: 'High-Impact Software & AI Scale', token: '{typography.display-hero}' },
    { name: 'Display Section', size: '36px', weight: '700 (Bold)', sample: 'Engineered for Compound Growth', token: '{typography.heading-xl}' },
    { name: 'Heading Medium', size: '24px', weight: '600 (SemiBold)', sample: 'Tailored Digital Architecture', token: '{typography.heading-md}' },
    { name: 'Feature Title', size: '18px', weight: '600 (SemiBold)', sample: 'Continuous Performance & Precision', token: '{typography.heading-sm}' },
    { name: 'Body Large', size: '16px', weight: '400 (Regular)', sample: 'PixelFogg delivers enterprise-grade software development, AI workflows, and strategic digital experiences.', token: '{typography.body-lg}' },
    { name: 'Body Medium', size: '14px', weight: '400 (Regular)', sample: 'Optimized for cross-platform speed, accessibility, and frictionless user conversion.', token: '{typography.body-md}' },
    { name: 'Monospace Code', size: '12px', weight: '500 (Medium)', sample: 'const system = new BrandGuide({ mode: "production" });', token: '{typography.mono-code}', isMono: true }
  ];

  const isLight = previewTheme === 'light';

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      
      {/* Top Preview Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141416] p-4 rounded-2xl border border-[#26262a]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00d4a4]" />
            <span>Interactive Visual Design System Preview</span>
          </h3>
          <p className="text-xs text-neutral-400">Live rendered design token spec according to getdesign.md standard</p>
        </div>

        {/* Theme switcher */}
        <div className="flex items-center space-x-1.5 bg-[#0a0a0a] p-1 rounded-xl border border-[#26262a]">
          <button
            onClick={() => setPreviewTheme('light')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
              isLight ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light Theme</span>
          </button>
          <button
            onClick={() => setPreviewTheme('dark')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
              !isLight ? 'bg-[#141416] text-[#00d4a4] border border-[#26262a]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Hero Header Presentation Banner */}
      <div className={`p-8 rounded-2xl border transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-sm' : 'bg-[#0e0e11] border-[#26262a] text-white'
      }`}>
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono-code"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <span>{client.industry}</span>
                <span>•</span>
                <span>Design System Analysis</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Design System Analysis of {client.name}
              </h1>
            </div>

            {/* Active Theme Logo Showcase */}
            {(isLight ? (client.logoLightUrl || client.logoUrl) : (client.logoDarkUrl || client.logoUrl)) && (
              <div className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 ${
                isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-[#0a0a0a] border-[#26262a]'
              }`}>
                <img
                  src={isLight ? (client.logoLightUrl || client.logoUrl) : (client.logoDarkUrl || client.logoUrl)}
                  alt={`${client.name} Logo`}
                  className="h-12 w-auto max-w-[160px] object-contain"
                />
              </div>
            )}
          </div>

          <p className={`text-sm sm:text-base leading-relaxed max-w-3xl ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            {client.name} ({cleanDomain}) pairs high-contrast surfaces with <span className="font-bold" style={{ color: primaryColor }}>{primaryColor}</span> primary conversion accents. Built for developer-grade software products, responsive digital services, and scalable web applications.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md hover:brightness-110 transition-all flex items-center space-x-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href={client.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                isLight ? 'border-neutral-300 text-neutral-700 hover:bg-neutral-50' : 'border-[#26262a] text-neutral-300 hover:bg-[#141416]'
              }`}
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 1. COLOR PALETTE SWATCHES */}
      <div className={`p-8 rounded-2xl border space-y-6 transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-[#141416] border-[#26262a]'
      }`}>
        <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: isLight ? '#e5e7eb' : '#26262a' }}>
          <div>
            <h3 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <Palette className="w-5 h-5" style={{ color: primaryColor }} />
              <span>Color Palette & Tokens</span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Click any color card to copy token or hex code</p>
          </div>
        </div>

        {/* Brand Swatches */}
        <div className="space-y-3">
          <h4 className={`text-xs font-bold uppercase tracking-wider font-mono-code ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Brand & Primary Signatures
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandSwatches.map((swatch, idx) => (
              <div
                key={idx}
                onClick={() => handleCopy(swatch.token)}
                className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:shadow-lg ${
                  isLight ? 'border-neutral-200 bg-white hover:border-neutral-400' : 'border-[#26262a] bg-[#0a0a0a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="h-24 w-full relative flex items-center justify-center border-b border-black/10" style={{ backgroundColor: swatch.hex }}>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                    {copiedToken === swatch.token ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedToken === swatch.token ? 'Copied Token!' : 'Copy Token'}</span>
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>{swatch.name}</span>
                    <span className={`text-[10px] font-mono-code font-bold ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>{swatch.hex}</span>
                  </div>
                  <p className={`text-[10px] truncate ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>{swatch.role}</p>
                  <p className="text-[10px] font-mono-code font-semibold" style={{ color: primaryColor }}>{swatch.token}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Surfaces & Neutrals */}
        <div className="space-y-3 pt-2">
          <h4 className={`text-xs font-bold uppercase tracking-wider font-mono-code ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Surface, Neutrals & Dividers
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {surfaceSwatches.map((swatch, idx) => (
              <div
                key={idx}
                onClick={() => handleCopy(swatch.token)}
                className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:shadow-sm ${
                  isLight ? 'border-neutral-200 bg-white hover:border-neutral-400' : 'border-[#26262a] bg-[#0a0a0a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="h-16 w-full border-b border-black/10" style={{ backgroundColor: swatch.hex }} />
                <div className="p-2.5 space-y-0.5">
                  <span className={`text-[11px] font-bold block truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}>{swatch.name}</span>
                  <span className={`text-[10px] font-mono-code block ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>{swatch.hex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. TYPOGRAPHY SCALE */}
      <div className={`p-8 rounded-2xl border space-y-6 transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-[#141416] border-[#26262a]'
      }`}>
        <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: isLight ? '#e5e7eb' : '#26262a' }}>
          <div>
            <h3 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <Type className="w-5 h-5 text-[#00d4a4]" />
              <span>Typography Scale & Hierarchy</span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Extracted typography hierarchy rendered directly in the browser</p>
          </div>
        </div>

        <div className="space-y-6">
          {typographyScales.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                isLight ? 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100' : 'bg-[#0a0a0a] border-[#26262a] hover:border-[#3f3f46]'
              }`}
            >
              <div className="w-full md:w-56 shrink-0 space-y-1">
                <span className={`text-xs font-bold block ${isLight ? 'text-neutral-900' : 'text-white'}`}>{item.name}</span>
                <span className="text-[10px] text-[#00d4a4] font-mono-code font-semibold block">{item.token}</span>
                <span className={`text-[10px] font-mono-code block ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {item.size} • {item.weight}
                </span>
              </div>

              <div className="flex-1 overflow-x-auto">
                <p
                  className={`${item.isMono ? 'font-mono-code' : 'font-sans'} truncate ${isLight ? 'text-neutral-900' : 'text-white'}`}
                  style={{
                    fontSize: item.size === '56px' ? '32px' : item.size === '36px' ? '24px' : item.size,
                    fontWeight: item.weight.includes('800') ? 800 : item.weight.includes('700') ? 700 : item.weight.includes('600') ? 600 : 400
                  }}
                >
                  {item.sample}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BUTTON & INTERACTION VARIANTS */}
      <div className={`p-8 rounded-2xl border space-y-6 transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-[#141416] border-[#26262a]'
      }`}>
        <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: isLight ? '#e5e7eb' : '#26262a' }}>
          <div>
            <h3 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <Sliders className="w-5 h-5 text-[#00d4a4]" />
              <span>Button Variants & Micro-Interactions</span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Interactive UI components and hover behaviors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary CTA */}
          <div className={`p-5 rounded-xl border space-y-3 ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0a0a0a] border-[#26262a]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>Primary Action Button</span>
            <div className="pt-2">
              <button
                className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Primary Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono-code pt-2">role: Primary Conversion, Checkout, Key CTA</p>
          </div>

          {/* Secondary Dark */}
          <div className={`p-5 rounded-xl border space-y-3 ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0a0a0a] border-[#26262a]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>Secondary Dark Button</span>
            <div className="pt-2">
              <button
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                  isLight ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100' : 'bg-[#141416] border-[#26262a] text-white hover:border-[#3f3f46]'
                }`}
              >
                <span>Secondary Option</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono-code pt-2">role: Documentation, Settings, Secondary Filter</p>
          </div>

          {/* Glow / Outline */}
          <div className={`p-5 rounded-xl border space-y-3 ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#0a0a0a] border-[#26262a]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>Brand Outline Button</span>
            <div className="pt-2">
              <button
                className="w-full py-2.5 px-4 rounded-lg text-xs font-bold border transition-all flex items-center justify-center space-x-1.5"
                style={{
                  borderColor: `${primaryColor}60`,
                  color: primaryColor,
                  backgroundColor: `${primaryColor}10`
                }}
              >
                <span>Live Demonstration</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono-code pt-2">role: Featured badge, Trial CTA, Video Play</p>
          </div>
        </div>
      </div>

      {/* 4. COMPONENT & CARD EXAMPLES */}
      <div className={`p-8 rounded-2xl border space-y-6 transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-[#141416] border-[#26262a]'
      }`}>
        <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: isLight ? '#e5e7eb' : '#26262a' }}>
          <div>
            <h3 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-neutral-900' : 'text-white'}`}>
              <CreditCard className="w-5 h-5 text-[#00d4a4]" />
              <span>Card Examples & Component Layouts</span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>Modular card patterns with depth, badges, and pricing tiers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className={`rounded-xl border p-5 space-y-4 transition-all hover:shadow-lg ${
            isLight ? 'bg-white border-neutral-200' : 'bg-[#0a0a0a] border-[#26262a] hover:border-[#3f3f46]'
          }`}>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-tr from-black via-neutral-900 to-neutral-800 p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded uppercase font-mono-code w-fit">
                Solutions
              </span>
              <h5 className="text-sm font-extrabold text-white">Custom Engineering</h5>
            </div>
            <div className="space-y-1.5">
              <h4 className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-white'}`}>Scalable Software Engine</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Engineered for extreme throughput, developer velocity, and seamless enterprise deployments.
              </p>
            </div>
            <button
              className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all shadow"
              style={{ backgroundColor: primaryColor }}
            >
              Get Started
            </button>
          </div>

          {/* Card 2 - Pricing / Tier */}
          <div className={`rounded-xl border p-5 space-y-4 transition-all relative ${
            isLight ? 'bg-white border-neutral-200' : 'bg-[#0a0a0a] border-[#26262a]'
          }`} style={{ borderColor: primaryColor }}>
            <div className="absolute -top-2.5 right-4 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-white shadow"
              style={{ backgroundColor: primaryColor }}
            >
              POPULAR
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-neutral-400 uppercase font-mono-code">Enterprise Growth</span>
              <div className="flex items-baseline space-x-1">
                <span className={`text-2xl font-extrabold ${isLight ? 'text-neutral-900' : 'text-white'}`}>$4,900</span>
                <span className="text-xs text-neutral-500">/ month</span>
              </div>
            </div>
            <ul className={`text-xs space-y-2 pt-2 border-t ${isLight ? 'border-neutral-200 text-neutral-700' : 'border-[#26262a] text-neutral-300'}`}>
              <li className="flex items-center gap-2">
                <span style={{ color: primaryColor }}>✓</span> Dedicated AI Architect
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: primaryColor }}>✓</span> Full-stack Cloud Pipelines
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: primaryColor }}>✓</span> 24/7 SLA Uptime Guarantee
              </li>
            </ul>
            <button
              className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all shadow"
              style={{ backgroundColor: primaryColor }}
            >
              Start Sprint
            </button>
          </div>

          {/* Card 3 - Dark Feature Banner */}
          <div className="rounded-xl border border-[#26262a] bg-[#0c0c0e] p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-mono-code font-bold uppercase" style={{ color: primaryColor }}>
                AI WORKFLOWS
              </span>
              <h4 className="text-sm font-extrabold text-white leading-tight">
                Work that fits the way modern teams execute.
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect data models and automate complex logic with zero infrastructure friction.
              </p>
            </div>
            <div className="p-3 bg-[#141416] rounded-lg border border-[#26262a] text-[11px] font-mono-code text-[#00d4a4]">
              &gt; npx {cleanDomain.split('.')[0]}@latest deploy
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
