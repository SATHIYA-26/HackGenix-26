import { FeedbackItem, ProblemCluster, SourceIntegration } from './types';

export const sourcesData: SourceIntegration[] = [
  {
    id: 'surveys',
    name: 'NPS Survey',
    category: 'Surveys & In-App',
    status: 'connected',
    lastSync: '2 mins ago',
    totalIngested: 8420,
    color: '#3b82f6',
    iconName: 'clipboard-list'
  },
  {
    id: 'google_play',
    name: 'Google Play Store',
    category: 'App Stores',
    status: 'connected',
    lastSync: 'Just now',
    totalIngested: 14250,
    color: '#10b981',
    iconName: 'play'
  },
  {
    id: 'app_store',
    name: 'Apple App Store',
    category: 'App Stores',
    status: 'connected',
    lastSync: '5 mins ago',
    totalIngested: 11840,
    color: '#0ea5e9',
    iconName: 'apple'
  },
  {
    id: 'zendesk',
    name: 'Zendesk Support',
    category: 'Help Desk',
    status: 'connected',
    lastSync: '12 mins ago',
    totalIngested: 6920,
    color: '#059669',
    iconName: 'headphones'
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot Reviews',
    category: 'Public Reviews',
    status: 'connected',
    lastSync: '18 mins ago',
    totalIngested: 3410,
    color: '#047857',
    iconName: 'star'
  },
  {
    id: 'youtube',
    name: 'YouTube Comments',
    category: 'Community & Social',
    status: 'connected',
    lastSync: '30 mins ago',
    totalIngested: 5120,
    color: '#ef4444',
    iconName: 'youtube'
  },
  {
    id: 'stripe_webhooks',
    name: 'Stripe Dispute Signals',
    category: 'Financial Events',
    status: 'connected',
    lastSync: '1 min ago',
    totalIngested: 1650,
    color: '#6366f1',
    iconName: 'credit-card'
  }
];

export const problemClustersData: ProblemCluster[] = [
  {
    id: 'cluster-1',
    title: 'UPI Payment & Order Creation Failure',
    description: 'Payment gets debited from user bank via UPI/gateway, but backend order creation callback fails or hangs.',
    category: 'Payment / Transaction Failure',
    feedbackCount: 2341,
    growthRate: 240,
    negativeSentimentRate: 89,
    priority: 'CRITICAL',
    priorityScore: 94,
    scoringFactors: {
      frequency: 0.91,
      severity: 0.95,
      growth: 0.94,
      userImpact: 0.88,
      sentiment: 0.92
    },
    primaryPlatform: 'Android',
    primaryVersion: '4.2',
    estimatedRevenueImpactMonthly: 14400,
    detectedDaysAgo: 4,
    status: 'investigating',
    aiSummary: 'A rapidly increasing payment-confirmation failure is concentrated among Android 4.2 users. Customers experience bank debits with order status marked as cancelled or stuck. The issue stems from the transaction webhook callback dropping under concurrent gateway timeouts.',
    recommendedAction: 'Inspect payment callback gateway retries and decouple order reconciliation from synchronous client handshake.',
    representativeQuotes: [
      '"After the latest update my UPI payment succeeds, but the order gets cancelled."',
      '"Money got deducted from GPay and then the order was cancelled automatically."',
      '"UPI worked and bank debited ₹450, but I never got my food or any confirmation."'
    ]
  },
  {
    id: 'cluster-2',
    title: 'Post-Update Application Crash on Startup',
    description: 'App freezes immediately on splash screen or terminates abruptly upon cache initialization.',
    category: 'App Stability & Crash',
    feedbackCount: 1940,
    growthRate: 185,
    negativeSentimentRate: 92,
    priority: 'CRITICAL',
    priorityScore: 89,
    scoringFactors: {
      frequency: 0.84,
      severity: 0.96,
      growth: 0.85,
      userImpact: 0.89,
      sentiment: 0.94
    },
    primaryPlatform: 'iOS',
    primaryVersion: '18.1',
    estimatedRevenueImpactMonthly: 11600,
    detectedDaysAgo: 6,
    status: 'in_progress',
    aiSummary: 'Crash reports and negative App Store reviews surged following the v4.2.0 build. The crash triggers during the local SQLite schema migration when pre-existing notification preferences are deserialized.',
    recommendedAction: 'Roll out hotfix patch v4.2.1 with defensive fallback for schema migration deserialization null checks.',
    representativeQuotes: [
      '"App crashes right after updating to latest version. Cant even log in."',
      '"Latest version keeps closing on the opening logo. Tried reinstalling 3 times."',
      '"Instant crash when tapped on iOS. Please revert whatever you updated yesterday."'
    ]
  },
  {
    id: 'cluster-3',
    title: 'Delivery Partner Geolocation Lag',
    description: 'Live delivery driver tracking freezes or displays outdated GPS coordinates, causing customer anxiety.',
    category: 'Fulfillment & Logistics',
    feedbackCount: 1840,
    growthRate: 92,
    negativeSentimentRate: 78,
    priority: 'HIGH',
    priorityScore: 76,
    scoringFactors: {
      frequency: 0.79,
      severity: 0.68,
      growth: 0.72,
      userImpact: 0.81,
      sentiment: 0.78
    },
    primaryPlatform: 'Android',
    primaryVersion: 'All',
    estimatedRevenueImpactMonthly: 6500,
    detectedDaysAgo: 11,
    status: 'active',
    aiSummary: 'Customers report driver location jumping erratically or showing stationary status for 20+ minutes before sudden delivery arrival. WebSocket connection dropped without reconnection backoff.',
    recommendedAction: 'Implement heartbeat ping and automatic fallback to HTTP polling when socket drops.',
    representativeQuotes: [
      '"Map showed rider still at the restaurant when he was already ringing my doorbell."',
      '"Live tracking gets stuck for 15 minutes. Very confusing when waiting for urgent grocery."',
      '"Rider GPS doesn\'t update until order is marked completed."'
    ]
  },
  {
    id: 'cluster-4',
    title: 'Delayed Instant Refund Reversals',
    description: 'Promised instant refund to original payment source takes 5-7 business days without tracking status.',
    category: 'Billing & Refund',
    feedbackCount: 1780,
    growthRate: 44,
    negativeSentimentRate: 84,
    priority: 'HIGH',
    priorityScore: 71,
    scoringFactors: {
      frequency: 0.72,
      severity: 0.82,
      growth: 0.44,
      userImpact: 0.75,
      sentiment: 0.85
    },
    primaryPlatform: 'Web & Mobile',
    primaryVersion: 'All',
    estimatedRevenueImpactMonthly: 3000,
    detectedDaysAgo: 16,
    status: 'investigating',
    aiSummary: 'Refund timeline expectations are misaligned. UI states "Instant Refund" while banking settlement rails take up to 48 hours for certain cooperative banks.',
    recommendedAction: 'Update dynamic copy with realistic SLA per bank and add in-app refund ARN tracking widget.',
    representativeQuotes: [
      '"Cancelled order 4 days ago, still waiting for my money back. Support says wait 7 days."',
      '"Why say instant refund when it takes a week to reflect in my bank account?"',
      '"Refund status says processed but nothing received. Zero response from customer care."'
    ]
  },
  {
    id: 'cluster-5',
    title: 'OTP Delivery Latency on Checkout',
    description: 'SMS verification codes take 90-120 seconds to arrive, exceeding the 60-second validity timer.',
    category: 'Authentication / Checkout',
    feedbackCount: 960,
    growthRate: 15,
    negativeSentimentRate: 65,
    priority: 'MEDIUM',
    priorityScore: 54,
    scoringFactors: {
      frequency: 0.45,
      severity: 0.58,
      growth: 0.22,
      userImpact: 0.62,
      sentiment: 0.66
    },
    primaryPlatform: 'Android & iOS',
    primaryVersion: 'v4.1+',
    estimatedRevenueImpactMonthly: 1800,
    detectedDaysAgo: 24,
    status: 'resolved',
    aiSummary: 'Telecom routing bottlenecks in specific circle regions cause SMS OTP delay beyond session expiration, triggering multiple user retries and rate limits.',
    recommendedAction: 'Enabled secondary SMS gateway failover and introduced WhatsApp OTP fallback option.',
    representativeQuotes: [
      '"OTP arrives 2 minutes after the countdown expires. Then it says invalid code."',
      '"Couldn\'t complete checkout because SMS code never arrived on time."',
      '"Took 4 attempts to get one OTP to log in."'
    ]
  },
  {
    id: 'cluster-6',
    title: 'Search Filter & Category Indexing Lag',
    description: 'Product searches return partial results or outdated out-of-stock items due to indexing latency.',
    category: 'Discovery & Catalog',
    feedbackCount: 620,
    growthRate: 8,
    negativeSentimentRate: 52,
    priority: 'LOW',
    priorityScore: 38,
    scoringFactors: {
      frequency: 0.35,
      severity: 0.34,
      growth: 0.12,
      userImpact: 0.45,
      sentiment: 0.52
    },
    primaryPlatform: 'Web',
    primaryVersion: 'Web v3.8',
    estimatedRevenueImpactMonthly: 1400,
    detectedDaysAgo: 30,
    status: 'active',
    aiSummary: 'ElasticSearch cache invalidation takes up to 4 minutes during peak catalog re-pricing windows.',
    recommendedAction: 'Optimize CDC delta pipelines for real-time inventory decrement sync.',
    representativeQuotes: [
      '"Items show in stock on search, but when I click they are sold out."',
      '"Filter by price doesn\'t work properly, shows higher priced items first."',
      '"Search is super sluggish when typing fast on mobile web."'
    ]
  }
];

export const feedbackEvidenceList: FeedbackItem[] = [
  {
    id: 'fb-101',
    source: 'google_play',
    sourceName: 'Google Play Store',
    sourceIcon: 'play',
    author: 'Karthik Raman',
    rating: 1,
    timestamp: '18 minutes ago',
    text: 'After the latest update my UPI payment succeeds, but the order gets cancelled. Debited ₹680 from my account and support bot has no answers!! Extremely frustrating.',
    sentiment: 'negative',
    sentimentScore: -0.92,
    intent: 'Payment / Transaction Failure',
    platform: 'Android',
    version: '4.2',
    location: 'Bengaluru, IN',
    semanticSimilarity: 0.96,
    clusterId: 'cluster-1'
  },
  {
    id: 'fb-102',
    source: 'zendesk',
    sourceName: 'Zendesk Ticket #48291',
    sourceIcon: 'headphones',
    author: 'Priya Sundaram',
    rating: 1,
    timestamp: '42 minutes ago',
    text: 'Money got deducted from my Google Pay at 1:15 PM and then the order was immediately cancelled by your app. Order ID #99214. Please refund immediately or fulfill the order.',
    sentiment: 'negative',
    sentimentScore: -0.88,
    intent: 'Payment / Transaction Failure',
    platform: 'Android',
    version: '4.2',
    location: 'Chennai, IN',
    semanticSimilarity: 0.94,
    clusterId: 'cluster-1'
  },
  {
    id: 'fb-103',
    source: 'app_store',
    sourceName: 'Apple App Store',
    sourceIcon: 'apple',
    author: 'Rahul M.',
    rating: 1,
    timestamp: '1 hour ago',
    text: 'App crashes immediately on splash screen after the update today. Cannot even open the home tab. Reinstalled twice and still broken on iOS 18.1.',
    sentiment: 'negative',
    sentimentScore: -0.95,
    intent: 'App Stability & Crash',
    platform: 'iOS',
    version: '18.1',
    location: 'Mumbai, IN',
    semanticSimilarity: 0.93,
    clusterId: 'cluster-2'
  },
  {
    id: 'fb-104',
    source: 'youtube',
    sourceName: 'YouTube Review Comment',
    sourceIcon: 'youtube',
    author: 'TechGuru_Reviews',
    rating: 2,
    timestamp: '2 hours ago',
    text: 'Used UPI and money was debited but the screen showed Order Failed. This bug has been happening frequently since the last weekend rollout. Many subscribers reporting the same.',
    sentiment: 'negative',
    sentimentScore: -0.84,
    intent: 'Payment / Transaction Failure',
    platform: 'Android',
    version: '4.2',
    location: 'Delhi, IN',
    semanticSimilarity: 0.91,
    clusterId: 'cluster-1'
  },
  {
    id: 'fb-105',
    source: 'surveys',
    sourceName: 'Post-Checkout NPS Survey',
    sourceIcon: 'clipboard-list',
    author: 'Ananya S.',
    rating: 2,
    timestamp: '3 hours ago',
    text: 'Driver live tracking froze at the pickup hub for 25 minutes. Suddenly he arrived at my gate. Please fix the map tracking accuracy.',
    sentiment: 'negative',
    sentimentScore: -0.72,
    intent: 'Fulfillment & Logistics',
    platform: 'Android',
    version: '4.1',
    location: 'Hyderabad, IN',
    semanticSimilarity: 0.89,
    clusterId: 'cluster-3'
  },
  {
    id: 'fb-106',
    source: 'trustpilot',
    sourceName: 'Trustpilot Verified Review',
    sourceIcon: 'star',
    author: 'Vikram Joshi',
    rating: 1,
    timestamp: '4 hours ago',
    text: 'It has been 6 days since an order cancellation and the "instant refund" is nowhere to be found. The status says processed but bank says nothing came.',
    sentiment: 'negative',
    sentimentScore: -0.86,
    intent: 'Billing & Refund',
    platform: 'Web',
    version: 'Web v3.8',
    location: 'Pune, IN',
    semanticSimilarity: 0.92,
    clusterId: 'cluster-4'
  },
  {
    id: 'fb-107',
    source: 'google_play',
    sourceName: 'Google Play Store',
    sourceIcon: 'play',
    author: 'Deepak Verma',
    rating: 1,
    timestamp: '5 hours ago',
    text: 'UPI worked and bank debited ₹450, but I never got my order confirmation or any receipt. App just sent me back to cart page! Fix this immediately.',
    sentiment: 'negative',
    sentimentScore: -0.91,
    intent: 'Payment / Transaction Failure',
    platform: 'Android',
    version: '4.2',
    location: 'Ahmedabad, IN',
    semanticSimilarity: 0.95,
    clusterId: 'cluster-1'
  },
  {
    id: 'fb-108',
    source: 'stripe_webhooks',
    sourceName: 'Stripe Webhook Alert #9042',
    sourceIcon: 'credit-card',
    author: 'System Auto-Event',
    rating: 1,
    timestamp: '6 hours ago',
    text: 'Webhook callback delivery timeout on /api/v1/payments/verify. HTTP 504 Gateway Timeout returned from downstream microservice.',
    sentiment: 'negative',
    sentimentScore: -0.79,
    intent: 'Payment / Transaction Failure',
    platform: 'API',
    version: 'Backend v2.4',
    location: 'AWS ap-south-1',
    semanticSimilarity: 0.88,
    clusterId: 'cluster-1'
  }
];

export const sentimentBreakdown = {
  score: 24, // Net Sentiment Points
  label: 'NPS Points',
  change: '+3.8 pts vs last month',
  totalResponses: 51590,
  positivePercentage: 58,
  neutralPercentage: 18,
  negativePercentage: 24,
  sparklineData: [29, 28, 31, 30, 32, 28, 27, 26, 25, 23, 21, 24, 25, 24]
};

export const revenueImpactDistribution = [
  { label: 'Payment Fail', mrr: 14.4, count: '14.4k', severity: 'Critical', color: '#e11d48' },
  { label: 'App Crash', mrr: 11.6, count: '11.6k', severity: 'Critical', color: '#e11d48' },
  { label: 'Tracking Lag', mrr: 6.5, count: '6.5k', severity: 'High', color: '#e11d48' },
  { label: 'Refund Delay', mrr: 3.0, count: '3.0k', severity: 'High', color: '#e11d48' },
  { label: 'OTP Expiry', mrr: 1.8, count: '1.8k', severity: 'Medium', color: '#e11d48' },
  { label: 'Search Lag', mrr: 1.4, count: '1.4k', severity: 'Low', color: '#e11d48' }
];
