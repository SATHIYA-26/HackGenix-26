/**
 * Reviewr - Multi-Persona Mock Data & Predefined Credentials
 */

const PREDEFINED_USERS = [
  {
    email: "admin@manisbiriyani.com",
    password: "password123",
    accountId: "acc_manis",
    name: "Mani (Founder & Operations)",
    businessName: "Mani's Dum Biriyani",
    role: "Chain Owner",
    type: "google_maps",
    typeLabel: "Google Maps Business (Multi-Branch)"
  },
  {
    email: "murali@chepauksports.com",
    password: "password123",
    accountId: "acc_chepauk",
    name: "Murali Ranganathan",
    businessName: "Chepauk Sports Store",
    role: "Managing Director",
    type: "google_maps",
    typeLabel: "Google Maps Retail Store"
  },
  {
    email: "store.mylapore@hm.com",
    password: "password123",
    accountId: "acc_hm",
    name: "Divya Sharma",
    businessName: "H&M Mylapore Branch",
    role: "Showroom Store Lead",
    type: "google_maps",
    typeLabel: "Google Maps Fashion Retail"
  },
  {
    email: "sidhu@vjsidhuvlogs.com",
    password: "password123",
    accountId: "acc_vj_sidhu",
    name: "VJ Sidhu & Production Team",
    businessName: "VJ Sidhu Vlogs",
    role: "YouTube Creator Channel",
    type: "youtube",
    typeLabel: "YouTube Channel (Creator Studio)"
  },
  {
    email: "product.android@spotify.com",
    password: "password123",
    accountId: "acc_spotify",
    name: "Gustav Söderström",
    businessName: "Spotify",
    role: "Head of Mobile & CX",
    type: "play_store",
    typeLabel: "Google Play Store App"
  }
];

const REVIEWR_ACCOUNTS = [
  {
    id: "acc_manis",
    name: "Mani's Dum Biriyani",
    handle: "@manis_dum_biriyani",
    category: "Food & Restaurant Chain",
    type: "google_maps",
    typeLabel: "Google Maps Business",
    userEmail: "admin@manisbiriyani.com",
    userName: "Mani (Founder)",
    avatar: "assets/logos/manis_dum_biriyani.png",
    ratingAvg: 4.4,
    totalReviews: "14,280",
    locations: ["All Branches", "T. Nagar (Flagship)", "Velachery", "Anna Nagar", "Indiranagar (BLR)"],
    primaryMetricLabel: "Average Star Rating",
    primaryMetricValue: "4.4 ★",
    primaryMetricTrend: "▲ +0.3 vs last month",
    sentimentScore: 78,
    positivePct: 76,
    neutralPct: 14,
    negativePct: 10,
    metrics: {
      totalFeedback: "14,280",
      totalFeedbackDelta: "+12.4%",
      netSentiment: "+78",
      netSentimentDelta: "+6.8%",
      responseRate: "94.2%",
      activeThemes: 14
    },
    themes: [
      { id: "th-mb-1", name: "Mutton Biriyani & Meat Tenderness", count: 4120, sentimentScore: 92, sentiment: "positive", trend: "+18.4%" },
      { id: "th-mb-2", name: "Delivery Speed & Packaging", count: 2840, sentimentScore: 64, sentiment: "neutral", trend: "-4.2%" },
      { id: "th-mb-3", name: "Seating Wait Time on Weekends", count: 1950, sentimentScore: 38, sentiment: "negative", trend: "-9.1%" },
      { id: "th-mb-4", name: "Brinjal Curry & Raita Quality", count: 3200, sentimentScore: 88, sentiment: "positive", trend: "+14.0%" },
      { id: "th-mb-5", name: "Hygiene & Dining Ambience", count: 2170, sentimentScore: 82, sentiment: "positive", trend: "+8.5%" }
    ],
    insights: [
      {
        type: "positive_driver",
        badge: "Top Delight Factor",
        title: "Signature Mutton Biriyani Aromatics & Meat Portioning",
        description: "Over 88% of Google Maps reviews for T. Nagar and Velachery branches specifically praise the succulent meat pieces and consistent authentic spices.",
        theme: "Mutton Biriyani & Meat Tenderness",
        impact: "+42% Star Rating Lift"
      },
      {
        type: "friction_point",
        badge: "Branch Friction Alert",
        title: "Weekend Peak Wait Times Exceeding 35 Minutes in Anna Nagar",
        description: "142 recent weekend diners left 3-star reviews citing limited waiting lobby seating and queue bottlenecks during Sunday lunch rush (1:00 PM - 3:30 PM).",
        theme: "Seating Wait Time on Weekends",
        impact: "-22% Weekend Rating"
      },
      {
        type: "trending_request",
        badge: "Customer Demand",
        title: "Family Party Bucket Delivery Requests in Indiranagar",
        description: "56 Google reviews this month inquired about 5kg and 10kg party pack pre-orders for corporate catering.",
        theme: "Delivery Speed & Packaging",
        impact: "56 Inquiries"
      }
    ],
    feedbackItems: [
      {
        id: "mb-1",
        source: "google_maps",
        source_type: "review",
        branch: "T. Nagar (Flagship)",
        external_id: "gm_mb_101",
        author_name: "Karthik Sundaram (Local Guide · Level 7)",
        author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        rating: 5.0,
        sentiment: "positive",
        theme: "Mutton Biriyani & Meat Tenderness",
        created_at: "2026-09-24T13:10:00Z",
        text: "The Mutton Dum Biriyani here is undefeated in Chennai! Rice is perfectly separated with no excess oil, meat pieces melt off the bone, and the complimentary sweet beeda wraps up the meal splendidly. Worth the 15 min wait.",
        source_url: "https://maps.google.com/?cid=109281",
        metadata: { branch: "T. Nagar", review_likes: 24, dine_in: true }
      },
      {
        id: "mb-2",
        source: "google_maps",
        source_type: "review",
        branch: "Anna Nagar",
        external_id: "gm_mb_102",
        author_name: "Pooja Venkatesh",
        author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 3.0,
        sentiment: "negative",
        theme: "Seating Wait Time on Weekends",
        created_at: "2026-09-23T14:30:00Z",
        text: "Food was tasty as always, but Anna Nagar branch management on Sunday was chaotic. Had to wait 40 mins with elderly parents standing outside in the sun because the waiting area was completely packed. Please add token display systems.",
        source_url: "https://maps.google.com/?cid=109282",
        metadata: { branch: "Anna Nagar", review_likes: 19, dine_in: true }
      },
      {
        id: "mb-3",
        source: "google_maps",
        source_type: "review",
        branch: "Velachery",
        external_id: "gm_mb_103",
        author_name: "Arun Prakash",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 5.0,
        sentiment: "positive",
        theme: "Brinjal Curry & Raita Quality",
        created_at: "2026-09-22T19:45:00Z",
        text: "Velachery branch has super clean seating and lightning quick service. The kathirikai (brinjal) gravy is rich and complements the biriyani flawlessly. 10/10 recommended for family dinners.",
        source_url: "https://maps.google.com/?cid=109283",
        metadata: { branch: "Velachery", review_likes: 8, dine_in: true }
      },
      {
        id: "mb-4",
        source: "google_maps",
        source_type: "review",
        branch: "Indiranagar (BLR)",
        external_id: "gm_mb_104",
        author_name: "Deepak Menon",
        author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        rating: 4.0,
        sentiment: "neutral",
        theme: "Delivery Speed & Packaging",
        created_at: "2026-09-21T21:00:00Z",
        text: "Ordered delivery via food app. Packaging was leak-proof and hot on arrival. Rice portion was generous for 2 people, though I wish extra raita was provided by default.",
        source_url: "https://maps.google.com/?cid=109284",
        metadata: { branch: "Indiranagar", review_likes: 5, delivery: true }
      }
    ]
  },

  {
    id: "acc_chepauk",
    name: "Chepauk Sports Store",
    handle: "@chepauk_sports",
    category: "Sports & Cricket Retail",
    type: "google_maps",
    typeLabel: "Google Maps Business",
    userEmail: "murali@chepauksports.com",
    userName: "Murali Ranganathan",
    avatar: "assets/logos/chepauk_sports.png",
    ratingAvg: 4.7,
    totalReviews: "3,890",
    locations: ["Main Showroom (Chepauk)", "Anna Salai Outlet"],
    primaryMetricLabel: "Store Star Rating",
    primaryMetricValue: "4.7 ★",
    primaryMetricTrend: "▲ +0.2 vs last month",
    sentimentScore: 86,
    positivePct: 84,
    neutralPct: 10,
    negativePct: 6,
    metrics: {
      totalFeedback: "3,890",
      totalFeedbackDelta: "+8.9%",
      netSentiment: "+86",
      netSentimentDelta: "+5.1%",
      responseRate: "98.0%",
      activeThemes: 9
    },
    themes: [
      { id: "th-cs-1", name: "English Willow Bat Knocking & Oiling", count: 1420, sentimentScore: 96, sentiment: "positive", trend: "+24.0%" },
      { id: "th-cs-2", name: "Cricket Gear & Padding Quality", count: 980, sentimentScore: 90, sentiment: "positive", trend: "+11.2%" },
      { id: "th-cs-3", name: "Store Staff Expertise & Guidance", count: 850, sentimentScore: 88, sentiment: "positive", trend: "+7.4%" },
      { id: "th-cs-4", name: "Weekend Parking Availability", count: 640, sentimentScore: 45, sentiment: "negative", trend: "-5.3%" }
    ],
    insights: [
      {
        type: "positive_driver",
        badge: "Customer Praise Driver",
        title: "In-Store Machine Bat Knocking Excellence",
        description: "Customers praise the 10,000-stroke automated bat knocking machine service that readies match bats in 24 hours.",
        theme: "English Willow Bat Knocking & Oiling",
        impact: "+96% Positive Sentiment"
      },
      {
        type: "friction_point",
        badge: "Logistics Friction",
        title: "Limited Two-Wheeler / Car Parking Near Chepauk Stadium Gate",
        description: "Reviews frequently mention tight parking near Bell's Road during match days.",
        theme: "Weekend Parking Availability",
        impact: "-14% Store Visit Score"
      },
      {
        type: "trending_request",
        badge: "Product Demand",
        title: "Demand for Custom Team Sublimation Jerseys",
        description: "Over 38 inquiries from local corporate cricket teams for custom uniform bulk printing.",
        theme: "Cricket Gear & Padding Quality",
        impact: "38 Bulk Requests"
      }
    ],
    feedbackItems: [
      {
        id: "cs-1",
        source: "google_maps",
        source_type: "review",
        branch: "Main Showroom (Chepauk)",
        external_id: "gm_cs_201",
        author_name: "Vignesh Ranganathan",
        author_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100",
        rating: 5.0,
        sentiment: "positive",
        theme: "English Willow Bat Knocking & Oiling",
        created_at: "2026-09-24T16:00:00Z",
        text: "Got my SS Ton English Willow knocked and oiled here. The ping on the sweet spot is unreal now! The owner Murali is an ex-league player and spent 30 mins helping me pick the perfect weight balance. Best cricket store in Chennai.",
        source_url: "https://maps.google.com/?cid=209811",
        metadata: { branch: "Chepauk Main", verified_buyer: true }
      },
      {
        id: "cs-2",
        source: "google_maps",
        source_type: "review",
        branch: "Main Showroom (Chepauk)",
        external_id: "gm_cs_202",
        author_name: "Gautham Nair",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 4.0,
        sentiment: "neutral",
        theme: "Weekend Parking Availability",
        created_at: "2026-09-22T11:20:00Z",
        text: "Top tier cricket gear selection and genuine SG/Kookaburra balls. Only problem is parking on Bell's road on a Saturday afternoon. Better to take metro to Government Estate station.",
        source_url: "https://maps.google.com/?cid=209812",
        metadata: { branch: "Chepauk Main", review_likes: 12 }
      }
    ]
  },

  {
    id: "acc_hm",
    name: "H&M Mylapore Branch",
    handle: "@hm_mylapore",
    category: "Fashion Retail Showroom",
    type: "google_maps",
    typeLabel: "Google Maps Retail",
    userEmail: "store.mylapore@hm.com",
    userName: "Divya Sharma",
    avatar: "assets/logos/hm_mylapore.png",
    ratingAvg: 4.2,
    totalReviews: "5,410",
    locations: ["Mylapore High Road Flagship"],
    primaryMetricLabel: "Store Customer Rating",
    primaryMetricValue: "4.2 ★",
    primaryMetricTrend: "▲ +0.1 vs last month",
    sentimentScore: 72,
    positivePct: 70,
    neutralPct: 18,
    negativePct: 12,
    metrics: {
      totalFeedback: "5,410",
      totalFeedbackDelta: "+15.3%",
      netSentiment: "+72",
      netSentimentDelta: "+3.2%",
      responseRate: "89.5%",
      activeThemes: 11
    },
    themes: [
      { id: "th-hm-1", name: "Summer & Linen Collection Quality", count: 1850, sentimentScore: 88, sentiment: "positive", trend: "+19.2%" },
      { id: "th-hm-2", name: "Trial Room Queue Wait Times", count: 1420, sentimentScore: 40, sentiment: "negative", trend: "-11.4%" },
      { id: "th-hm-3", name: "Billing Counter Speed & Self-Checkout", count: 1210, sentimentScore: 52, sentiment: "neutral", trend: "-3.0%" },
      { id: "th-hm-4", name: "Staff Hospitality & Floor Assistance", count: 930, sentimentScore: 78, sentiment: "positive", trend: "+6.5%" }
    ],
    insights: [
      {
        type: "positive_driver",
        badge: "Style Trend Leader",
        title: "Linen & Casual Workwear Collection Surge",
        description: "Customers love the breathable linen shirts and summer pastel drops suited for Chennai heat.",
        theme: "Summer & Linen Collection Quality",
        impact: "+88% Positive Feedback"
      },
      {
        type: "friction_point",
        badge: "In-Store Bottleneck",
        title: "15+ Min Wait for Women's Fitting Rooms on Friday Evenings",
        description: "Customer reviews highlight long fitting room queues during sale weekends.",
        theme: "Trial Room Queue Wait Times",
        impact: "-28% In-Store Experience Score"
      },
      {
        type: "trending_request",
        badge: "Service Demand",
        title: "Self-Checkout Kiosk Integration",
        description: "48 shoppers requested automated self-billing kiosks to skip the 1st-floor central register queue.",
        theme: "Billing Counter Speed & Self-Checkout",
        impact: "48 Shopper Requests"
      }
    ],
    feedbackItems: [
      {
        id: "hm-1",
        source: "google_maps",
        source_type: "review",
        branch: "Mylapore High Road",
        external_id: "gm_hm_301",
        author_name: "Sneha Krishnan",
        author_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        rating: 5.0,
        sentiment: "positive",
        theme: "Summer & Linen Collection Quality",
        created_at: "2026-09-24T18:20:00Z",
        text: "The linen shirt collection this season is breathtaking! Aesthetic store layout with ample walking space across both floors. The staff assisted in fetching the exact size from inventory within 2 minutes.",
        source_url: "https://maps.google.com/?cid=309811",
        metadata: { branch: "Mylapore", verified_visit: true }
      },
      {
        id: "hm-2",
        source: "google_maps",
        source_type: "review",
        branch: "Mylapore High Road",
        external_id: "gm_hm_302",
        author_name: "Roshini Bala",
        author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
        rating: 2.0,
        sentiment: "negative",
        theme: "Trial Room Queue Wait Times",
        created_at: "2026-09-23T19:15:00Z",
        text: "Only 3 out of 6 trial rooms were open on a Friday evening with 20 people waiting in line. Took 25 mins just to try on two tops. Great clothes, but store floor operations need improvement.",
        source_url: "https://maps.google.com/?cid=309812",
        metadata: { branch: "Mylapore", review_likes: 15 }
      }
    ]
  },

  {
    id: "acc_vj_sidhu",
    name: "VJ Sidhu Vlogs",
    handle: "@VJSidhuVlogs",
    category: "YouTube Creator & Media Channel",
    type: "youtube",
    typeLabel: "YouTube Channel",
    userEmail: "sidhu@vjsidhuvlogs.com",
    userName: "VJ Sidhu",
    avatar: "assets/logos/vj_sidhu_vlogs.png",
    ratingAvg: null,
    totalReviews: "0",
    locations: ["Channel-wide", "Live Video Stream"],
    primaryMetricLabel: "Total Video Comments",
    primaryMetricValue: "0",
    primaryMetricTrend: "Awaiting Live Sync",
    sentimentScore: 0,
    positivePct: 0,
    neutralPct: 0,
    negativePct: 0,
    metrics: {
      totalFeedback: "0",
      totalFeedbackDelta: "Live Ingestion",
      netSentiment: "0",
      netSentimentDelta: "0%",
      commentEngagement: "0%",
      activeThemes: 0
    },
    themes: [],
    insights: [],
    feedbackItems: []
  },

  {
    id: "acc_spotify",
    name: "Spotify",
    handle: "com.spotify.music",
    category: "Audio Streaming & Media App",
    type: "play_store",
    typeLabel: "Google Play Store App",
    userEmail: "product.android@spotify.com",
    userName: "Gustav Söderström",
    avatar: "assets/logos/spotify.png",
    ratingAvg: 4.3,
    totalReviews: "32,450,000",
    locations: ["Version v8.9.72 (Latest)", "Version v8.9.68", "Android 14 Builds", "Android 13 Builds"],
    primaryMetricLabel: "Play Store App Rating",
    primaryMetricValue: "4.3 ★",
    primaryMetricTrend: "▼ -0.1 vs previous release",
    sentimentScore: 68,
    positivePct: 66,
    neutralPct: 18,
    negativePct: 16,
    metrics: {
      totalFeedback: "32.45M",
      totalFeedbackDelta: "+4.2%",
      netSentiment: "+68",
      netSentimentDelta: "-2.4%",
      crashFreeRate: "99.82%",
      activeThemes: 22
    },
    themes: [
      { id: "th-sp-1", name: "Personalized Daily Mix & Discover Weekly", count: 840000, sentimentScore: 94, sentiment: "positive", trend: "+14.0%" },
      { id: "th-sp-2", name: "Lossless Audio & HiFi Streaming Request", count: 520000, sentimentScore: 50, sentiment: "neutral", trend: "+6.1%" },
      { id: "th-sp-3", name: "Offline Download Sync Bugs on SD Card", count: 390000, sentimentScore: 32, sentiment: "negative", trend: "-18.2%" },
      { id: "th-sp-4", name: "Lyrics Sync & Real-Time Karaoke Mode", count: 680000, sentimentScore: 91, sentiment: "positive", trend: "+21.4%" },
      { id: "th-sp-5", name: "CarPlay & Android Auto Connectivity", count: 290000, sentimentScore: 58, sentiment: "neutral", trend: "-2.5%" }
    ],
    insights: [
      {
        type: "positive_driver",
        badge: "Algorithmic Delight",
        title: "Discover Weekly AI Recommendation Accuracy",
        description: "Over 90% of positive Play Store reviews praise the daylist and algorithm for discovering indie artists.",
        theme: "Personalized Daily Mix & Discover Weekly",
        impact: "+94% User Satisfaction"
      },
      {
        type: "friction_point",
        badge: "Regression Bug Alert",
        title: "Offline Download Files Corrupted on Android 14 Update",
        description: "A spike of 1-star reviews on release v8.9.70 reported downloaded podcasts disappearing after system reboot.",
        theme: "Offline Download Sync Bugs on SD Card",
        impact: "-32% App Health Score"
      },
      {
        type: "trending_request",
        badge: "Feature Demand",
        title: "Hi-Res FLAC Lossless Audio Streaming",
        description: "Audiophiles and premium subscribers frequently demand lossless 24-bit/192kHz bitrate tiers.",
        theme: "Lossless Audio & HiFi Streaming Request",
        impact: "520K Review Mentions"
      }
    ],
    feedbackItems: [
      {
        id: "sp-1",
        source: "play_store",
        source_type: "review",
        branch: "v8.9.72 (Android 14)",
        external_id: "gp_sp_501",
        author_name: "Aditya Verma",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 5.0,
        sentiment: "positive",
        theme: "Personalized Daily Mix & Discover Weekly",
        created_at: "2026-09-24T15:30:00Z",
        text: "The new daylist feature is spooky good. It knows exactly when I need ambient focus lofi at 9 AM and hype gym EDM by 6 PM. UI is buttery smooth on 120Hz display.",
        source_url: "https://play.google.com/store/apps/details?id=com.spotify.music",
        metadata: { app_version: "v8.9.72", device: "OnePlus 12", device_os: "Android 14" }
      },
      {
        id: "sp-2",
        source: "play_store",
        source_type: "review",
        branch: "v8.9.72 (Android 14)",
        external_id: "gp_sp_502",
        author_name: "Maya Lin",
        author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 2.0,
        sentiment: "negative",
        theme: "Offline Download Sync Bugs on SD Card",
        created_at: "2026-09-23T12:10:00Z",
        text: "I pay for Premium family plan specifically for offline flights. But since last week's update, my 400 downloaded tracks keep failing to play when airplane mode is turned on! Please release a hotfix immediately.",
        source_url: "https://play.google.com/store/apps/details?id=com.spotify.music",
        metadata: { app_version: "v8.9.70", device: "Galaxy S23 Ultra", device_os: "Android 14" }
      },
      {
        id: "sp-3",
        source: "play_store",
        source_type: "review",
        branch: "v8.9.68",
        external_id: "gp_sp_503",
        author_name: "Rohan Chatterjee",
        author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        rating: 5.0,
        sentiment: "positive",
        theme: "Lyrics Sync & Real-Time Karaoke Mode",
        created_at: "2026-09-22T08:45:00Z",
        text: "Live synchronized lyrics and translation feature is unbeatable. Makes road trips with friends an absolute blast.",
        source_url: "https://play.google.com/store/apps/details?id=com.spotify.music",
        metadata: { app_version: "v8.9.68", device: "Pixel 8 Pro" }
      }
    ]
  }
];

export const HERO_FINANCIAL_MODELS = {
  "30d": {
    revenue: "₹8,40,000",
    revenueLift: "+16.2% MoM",
    churn: "₹3,10,000",
    churnRate: "96.5% Saved",
    roi: "11.4x",
    lineD: "M 30,210 Q 200,190 350,170 T 620,120 T 870,70",
    areaD: "M 30,210 Q 200,190 350,170 T 620,120 T 870,70 L 870,230 L 30,230 Z"
  },
  "90d": {
    revenue: "₹24,80,000",
    revenueLift: "+24.6% ARR",
    churn: "₹9,45,000",
    churnRate: "98.2% Saved",
    roi: "14.8x",
    lineD: "M 30,210 Q 180,180 320,150 T 600,80 T 870,30",
    areaD: "M 30,210 Q 180,180 320,150 T 600,80 T 870,30 L 870,230 L 30,230 Z"
  },
  "1y": {
    revenue: "₹1,12,50,000",
    revenueLift: "+41.8% YoY",
    churn: "₹38,20,000",
    churnRate: "99.4% Saved",
    roi: "22.6x",
    lineD: "M 30,220 Q 150,190 300,130 T 580,50 T 870,15",
    areaD: "M 30,220 Q 150,190 300,130 T 580,50 T 870,15 L 870,230 L 30,230 Z"
  }
};

export const NLP_SAMPLES = [
  {
    text: "Ordered mutton biriyani at T. Nagar branch yesterday. The meat was remarkably tender and aromatic (+0.94), but the Sunday lunchtime queue took over 40 minutes to seat us!",
    sentiment: "positive",
    badgeText: "POSITIVE (+78)",
    polarity: "Compound Polarity: +0.784",
    summary: "Strong positive polarity on food quality and seasoning, offset by localized negative friction on physical wait times.",
    theme: "Mutton Biriyani & Meat Tenderness",
    themeBg: "#F3E8FF",
    themeColor: "#7C3AED",
    entities: '"mutton biriyani", "T. Nagar branch", "Sunday queue"',
    recTag: "friction_point",
    recTagLabel: "Branch Friction Alert",
    recText: "Deploy digital token queue system during Sunday lunch peak (1-3 PM) in T. Nagar branch."
  },
  {
    text: "Spotify audio quality and Discover Weekly recommendations are elite, but offline downloads crash on Android 14 after latest v8.9.42 update.",
    sentiment: "negative",
    badgeText: "NEGATIVE (-64)",
    polarity: "Compound Polarity: -0.642",
    summary: "Critical technical issue identified: Core playback works but major failure reported on local storage cache sync on Android 14.",
    theme: "Android 14 Offline Sync & Downloads",
    themeBg: "#FFF1F2",
    themeColor: "#E11D48",
    entities: '"Discover Weekly", "offline downloads", "Android 14", "v8.9.42"',
    recTag: "friction_point",
    recTagLabel: "Critical Bug Alert",
    recText: "Hotfix build v8.9.43 recommended for Android 14 scoped storage permissions to restore 4.8★ app store rating."
  },
  {
    text: "VJ Sidhu comedy timing with the team in the Madurai street food video was peak entertainment! The 4K drone cinematography of the temple was stunning.",
    sentiment: "positive",
    badgeText: "POSITIVE (+96)",
    polarity: "Compound Polarity: +0.962",
    summary: "Overwhelmingly positive community sentiment celebrating humor, crew camaraderie, and production cinematography.",
    theme: "Comedy Banter & Travel Crew Chemistry",
    themeBg: "#ECFDF5",
    themeColor: "#059669",
    entities: '"Madurai street food", "4K drone cinematography", "comedy timing"',
    recTag: "positive_driver",
    recTagLabel: "Top Delight Driver",
    recText: "Feature travel crew behind-the-scenes vlogs to maximize 18.4% community engagement rate."
  },
  {
    text: "Visited H&M Mylapore branch for summer shopping. Great linen collection and clean store, but fitting room queues were moving very slow with only 2 cabins open.",
    sentiment: "neutral",
    badgeText: "NEUTRAL (+21)",
    polarity: "Compound Polarity: +0.210",
    summary: "Mixed retail sentiment: Apparel quality and collection are well received, but fitting room bottleneck suppresses customer delight.",
    theme: "Fitting Room Wait & Staff Assistance",
    themeBg: "#F1F5F9",
    themeColor: "#64748B",
    entities: '"summer linen collection", "Mylapore branch", "fitting room queues"',
    recTag: "friction_point",
    recTagLabel: "Store Operations Alert",
    recText: "Open second floor fitting room annex during weekend footfall surges to reduce wait time."
  }
];

export { PREDEFINED_USERS, REVIEWR_ACCOUNTS };

