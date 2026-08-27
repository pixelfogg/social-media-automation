import type { SocialPlatform } from '../types';

export interface ProductionAppConfig {
  metaAppId: string;
  metaAppSecret: string;
  linkedinClientId: string;
  linkedinClientSecret: string;
  twitterClientId: string;
  tiktokClientKey: string;
  pinterestAppId: string;
  redirectUri: string;
}

export const ENV_CONFIG: ProductionAppConfig = {
  metaAppId: import.meta.env.VITE_META_APP_ID || '7829104829104',
  metaAppSecret: import.meta.env.VITE_META_APP_SECRET || 'ea89210948ab8291048209f',
  linkedinClientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '78ab910249018',
  linkedinClientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || 'li981204981240981240',
  twitterClientId: import.meta.env.VITE_TWITTER_CLIENT_ID || 'tw_app_89124098',
  tiktokClientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY || 'tt_key_98124098',
  pinterestAppId: import.meta.env.VITE_PINTEREST_APP_ID || 'pin_app_981240',
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/oauth/callback`
};

export function getLiveOAuthRedirectUrl(platform: SocialPlatform): string {
  const redirect = encodeURIComponent(ENV_CONFIG.redirectUri);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${ENV_CONFIG.metaAppId}&redirect_uri=${redirect}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish&response_type=code`;
    
    case 'instagram':
      return `https://api.instagram.com/oauth/authorize?client_id=${ENV_CONFIG.metaAppId}&redirect_uri=${redirect}&scope=user_profile,user_media,instagram_graph_user_profile,instagram_graph_user_media&response_type=code`;

    case 'linkedin':
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${ENV_CONFIG.linkedinClientId}&redirect_uri=${redirect}&scope=w_member_social%20w_organization_social%20r_organization_social`;

    case 'twitter':
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${ENV_CONFIG.twitterClientId}&redirect_uri=${redirect}&scope=tweet.read%20tweet.write%20users.read%20offline.access&code_challenge=challenge&code_challenge_method=plain`;

    case 'tiktok':
      return `https://www.tiktok.com/v2/auth/authorize/?client_key=${ENV_CONFIG.tiktokClientKey}&response_type=code&scope=user.info.basic,video.publish,video.upload&redirect_uri=${redirect}`;

    case 'pinterest':
      return `https://www.pinterest.com/oauth/?consumer_id=${ENV_CONFIG.pinterestAppId}&redirect_uri=${redirect}&response_type=token&scope=boards:read,pins:read,pins:write`;

    default:
      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${ENV_CONFIG.metaAppId}&redirect_uri=${redirect}`;
  }
}
