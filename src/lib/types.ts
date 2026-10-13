export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline: string;
  about: string;
  location?: string;
  followerCount?: number;
  connectionsCount?: number;
  experience?: Array<{ companyName: string; position: string; duration?: string; description?: string }>;
  education?: Array<{ schoolName: string; degree?: string; fieldOfStudy?: string }>;
  skills?: string[];
  interests?: Array<{ interestName: string }>;
  profilePicture?: string;
}

export interface InstagramPost {
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: string;
  displayUrl?: string;
  hashtags?: string[];
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  verified?: boolean;
  isBusinessAccount?: boolean;
  externalUrl?: string;
  profilePicUrlHD?: string;
  latestPosts?: InstagramPost[];
  private?: boolean;
}

export interface PersonAnalysis {
  name: string;
  identity: string;
  needs: string[];
  hobbies: string[];
  interests: string[];
  values: string[];
  lifestyle: string;
  personality: string;
  seeking: string;
  summary: string;
  evidence: Array<{ source: 'linkedin' | 'instagram'; quote: string }>;
}

export interface Person {
  id: string;
  name: string;
  slug: string;
  linkedinUrl: string;
  instagramUrl: string;
  headline: string;
  photo: string;
  analysis?: PersonAnalysis;
}

export interface DateMessage {
  speaker: string;
  text: string;
}

export interface DateScore {
  overall: number;
  values: number;
  lifestyle: number;
  interests: number;
  ambition: number;
  humor: number;
  reason: string;
}

export interface DateResult {
  a: string;
  b: string;
  transcript: DateMessage[];
  scoreForA: DateScore;
  scoreForB: DateScore;
}

export interface RankEntry {
  personId: string;
  name: string;
  headline: string;
  photo: string;
  score: number;
  reason: string;
}

export interface Ranking {
  personId: string;
  name: string;
  entries: RankEntry[];
}
