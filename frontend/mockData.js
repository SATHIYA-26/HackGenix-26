/**
 * Feedback Intelligence - Chattermill-Inspired Mock Dataset
 * Standardized across YouTube, Google Maps, Google Play, and Instagram
 */

const MOCK_BUSINESSES = [
  { id: "b1", name: "AeroScale Cloud Platform", domain: "aeroscale.io", category: "B2B SaaS" },
  { id: "b2", name: "FinPulse Banking", domain: "finpulse.app", category: "Fintech" },
  { id: "b3", name: "FitPulse Health & Gyms", domain: "fitpulse.co", category: "Consumer App" }
];

const MOCK_THEMES = [
  { id: "th-1", name: "API & Developer Experience", count: 482, sentimentScore: 84, sentiment: "positive", trend: "+14.2%" },
  { id: "th-2", name: "Pricing & Billing Clarity", count: 320, sentimentScore: 42, sentiment: "negative", trend: "-6.8%" },
  { id: "th-3", name: "Video Tutorials & Content", count: 890, sentimentScore: 92, sentiment: "positive", trend: "+22.5%" },
  { id: "th-4", name: "Mobile App Performance", count: 260, sentimentScore: 56, sentiment: "neutral", trend: "+3.1%" },
  { id: "th-5", name: "Customer Support Speed", count: 310, sentimentScore: 78, sentiment: "positive", trend: "+9.0%" },
  { id: "th-6", name: "Onboarding & Setup", count: 415, sentimentScore: 68, sentiment: "neutral", trend: "-2.4%" },
  { id: "th-7", name: "Feature Requests & Integrations", count: 540, sentimentScore: 75, sentiment: "positive", trend: "+11.3%" }
];

const MOCK_METRICS = {
  netSentiment: 76,
  netSentimentDelta: "+8.4%",
  totalFeedback: 4892,
  totalFeedbackDelta: "+18.2%",
  positivePct: 72,
  neutralPct: 18,
  negativePct: 10,
  sourceCounts: {
    youtube: 1840,
    google_maps: 1230,
    play_store: 980,
    instagram: 842
  }
};

const MOCK_FEEDBACK_ITEMS = [
  {
    id: "fb-101",
    business_id: "b1",
    source: "youtube",
    source_type: "comment",
    external_id: "Ugx9kL42xPQ188m",
    parent_external_id: null,
    author_name: "Sarah Lin (Staff Engineer)",
    author_url: "https://youtube.com/@sarahlin-tech",
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    text: "The YouTube video breakdown of the new FastAPI async pipeline is gold! Migrating our enterprise backend took 2 days instead of 2 weeks. Kudos to the engineering team for open-sourcing the blueprints.",
    rating: null,
    rating_scale: null,
    sentiment: "positive",
    sentiment_score: 96,
    theme: "Video Tutorials & Content",
    created_at: "2026-09-24T18:42:00Z",
    source_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw&lc=Ugx9kL42xPQ188m",
    metadata: {
      video_id: "jNQXAC9IVRw",
      video_title: "Building Production Multi-Source Feedback Pipelines with FastAPI & PostgreSQL",
      like_count: 142,
      total_reply_count: 2,
      is_reply: false
    },
    replies: [
      {
        id: "fb-101-r1",
        author_name: "DevRel Team",
        author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "Thanks Sarah! A deep-dive on PostgreSQL JSONB indexing for analytics is dropping next Tuesday.",
        created_at: "2026-09-24T19:15:00Z",
        like_count: 24
      }
    ]
  },
  {
    id: "fb-102",
    business_id: "b1",
    source: "youtube",
    source_type: "comment",
    external_id: "Ugznm02919xKKLa",
    parent_external_id: null,
    author_name: "Alex Thorne",
    author_url: "https://youtube.com/@alexthorne_dev",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    text: "Can anyone clarify the difference in the enterprise tier pricing? The demo says custom limits, but the documentation mentions standard quotas. It feels a bit opaque before booking a call.",
    rating: null,
    rating_scale: null,
    sentiment: "negative",
    sentiment_score: 28,
    theme: "Pricing & Billing Clarity",
    created_at: "2026-09-24T14:20:00Z",
    source_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw&lc=Ugznm02919xKKLa",
    metadata: {
      video_id: "jNQXAC9IVRw",
      video_title: "Building Production Multi-Source Feedback Pipelines with FastAPI & PostgreSQL",
      like_count: 18,
      total_reply_count: 1,
      is_reply: false
    }
  },
  {
    id: "fb-103",
    business_id: "b1",
    source: "google_maps",
    source_type: "review",
    external_id: "gm-rev-901",
    parent_external_id: null,
    author_name: "Marcus Vance",
    author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    text: "Attended their Developer Day workshop at the London HQ. Incredible hospitality, lightning fast WiFi, and the hands-on labs with the data analytics platform were top notch.",
    rating: 5.0,
    rating_scale: 5.0,
    sentiment: "positive",
    sentiment_score: 98,
    theme: "Onboarding & Setup",
    created_at: "2026-09-23T11:10:00Z",
    source_url: "https://maps.google.com/?cid=1029384",
    metadata: {
      location_name: "AeroScale HQ - London",
      review_likes: 9
    }
  },
  {
    id: "fb-104",
    business_id: "b1",
    source: "play_store",
    source_type: "review",
    external_id: "gp-app-881",
    parent_external_id: null,
    author_name: "Elena Rostova",
    author_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    text: "The dashboard notifications sometimes lag on Android 14 after backgrounding for a few hours. Other than that, viewing real-time feedback metrics on the go is indispensable.",
    rating: 3.0,
    rating_scale: 5.0,
    sentiment: "neutral",
    sentiment_score: 52,
    theme: "Mobile App Performance",
    created_at: "2026-09-22T08:30:00Z",
    source_url: "https://play.google.com/store/apps/details?id=com.aeroscale.dashboard",
    metadata: {
      app_version: "v2.4.1",
      device: "Pixel 8 Pro"
    }
  },
  {
    id: "fb-105",
    business_id: "b1",
    source: "instagram",
    source_type: "comment",
    external_id: "ig-comm-332",
    parent_external_id: null,
    author_name: "design_sprint_studio",
    author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    text: "That new sentiment trend UI on your carousel post is pure eye candy! Love the Chattermill-style theme categorization 🔥",
    rating: null,
    rating_scale: null,
    sentiment: "positive",
    sentiment_score: 94,
    theme: "Feature Requests & Integrations",
    created_at: "2026-09-21T16:05:00Z",
    source_url: "https://instagram.com/p/C_abc123",
    metadata: {
      post_type: "reel",
      like_count: 57
    }
  },
  {
    id: "fb-106",
    business_id: "b1",
    source: "youtube",
    source_type: "comment",
    external_id: "Ugx_9921_KLPo",
    parent_external_id: null,
    author_name: "Kavita Patel",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    text: "Subscribed immediately. Would love to see an upcoming video on scheduled synchronization using Celery + Redis workers.",
    rating: null,
    rating_scale: null,
    sentiment: "positive",
    sentiment_score: 88,
    theme: "Video Tutorials & Content",
    created_at: "2026-09-20T20:15:00Z",
    source_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw&lc=Ugx_9921_KLPo",
    metadata: {
      video_id: "jNQXAC9IVRw",
      like_count: 31,
      is_reply: false
    }
  },
  {
    id: "fb-107",
    business_id: "b1",
    source: "play_store",
    source_type: "review",
    external_id: "gp-rev-449",
    parent_external_id: null,
    author_name: "Liam O'Connor",
    author_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    text: "Customer support resolved my billing issue in under 5 minutes via the in-app chat. Super impressed with the quick turnaround.",
    rating: 5.0,
    rating_scale: 5.0,
    sentiment: "positive",
    sentiment_score: 95,
    theme: "Customer Support Speed",
    created_at: "2026-09-19T09:40:00Z",
    source_url: "https://play.google.com/store/apps/details?id=com.aeroscale.dashboard",
    metadata: {
      app_version: "v2.4.0",
      device: "Samsung S24"
    }
  }
];

const MOCK_AI_INSIGHTS = [
  {
    type: "positive_driver",
    badge: "Top Growth Driver",
    title: "Video Code Walkthroughs Drive +34% Higher Engagement",
    description: "Customers who interact with the YouTube tutorial series report 88% faster self-serve adoption with near-zero initial support tickets.",
    theme: "Video Tutorials & Content",
    impact: "+34% Sentiment"
  },
  {
    type: "friction_point",
    badge: "Friction Alert",
    title: "Enterprise Custom Tier Pricing Ambiguity",
    description: "32 customer comments flagged missing price transparency for custom multi-source quotas. Adding an interactive calculator is recommended.",
    theme: "Pricing & Billing Clarity",
    impact: "-18% Sentiment"
  },
  {
    type: "trending_request",
    badge: "Emerging Request",
    title: "Multi-Language Comment Analysis",
    description: "42 comments across YouTube and Play Store requested automated translation support for non-English customer feedback.",
    theme: "Feature Requests & Integrations",
    impact: "42 Mentions"
  }
];
