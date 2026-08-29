import React from 'react';
import type { SocialPost } from '../types';
import { Play } from 'lucide-react';

interface PostGraphicCardProps {
  post: SocialPost;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  showControls?: boolean;
}

const HIGH_RES_STUDIO_PHOTOS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634655610415-4fa2c64db340?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80'
];

export function getVerifiedPhotoForPost(day: number): string {
  return HIGH_RES_STUDIO_PHOTOS[(day - 1) % HIGH_RES_STUDIO_PHOTOS.length];
}

export const PostGraphicCard: React.FC<PostGraphicCardProps> = ({
  post,
  primaryColor = '#00d4a4',
  className = '',
  showControls = false
}) => {
  const [imgError, setImgError] = React.useState(false);

  const isVideo = Boolean(
    post.videoUrl || 
    post.mediaType === 'video' ||
    (post.imageUrl && (post.imageUrl.startsWith('data:video') || post.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)))
  );

  const videoSrc = post.videoUrl || post.imageUrl;
  const effectiveImageUrl = (post.imageUrl && !imgError) 
    ? post.imageUrl 
    : getVerifiedPhotoForPost(post.dayNumber || 1);

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#0a0a0a] group ${className}`}>
      {isVideo && videoSrc ? (
        <video
          src={videoSrc}
          autoPlay={!showControls}
          loop
          muted={!showControls}
          controls={showControls}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={effectiveImageUrl}
          alt={post.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}

      {/* Dark Gradient Overlay (only for images or non-control videos) */}
      {!showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent pointer-events-none" />
      )}

      {/* Top Left: Category Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
        <span
          className="px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider font-mono-code shadow-lg backdrop-blur-md bg-black/80 text-white border border-white/20 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4a4]" />
          <span>{post.category}</span>
        </span>
      </div>

      {/* Top Right: Video Indicator Badge if video */}
      {isVideo && !showControls && (
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-black/80 text-[#00d4a4] border border-[#00d4a4]/30 backdrop-blur-md flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>VIDEO</span>
          </span>
        </div>
      )}

      {/* Bottom Left: Day Tag */}
      {!showControls && (
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono-code font-bold text-neutral-300">
            <span style={{ color: primaryColor }}>●</span>
            <span>DAY {post.dayNumber}</span>
            {post.imageSource === 'custom' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00d4a4]/20 text-[#00d4a4] border border-[#00d4a4]/30">
                CUSTOM ASSET
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
