export type SentimentType = 'positive' | 'neutral' | 'negative';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FeedbackSource = 
  | 'google_play'
  | 'app_store'
  | 'zendesk'
  | 'youtube'
  | 'trustpilot'
  | 'surveys'
  | 'stripe_webhooks';

export interface FeedbackItem {
  id: string;
  source: FeedbackSource;
  sourceName: string;
  sourceIcon: string;
  author: string;
  rating: number; // 1 to 5
  timestamp: string;
  text: string;
  sentiment: SentimentType;
  sentimentScore: number; // -1.0 to 1.0
  intent: string;
  platform: 'Android' | 'iOS' | 'Web' | 'API';
  version?: string;
  location?: string;
  semanticSimilarity: number; // e.g. 0.94
  clusterId: string;
}

export interface ProblemCluster {
  id: string;
  title: string;
  description: string;
  category: string;
  feedbackCount: number;
  growthRate: number; // e.g. 240 for +240%
  negativeSentimentRate: number; // e.g. 89 for 89%
  priority: PriorityLevel;
  priorityScore: number; // 0 - 100
  scoringFactors: {
    frequency: number;   // 0.0 - 1.0
    severity: number;    // 0.0 - 1.0
    growth: number;      // 0.0 - 1.0
    userImpact: number;  // 0.0 - 1.0
    sentiment: number;   // 0.0 - 1.0
  };
  primaryPlatform: string;
  primaryVersion: string;
  estimatedRevenueImpactMonthly: number; // in USD
  detectedDaysAgo: number;
  status: 'active' | 'investigating' | 'in_progress' | 'resolved';
  aiSummary: string;
  recommendedAction: string;
  representativeQuotes: string[];
}

export interface SourceIntegration {
  id: FeedbackSource;
  name: string;
  category: string;
  status: 'connected' | 'syncing' | 'paused' | 'error';
  lastSync: string;
  totalIngested: number;
  color: string;
  iconName: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  isPositiveChange: boolean;
  subtitle: string;
  sparkline: number[];
}
