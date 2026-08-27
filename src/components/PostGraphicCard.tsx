import React from 'react';
import type { SocialPost } from '../types';

interface PostGraphicCardProps {
  post: SocialPost;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}

export const PostGraphicCard: React.FC<PostGraphicCardProps> = ({
  post,
  primaryColor = '#00d4a4',
  secondaryColor = '#3772cf',
  className = ''
}) => {
  // If post has an external HTTP/HTTPS image URL that is not broken
  const [imgError, setImgError] = React.useState(false);

  const hasExternalImage = post.imageUrl && post.imageUrl.startsWith('http') && !imgError;

  if (hasExternalImage) {
    return (
      <img
        src={post.imageUrl}
        alt={post.title}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  // Authentic, ultra-crisp Brand Design Graphic
  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-[#0e0e11] flex flex-col justify-between p-4 sm:p-5 select-none border-b border-[#26262a] ${className}`}
      style={{
        background: `radial-gradient(circle at 80% 20%, ${primaryColor}15 0%, #0e0e11 65%)`
      }}
    >
      {/* Background Subtle Grid & Lighting Accent */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
        backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
        backgroundSize: '16px 16px'
      }} />

      {/* Top Bar: Category Pill & Brand Dot */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono-code shadow-sm"
          style={{
            backgroundColor: `${primaryColor}20`,
            color: primaryColor,
            border: `1px solid ${primaryColor}40`
          }}
        >
          {post.category}
        </span>

        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
        </div>
      </div>

      {/* Center Headline & Content */}
      <div className="relative z-10 my-auto py-2 space-y-1.5">
        <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight tracking-tight line-clamp-3">
          {post.title}
        </h4>
        <p className="text-[11px] text-neutral-400 font-medium line-clamp-2 leading-relaxed">
          {post.caption.replace(/[\r\n]+/g, ' ')}
        </p>
      </div>

      {/* Bottom Footer Accent */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
        <span className="font-mono-code font-bold text-neutral-300 flex items-center gap-1">
          <span style={{ color: primaryColor }}>●</span> DAY {post.dayNumber}
        </span>
        <span className="font-mono-code text-[9px] text-neutral-500 uppercase tracking-widest">
          Brand Graphic • AI Ready
        </span>
      </div>
    </div>
  );
};
