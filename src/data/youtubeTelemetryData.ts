import thumbCameraSensor from '../assets/images/thumb_camera_sensor_review_1791259068837.jpg';
import thumbSiliconArch from '../assets/images/thumb_apple_m5_architecture_1791259088650.jpg';
import thumbOledMonitor from '../assets/images/thumb_oled_monitor_shootout_1791259106128.jpg';
import thumbAudioLab from '../assets/images/thumb_audio_acoustics_lab_1791259116576.jpg';

export type TimeframeKey = '30D' | '90D' | '12M';

export interface RadarScores {
  uploadCadence: number;
  viewVelocity: number;
  audienceRetention: number;
  engagementDepth: number;
  sentimentHealth: number;
  evergreenLongTail: number;
}

export interface TimeframeMetrics {
  subscribersDelta: number;
  subGrowthPct: number;
  viewsTotal: number;
  viewsGrowthPct: number;
  avgViewsPerVideo: number;
  first24hVelocity: number;
  engagementRate: number;
  likeRate: number;
  commentRate: number;
  uploadsPerMonth: number;
  avgRetentionPct: number;
  medianWatchMinutes: number;
  ctrEstimate: number;
  shortsSharePct: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentFriction: number;
  netSentimentScore: number;
  seriesDates: string[];
  viewVelocitySeries: number[]; // in thousands per day
  engagementSeries: number[]; // %
  sentimentSeries: number[]; // positive %
}

export interface ChannelProfile {
  id: string;
  name: string;
  handle: string;
  category: string;
  isPrimary?: boolean;
  colorHex: string;
  subscribers: number;
  overlapScore: number; // % audience overlap with primary channel
  sharedKeywords: string[];
  recentBreakoutTitle: string;
  recentBreakoutViews: number;
  recentBreakoutMultiplier: number;
  recentBreakoutPublished: string;
  radar: RadarScores;
  timeframes: Record<TimeframeKey, TimeframeMetrics>;
}

export interface TimestampMoment {
  timestamp: string;
  seconds: number;
  progressPct: number;
  retentionPct: number;
  sentimentType: 'positive' | 'neutral' | 'friction';
  sentimentDelta: number; // +28 or -22
  label: string;
  detail: string;
  commentCount: number;
}

export interface AspectSentiment {
  aspect: string;
  positivePct: number;
  neutralPct: number;
  frictionPct: number;
  mentionCount: number;
  keyTakeaway: string;
  ownerAction: string;
}

export interface VideoComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  sentiment: 'positive' | 'neutral' | 'friction';
  score: number;
  aspect: string;
  isQuestion: boolean;
  publishedAgo: string;
}

export interface VideoTelemetry {
  id: string;
  channelId: string;
  title: string;
  publishedDate: string;
  duration: string;
  durationSeconds: number;
  format: 'Long-Form 4K' | 'Deep-Dive Lab' | 'Hardware Shootout';
  thumbnailUrl: string;
  views: number;
  viewsFirst24h: number;
  avgViewDuration: string;
  avgRetentionPct: number;
  ctrPct: number;
  likes: number;
  commentCount: number;
  engagementRate: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentFriction: number;
  netSentimentScore: number;
  executiveSummary: string;
  retentionCurve: number[]; // 12 points 0% -> 100%
  moments: TimestampMoment[];
  aspects: AspectSentiment[];
  comments: VideoComment[];
}

export interface ContentGapOpportunity {
  id: string;
  topicTitle: string;
  competitorChannelId: string;
  competitorName: string;
  competitorHandle: string;
  competitorBreakoutVideo: string;
  competitorViews: number;
  multiplierVsBaseline: number;
  competitorWeakness: string;
  recommendedAngle: string;
  estimatedViewPotential: string;
  searchMomentumPct: number;
  savedToPipeline?: boolean;
}

export const INITIAL_CHANNELS: ChannelProfile[] = [
  {
    id: 'ch-vergecraft',
    name: 'VergeCraft Studio',
    handle: '@vergecraft',
    category: 'Cinema & Hardware Engineering',
    isPrimary: true,
    colorHex: '#FF2E43',
    subscribers: 1240000,
    overlapScore: 100,
    sharedKeywords: ['medium format', 'sensor telemetry', 'color grading', 'silicon architecture', 'studio acoustics'],
    recentBreakoutTitle: 'Why Medium Format Sensors Are Replacing Cinema Rigs in 2026',
    recentBreakoutViews: 684000,
    recentBreakoutMultiplier: 2.1,
    recentBreakoutPublished: '6 days ago',
    radar: {
      uploadCadence: 74,
      viewVelocity: 86,
      audienceRetention: 91,
      engagementDepth: 89,
      sentimentHealth: 88,
      evergreenLongTail: 85
    },
    timeframes: {
      '30D': {
        subscribersDelta: 42800,
        subGrowthPct: 3.6,
        viewsTotal: 3420000,
        viewsGrowthPct: 14.2,
        avgViewsPerVideo: 488500,
        first24hVelocity: 196000,
        engagementRate: 6.84,
        likeRate: 5.92,
        commentRate: 0.92,
        uploadsPerMonth: 5.2,
        avgRetentionPct: 64.8,
        medianWatchMinutes: 11.4,
        ctrEstimate: 7.8,
        shortsSharePct: 12,
        sentimentPositive: 82,
        sentimentNeutral: 11,
        sentimentFriction: 7,
        netSentimentScore: 75,
        seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
        viewVelocitySeries: [98, 112, 105, 134, 128, 152, 146, 168],
        engagementSeries: [6.2, 6.4, 6.3, 6.9, 6.7, 7.1, 6.9, 7.2],
        sentimentSeries: [79, 80, 78, 83, 81, 84, 82, 85]
      },
      '90D': {
        subscribersDelta: 118400,
        subGrowthPct: 10.5,
        viewsTotal: 9640000,
        viewsGrowthPct: 22.8,
        avgViewsPerVideo: 459000,
        first24hVelocity: 182000,
        engagementRate: 6.62,
        likeRate: 5.74,
        commentRate: 0.88,
        uploadsPerMonth: 4.9,
        avgRetentionPct: 63.2,
        medianWatchMinutes: 10.9,
        ctrEstimate: 7.5,
        shortsSharePct: 14,
        sentimentPositive: 80,
        sentimentNeutral: 12,
        sentimentFriction: 8,
        netSentimentScore: 72,
        seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
        viewVelocitySeries: [84, 92, 96, 108, 115, 129, 141, 168],
        engagementSeries: [5.9, 6.1, 6.3, 6.5, 6.4, 6.8, 6.9, 7.2],
        sentimentSeries: [76, 78, 77, 80, 79, 82, 83, 85]
      },
      '12M': {
        subscribersDelta: 394000,
        subGrowthPct: 46.5,
        viewsTotal: 34800000,
        viewsGrowthPct: 54.0,
        avgViewsPerVideo: 435000,
        first24hVelocity: 171000,
        engagementRate: 6.45,
        likeRate: 5.61,
        commentRate: 0.84,
        uploadsPerMonth: 4.7,
        avgRetentionPct: 61.9,
        medianWatchMinutes: 10.6,
        ctrEstimate: 7.3,
        shortsSharePct: 15,
        sentimentPositive: 79,
        sentimentNeutral: 13,
        sentimentFriction: 8,
        netSentimentScore: 71,
        seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
        viewVelocitySeries: [68, 79, 74, 88, 99, 114, 132, 168],
        engagementSeries: [5.6, 5.8, 5.9, 6.1, 6.3, 6.5, 6.8, 7.2],
        sentimentSeries: [74, 75, 76, 78, 79, 80, 82, 85]
      }
    }
  },
  {
    id: 'ch-framelab',
    name: 'FrameLab Tech',
    handle: '@framelab',
    category: 'Camera Systems & Optics',
    colorHex: '#3B82F6',
    subscribers: 1480000,
    overlapScore: 88,
    sharedKeywords: ['medium format', 'cinema lenses', 'dynamic range', 'autofocus test', 'color grading'],
    recentBreakoutTitle: 'Global Shutter vs Rolling Shutter: High-Speed Lab Latencies',
    recentBreakoutViews: 812000,
    recentBreakoutMultiplier: 2.4,
    recentBreakoutPublished: '4 days ago',
    radar: {
      uploadCadence: 86,
      viewVelocity: 92,
      audienceRetention: 82,
      engagementDepth: 78,
      sentimentHealth: 76,
      evergreenLongTail: 81
    },
    timeframes: {
      '30D': {
        subscribersDelta: 51200,
        subGrowthPct: 3.5,
        viewsTotal: 4180000,
        viewsGrowthPct: 18.4,
        avgViewsPerVideo: 522500,
        first24hVelocity: 228000,
        engagementRate: 5.72,
        likeRate: 4.98,
        commentRate: 0.74,
        uploadsPerMonth: 6.8,
        avgRetentionPct: 58.4,
        medianWatchMinutes: 9.2,
        ctrEstimate: 8.4,
        shortsSharePct: 22,
        sentimentPositive: 74,
        sentimentNeutral: 14,
        sentimentFriction: 12,
        netSentimentScore: 62,
        seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
        viewVelocitySeries: [118, 126, 131, 142, 156, 149, 174, 182],
        engagementSeries: [5.4, 5.6, 5.5, 5.8, 5.7, 5.9, 5.8, 5.9],
        sentimentSeries: [72, 74, 71, 75, 73, 76, 74, 75]
      },
      '90D': {
        subscribersDelta: 142000,
        subGrowthPct: 10.6,
        viewsTotal: 11900000,
        viewsGrowthPct: 24.1,
        avgViewsPerVideo: 495000,
        first24hVelocity: 214000,
        engagementRate: 5.58,
        likeRate: 4.86,
        commentRate: 0.72,
        uploadsPerMonth: 6.5,
        avgRetentionPct: 57.6,
        medianWatchMinutes: 9.0,
        ctrEstimate: 8.2,
        shortsSharePct: 24,
        sentimentPositive: 73,
        sentimentNeutral: 15,
        sentimentFriction: 12,
        netSentimentScore: 61,
        seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
        viewVelocitySeries: [102, 110, 118, 125, 134, 148, 165, 182],
        engagementSeries: [5.3, 5.4, 5.5, 5.6, 5.5, 5.7, 5.8, 5.9],
        sentimentSeries: [71, 72, 73, 72, 74, 75, 74, 75]
      },
      '12M': {
        subscribersDelta: 460000,
        subGrowthPct: 45.1,
        viewsTotal: 42600000,
        viewsGrowthPct: 49.2,
        avgViewsPerVideo: 478000,
        first24hVelocity: 201000,
        engagementRate: 5.49,
        likeRate: 4.78,
        commentRate: 0.71,
        uploadsPerMonth: 6.4,
        avgRetentionPct: 56.9,
        medianWatchMinutes: 8.8,
        ctrEstimate: 8.0,
        shortsSharePct: 25,
        sentimentPositive: 72,
        sentimentNeutral: 15,
        sentimentFriction: 13,
        netSentimentScore: 59,
        seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
        viewVelocitySeries: [88, 96, 104, 112, 126, 141, 160, 182],
        engagementSeries: [5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9],
        sentimentSeries: [70, 71, 72, 71, 73, 74, 74, 75]
      }
    }
  },
  {
    id: 'ch-circuittheory',
    name: 'CircuitTheory',
    handle: '@circuittheory',
    category: 'Silicon & Compute Architecture',
    colorHex: '#8B5CF6',
    subscribers: 980000,
    overlapScore: 82,
    sharedKeywords: ['silicon architecture', '2nm lithography', 'thermal benchmarks', 'workstation build', 'gpu compute'],
    recentBreakoutTitle: 'Why Unified Memory Bandwidth Hits a Wall at 800GB/s',
    recentBreakoutViews: 615000,
    recentBreakoutMultiplier: 2.3,
    recentBreakoutPublished: '9 days ago',
    radar: {
      uploadCadence: 62,
      viewVelocity: 79,
      audienceRetention: 94,
      engagementDepth: 92,
      sentimentHealth: 91,
      evergreenLongTail: 93
    },
    timeframes: {
      '30D': {
        subscribersDelta: 38900,
        subGrowthPct: 4.1,
        viewsTotal: 2790000,
        viewsGrowthPct: 16.8,
        avgViewsPerVideo: 558000,
        first24hVelocity: 184000,
        engagementRate: 7.42,
        likeRate: 6.31,
        commentRate: 1.11,
        uploadsPerMonth: 3.8,
        avgRetentionPct: 68.4,
        medianWatchMinutes: 14.2,
        ctrEstimate: 7.2,
        shortsSharePct: 5,
        sentimentPositive: 86,
        sentimentNeutral: 9,
        sentimentFriction: 5,
        netSentimentScore: 81,
        seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
        viewVelocitySeries: [82, 89, 94, 112, 108, 124, 131, 139],
        engagementSeries: [7.0, 7.1, 7.2, 7.5, 7.3, 7.6, 7.5, 7.7],
        sentimentSeries: [84, 85, 84, 87, 86, 88, 87, 88]
      },
      '90D': {
        subscribersDelta: 104000,
        subGrowthPct: 11.8,
        viewsTotal: 7850000,
        viewsGrowthPct: 26.4,
        avgViewsPerVideo: 523000,
        first24hVelocity: 172000,
        engagementRate: 7.28,
        likeRate: 6.20,
        commentRate: 1.08,
        uploadsPerMonth: 3.6,
        avgRetentionPct: 67.5,
        medianWatchMinutes: 13.8,
        ctrEstimate: 7.0,
        shortsSharePct: 6,
        sentimentPositive: 85,
        sentimentNeutral: 10,
        sentimentFriction: 5,
        netSentimentScore: 80,
        seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
        viewVelocitySeries: [70, 76, 84, 91, 98, 112, 125, 139],
        engagementSeries: [6.8, 6.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.7],
        sentimentSeries: [82, 83, 84, 85, 85, 86, 87, 88]
      },
      '12M': {
        subscribersDelta: 340000,
        subGrowthPct: 53.1,
        viewsTotal: 28400000,
        viewsGrowthPct: 61.5,
        avgViewsPerVideo: 498000,
        first24hVelocity: 160000,
        engagementRate: 7.12,
        likeRate: 6.08,
        commentRate: 1.04,
        uploadsPerMonth: 3.5,
        avgRetentionPct: 66.8,
        medianWatchMinutes: 13.5,
        ctrEstimate: 6.9,
        shortsSharePct: 6,
        sentimentPositive: 84,
        sentimentNeutral: 10,
        sentimentFriction: 6,
        netSentimentScore: 78,
        seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
        viewVelocitySeries: [54, 62, 69, 78, 92, 106, 122, 139],
        engagementSeries: [6.5, 6.7, 6.8, 7.0, 7.1, 7.3, 7.5, 7.7],
        sentimentSeries: [80, 81, 82, 83, 84, 85, 87, 88]
      }
    }
  },
  {
    id: 'ch-opticpulse',
    name: 'OpticPulse Display Lab',
    handle: '@opticpulse',
    category: 'Display Calibration & OLED Telemetry',
    colorHex: '#06B6D4',
    subscribers: 1120000,
    overlapScore: 79,
    sharedKeywords: ['oled burn-in', 'reference monitor', 'hdr luminance', 'colorimeter', 'microled'],
    recentBreakoutTitle: '240Hz QD-OLED After 3,000 Hours: Spectroradiometer Drift',
    recentBreakoutViews: 540000,
    recentBreakoutMultiplier: 1.9,
    recentBreakoutPublished: '11 days ago',
    radar: {
      uploadCadence: 70,
      viewVelocity: 76,
      audienceRetention: 85,
      engagementDepth: 81,
      sentimentHealth: 83,
      evergreenLongTail: 88
    },
    timeframes: {
      '30D': {
        subscribersDelta: 31400,
        subGrowthPct: 2.9,
        viewsTotal: 2940000,
        viewsGrowthPct: 11.4,
        avgViewsPerVideo: 420000,
        first24hVelocity: 158000,
        engagementRate: 6.18,
        likeRate: 5.34,
        commentRate: 0.84,
        uploadsPerMonth: 5.0,
        avgRetentionPct: 61.2,
        medianWatchMinutes: 10.4,
        ctrEstimate: 7.4,
        shortsSharePct: 16,
        sentimentPositive: 79,
        sentimentNeutral: 13,
        sentimentFriction: 8,
        netSentimentScore: 71,
        seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
        viewVelocitySeries: [88, 94, 91, 102, 109, 115, 118, 126],
        engagementSeries: [5.9, 6.0, 6.1, 6.2, 6.1, 6.3, 6.2, 6.4],
        sentimentSeries: [77, 78, 78, 79, 80, 79, 81, 80]
      },
      '90D': {
        subscribersDelta: 89000,
        subGrowthPct: 8.6,
        viewsTotal: 8420000,
        viewsGrowthPct: 17.2,
        avgViewsPerVideo: 401000,
        first24hVelocity: 149000,
        engagementRate: 6.05,
        likeRate: 5.23,
        commentRate: 0.82,
        uploadsPerMonth: 4.8,
        avgRetentionPct: 60.4,
        medianWatchMinutes: 10.1,
        ctrEstimate: 7.2,
        shortsSharePct: 18,
        sentimentPositive: 78,
        sentimentNeutral: 14,
        sentimentFriction: 8,
        netSentimentScore: 70,
        seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
        viewVelocitySeries: [76, 82, 86, 92, 98, 105, 114, 126],
        engagementSeries: [5.8, 5.9, 5.9, 6.0, 6.1, 6.2, 6.2, 6.4],
        sentimentSeries: [76, 77, 77, 78, 79, 79, 80, 80]
      },
      '12M': {
        subscribersDelta: 298000,
        subGrowthPct: 36.2,
        viewsTotal: 31200000,
        viewsGrowthPct: 41.8,
        avgViewsPerVideo: 390000,
        first24hVelocity: 142000,
        engagementRate: 5.96,
        likeRate: 5.15,
        commentRate: 0.81,
        uploadsPerMonth: 4.7,
        avgRetentionPct: 59.8,
        medianWatchMinutes: 9.8,
        ctrEstimate: 7.1,
        shortsSharePct: 18,
        sentimentPositive: 77,
        sentimentNeutral: 14,
        sentimentFriction: 9,
        netSentimentScore: 68,
        seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
        viewVelocitySeries: [64, 70, 75, 82, 91, 102, 114, 126],
        engagementSeries: [5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.4],
        sentimentSeries: [75, 76, 76, 77, 78, 78, 79, 80]
      }
    }
  },
  {
    id: 'ch-kinetix',
    name: 'Kinetix Acoustics',
    handle: '@kinetixhw',
    category: 'Studio Audio & Acoustic Engineering',
    colorHex: '#10B981',
    subscribers: 745000,
    overlapScore: 71,
    sharedKeywords: ['studio acoustics', 'rt60 decay', 'preamp noise floor', 'condenser mic', 'soundproofing'],
    recentBreakoutTitle: 'Why Cheap Foam Panels Ruin Vocal Clarity (REW Waterfall Plots)',
    recentBreakoutViews: 492000,
    recentBreakoutMultiplier: 2.6,
    recentBreakoutPublished: '8 days ago',
    radar: {
      uploadCadence: 66,
      viewVelocity: 74,
      audienceRetention: 88,
      engagementDepth: 87,
      sentimentHealth: 89,
      evergreenLongTail: 91
    },
    timeframes: {
      '30D': {
        subscribersDelta: 29800,
        subGrowthPct: 4.2,
        viewsTotal: 2180000,
        viewsGrowthPct: 19.5,
        avgViewsPerVideo: 363000,
        first24hVelocity: 132000,
        engagementRate: 7.05,
        likeRate: 6.09,
        commentRate: 0.96,
        uploadsPerMonth: 4.5,
        avgRetentionPct: 65.6,
        medianWatchMinutes: 11.8,
        ctrEstimate: 7.6,
        shortsSharePct: 10,
        sentimentPositive: 84,
        sentimentNeutral: 10,
        sentimentFriction: 6,
        netSentimentScore: 78,
        seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
        viewVelocitySeries: [62, 68, 74, 79, 86, 94, 98, 106],
        engagementSeries: [6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.1, 7.3],
        sentimentSeries: [82, 83, 83, 84, 85, 84, 86, 86]
      },
      '90D': {
        subscribersDelta: 81000,
        subGrowthPct: 12.2,
        viewsTotal: 6120000,
        viewsGrowthPct: 27.9,
        avgViewsPerVideo: 340000,
        first24hVelocity: 124000,
        engagementRate: 6.92,
        likeRate: 5.98,
        commentRate: 0.94,
        uploadsPerMonth: 4.3,
        avgRetentionPct: 64.9,
        medianWatchMinutes: 11.5,
        ctrEstimate: 7.4,
        shortsSharePct: 11,
        sentimentPositive: 83,
        sentimentNeutral: 11,
        sentimentFriction: 6,
        netSentimentScore: 77,
        seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
        viewVelocitySeries: [52, 58, 64, 71, 78, 86, 95, 106],
        engagementSeries: [6.5, 6.6, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3],
        sentimentSeries: [80, 81, 82, 83, 83, 84, 85, 86]
      },
      '12M': {
        subscribersDelta: 265000,
        subGrowthPct: 55.2,
        viewsTotal: 21900000,
        viewsGrowthPct: 64.0,
        avgViewsPerVideo: 322000,
        first24hVelocity: 115000,
        engagementRate: 6.80,
        likeRate: 5.88,
        commentRate: 0.92,
        uploadsPerMonth: 4.2,
        avgRetentionPct: 64.1,
        medianWatchMinutes: 11.2,
        ctrEstimate: 7.2,
        shortsSharePct: 12,
        sentimentPositive: 82,
        sentimentNeutral: 11,
        sentimentFriction: 7,
        netSentimentScore: 75,
        seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
        viewVelocitySeries: [42, 48, 55, 63, 72, 84, 94, 106],
        engagementSeries: [6.2, 6.4, 6.5, 6.7, 6.8, 7.0, 7.1, 7.3],
        sentimentSeries: [79, 80, 81, 82, 83, 84, 85, 86]
      }
    }
  },
  {
    id: 'ch-pixelfoundry',
    name: 'PixelFoundry',
    handle: '@pixelfoundry',
    category: 'Post-Production & DaVinci Workflows',
    colorHex: '#F59E0B',
    subscribers: 1890000,
    overlapScore: 66,
    sharedKeywords: ['color grading', 'davinci resolve', 'nas storage', 'proxy workflow', 'render farm'],
    recentBreakoutTitle: '100Gbps NVMe NAS Build: Editing 12K RAW Over Ethernet',
    recentBreakoutViews: 940000,
    recentBreakoutMultiplier: 1.8,
    recentBreakoutPublished: '14 days ago',
    radar: {
      uploadCadence: 92,
      viewVelocity: 94,
      audienceRetention: 75,
      engagementDepth: 72,
      sentimentHealth: 71,
      evergreenLongTail: 78
    },
    timeframes: {
      '30D': {
        subscribersDelta: 56400,
        subGrowthPct: 3.1,
        viewsTotal: 5120000,
        viewsGrowthPct: 12.6,
        avgViewsPerVideo: 568000,
        first24hVelocity: 264000,
        engagementRate: 5.14,
        likeRate: 4.48,
        commentRate: 0.66,
        uploadsPerMonth: 8.2,
        avgRetentionPct: 53.8,
        medianWatchMinutes: 8.1,
        ctrEstimate: 8.9,
        shortsSharePct: 34,
        sentimentPositive: 70,
        sentimentNeutral: 16,
        sentimentFriction: 14,
        netSentimentScore: 56,
        seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
        viewVelocitySeries: [148, 156, 162, 171, 168, 184, 192, 204],
        engagementSeries: [4.9, 5.0, 5.1, 5.2, 5.0, 5.3, 5.2, 5.3],
        sentimentSeries: [68, 70, 69, 71, 70, 72, 71, 71]
      },
      '90D': {
        subscribersDelta: 158000,
        subGrowthPct: 9.1,
        viewsTotal: 14800000,
        viewsGrowthPct: 18.9,
        avgViewsPerVideo: 548000,
        first24hVelocity: 251000,
        engagementRate: 5.06,
        likeRate: 4.41,
        commentRate: 0.65,
        uploadsPerMonth: 8.0,
        avgRetentionPct: 53.1,
        medianWatchMinutes: 7.9,
        ctrEstimate: 8.7,
        shortsSharePct: 35,
        sentimentPositive: 69,
        sentimentNeutral: 17,
        sentimentFriction: 14,
        netSentimentScore: 55,
        seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
        viewVelocitySeries: [134, 142, 151, 160, 168, 178, 190, 204],
        engagementSeries: [4.8, 4.9, 5.0, 5.0, 5.1, 5.2, 5.2, 5.3],
        sentimentSeries: [67, 68, 69, 69, 70, 71, 71, 71]
      },
      '12M': {
        subscribersDelta: 510000,
        subGrowthPct: 36.9,
        viewsTotal: 54200000,
        viewsGrowthPct: 44.2,
        avgViewsPerVideo: 526000,
        first24hVelocity: 239000,
        engagementRate: 4.98,
        likeRate: 4.34,
        commentRate: 0.64,
        uploadsPerMonth: 7.8,
        avgRetentionPct: 52.4,
        medianWatchMinutes: 7.7,
        ctrEstimate: 8.5,
        shortsSharePct: 36,
        sentimentPositive: 68,
        sentimentNeutral: 17,
        sentimentFriction: 15,
        netSentimentScore: 53,
        seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
        viewVelocitySeries: [112, 124, 136, 148, 162, 176, 190, 204],
        engagementSeries: [4.7, 4.8, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3],
        sentimentSeries: [66, 67, 68, 68, 69, 70, 71, 71]
      }
    }
  }
];

export const INITIAL_VIDEOS: VideoTelemetry[] = [
  {
    id: 'vid-medium-format-2026',
    channelId: 'ch-vergecraft',
    title: 'Why Medium Format Sensors Are Replacing Cinema Rigs in 2026',
    publishedDate: 'Sep 29, 2026',
    duration: '18:42',
    durationSeconds: 1122,
    format: 'Long-Form 4K',
    thumbnailUrl: thumbCameraSensor,
    views: 684200,
    viewsFirst24h: 248000,
    avgViewDuration: '12:34',
    avgRetentionPct: 67.2,
    ctrPct: 8.6,
    likes: 44120,
    commentCount: 3840,
    engagementRate: 7.01,
    sentimentPositive: 84,
    sentimentNeutral: 10,
    sentimentFriction: 6,
    netSentimentScore: 78,
    executiveSummary:
      'Strongest 7-day velocity this quarter (+40% vs channel median). Audience sentiment peaks at 08:15 during the 16-stop latitude chart comparison. Minor constructive friction clusters around 04:10 where studio B-cam voiceover drops by 4dB, and at 14:50 where viewers requested raw DNG sample download links.',
    retentionCurve: [100, 88, 82, 76, 79, 74, 71, 68, 64, 59, 54, 48],
    moments: [
      {
        timestamp: '01:20',
        seconds: 80,
        progressPct: 7,
        retentionPct: 88,
        sentimentType: 'positive',
        sentimentDelta: 24,
        label: 'Cold Open Optical Bench Hook',
        detail: 'Viewers praised skipping the standard talking-head intro and opening directly with live sensor readout waveforms.',
        commentCount: 412
      },
      {
        timestamp: '04:10',
        seconds: 250,
        progressPct: 22,
        retentionPct: 76,
        sentimentType: 'friction',
        sentimentDelta: -19,
        label: 'Voiceover Gain Dip on Overhead Rig',
        detail: 'Multiple comments flagged that the lavalier switch at 04:10 drops -4.5 LUFS against the background ambient track.',
        commentCount: 186
      },
      {
        timestamp: '08:15',
        seconds: 495,
        progressPct: 44,
        retentionPct: 79,
        sentimentType: 'positive',
        sentimentDelta: 38,
        label: '16-Stop Highlight Roll-Off Split Screen',
        detail: 'Highest replay spike (+5.4% retention bump) and overwhelming positive sentiment for blind A/B grading test.',
        commentCount: 940
      },
      {
        timestamp: '12:05',
        seconds: 725,
        progressPct: 65,
        retentionPct: 68,
        sentimentType: 'neutral',
        sentimentDelta: 8,
        label: 'IBIS vs Gimbal Walking Telemetry',
        detail: 'High density of technical viewer questions asking which PL-to-GF speedbooster adapter was mounted.',
        commentCount: 310
      },
      {
        timestamp: '14:50',
        seconds: 890,
        progressPct: 79,
        retentionPct: 59,
        sentimentType: 'friction',
        sentimentDelta: -14,
        label: 'Missing Uncompressed RAW Sample Link',
        detail: 'Colorists in comments noted the description link initially pointed to 10-bit ProRes proxies instead of 16-bit RAW frames.',
        commentCount: 142
      }
    ],
    aspects: [
      {
        aspect: 'Technical Depth',
        positivePct: 92,
        neutralPct: 6,
        frictionPct: 2,
        mentionCount: 1480,
        keyTakeaway: 'Blind A/B Xyla-21 chart methodology cited as the gold standard over competitor spec-sheet readings.',
        ownerAction: 'Retain blind A/B split-screen chapter format as permanent benchmark segment.'
      },
      {
        aspect: 'Production & Audio',
        positivePct: 76,
        neutralPct: 11,
        frictionPct: 13,
        mentionCount: 820,
        keyTakeaway: '4K HDR color pipeline praised, but overhead bench mic transition at 04:10 caused noticeable drop.',
        ownerAction: 'Apply loudness normalization (-14 LUFS target) across B-cam audio stems before export.'
      },
      {
        aspect: 'Pacing & Script',
        positivePct: 88,
        neutralPct: 8,
        frictionPct: 4,
        mentionCount: 640,
        keyTakeaway: 'Tight 18-minute runtime held 67.2% average retention with zero sponsor-segment skip cliff.',
        ownerAction: 'Keep mid-roll integration under 45 seconds tied directly to the lab test workflow.'
      },
      {
        aspect: 'Pricing & Value',
        positivePct: 71,
        neutralPct: 19,
        frictionPct: 10,
        mentionCount: 590,
        keyTakeaway: 'Viewers appreciated used market lens comparisons but asked for sub-$4,000 body alternatives.',
        ownerAction: 'Produce follow-up comparison featuring used GFX100S II vs modern full-frame cinema boxes.'
      }
    ],
    comments: [
      {
        id: 'cmt-101',
        author: '@diego_colorist',
        text: '08:15 That blind highlight roll-off test between the 44x33mm sensor and Super35 is the most honest camera benchmark on YouTube this year. Subscribed immediately.',
        timestamp: '08:15',
        likes: 842,
        sentiment: 'positive',
        score: 96,
        aspect: 'Technical Depth',
        isQuestion: false,
        publishedAgo: '5 days ago'
      },
      {
        id: 'cmt-102',
        author: '@studiomastering_uk',
        text: '04:10 Heads up for the editing team: when you switch to the top-down workbench camera the voiceover drops by about 5dB and has a slight phase hollow.',
        timestamp: '04:10',
        likes: 219,
        sentiment: 'friction',
        score: 28,
        aspect: 'Production & Audio',
        isQuestion: false,
        publishedAgo: '5 days ago'
      },
      {
        id: 'cmt-103',
        author: '@arachne_dop',
        text: '12:05 Which focal reducer did you use to mount the vintage Contax Zeiss primes onto the medium format mount without hard vignetting?',
        timestamp: '12:05',
        likes: 164,
        sentiment: 'neutral',
        score: 65,
        aspect: 'Technical Depth',
        isQuestion: true,
        publishedAgo: '4 days ago'
      },
      {
        id: 'cmt-104',
        author: '@kyle_optics',
        text: '14:50 You mentioned downloadable 16-bit RAW frames in the description, but the folder only has 422 HQ mov files right now. Any chance you can upload the DNGs?',
        timestamp: '14:50',
        likes: 138,
        sentiment: 'friction',
        score: 34,
        aspect: 'Technical Depth',
        isQuestion: true,
        publishedAgo: '4 days ago'
      },
      {
        id: 'cmt-105',
        author: '@vfx_foundry',
        text: '01:20 Love how there is zero fluff in the intro. Straight into oscilloscope sensor readout speeds within 80 seconds.',
        timestamp: '01:20',
        likes: 512,
        sentiment: 'positive',
        score: 93,
        aspect: 'Pacing & Script',
        isQuestion: false,
        publishedAgo: '6 days ago'
      },
      {
        id: 'cmt-106',
        author: '@indie_gaffer',
        text: '09:40 The total rig cost breakdown including V-mount rails and CFexpress Type B cards saved our production house from a very expensive rental mistake.',
        timestamp: '09:40',
        likes: 308,
        sentiment: 'positive',
        score: 91,
        aspect: 'Pricing & Value',
        isQuestion: false,
        publishedAgo: '3 days ago'
      }
    ]
  },
  {
    id: 'vid-silicon-2nm',
    channelId: 'ch-vergecraft',
    title: 'Inside the 2nm Silicon Bottleneck: Thermal Benchmarks Tested',
    publishedDate: 'Sep 18, 2026',
    duration: '22:15',
    durationSeconds: 1335,
    format: 'Deep-Dive Lab',
    thumbnailUrl: thumbSiliconArch,
    views: 539400,
    viewsFirst24h: 192000,
    avgViewDuration: '14:48',
    avgRetentionPct: 66.5,
    ctrPct: 7.9,
    likes: 38900,
    commentCount: 3120,
    engagementRate: 7.79,
    sentimentPositive: 87,
    sentimentNeutral: 8,
    sentimentFriction: 5,
    netSentimentScore: 82,
    executiveSummary:
      'Highest comment-to-view ratio (0.58%) across the last 90 days. Engineers and hardware builders praised the custom infrared thermal imaging rig. Tiny pocket of friction at 16:40 where Linux kernel compile flags were omitted from the chart footnote.',
    retentionCurve: [100, 90, 84, 80, 77, 75, 72, 69, 63, 58, 55, 51],
    moments: [
      {
        timestamp: '02:45',
        seconds: 165,
        progressPct: 12,
        retentionPct: 84,
        sentimentType: 'positive',
        sentimentDelta: 31,
        label: 'Gate-All-Around Transistor 3D Cross-Section',
        detail: 'Viewers lauded the clarity of the custom hardware visualization explaining backside power delivery.',
        commentCount: 520
      },
      {
        timestamp: '10:30',
        seconds: 630,
        progressPct: 47,
        retentionPct: 75,
        sentimentType: 'positive',
        sentimentDelta: 42,
        label: 'FLIR Thermal Die Density Stress Test',
        detail: 'Peak positive sentiment across the video as sustained 180W Blender render thermals were plotted live.',
        commentCount: 790
      },
      {
        timestamp: '16:40',
        seconds: 1000,
        progressPct: 75,
        retentionPct: 63,
        sentimentType: 'friction',
        sentimentDelta: -11,
        label: 'Missing GCC Compiler Flag Annotation',
        detail: 'Systems programmers asked whether AVX-512 was enabled on the baseline x86 comparison node.',
        commentCount: 118
      }
    ],
    aspects: [
      {
        aspect: 'Technical Depth',
        positivePct: 94,
        neutralPct: 4,
        frictionPct: 2,
        mentionCount: 1620,
        keyTakeaway: 'Die-level power efficiency curves per watt resonated deeply with technical subscribers.',
        ownerAction: 'Publish companion GitHub CSV of raw watt-per-frame telemetry in video descriptions.'
      },
      {
        aspect: 'Pacing & Script',
        positivePct: 85,
        neutralPct: 10,
        frictionPct: 5,
        mentionCount: 540,
        keyTakeaway: '22-minute runtime held 66.5% retention because every chapter opened with a clear hypothesis.',
        ownerAction: 'Replicate hypothesis-first chapter structure on upcoming GPU memory bus deep dive.'
      },
      {
        aspect: 'Production & Audio',
        positivePct: 89,
        neutralPct: 8,
        frictionPct: 3,
        mentionCount: 490,
        keyTakeaway: 'Macro probe lens shots of the delidded heat spreader generated high visual praise.',
        ownerAction: 'Continue using 24mm probe macro B-roll during architecture explainers.'
      }
    ],
    comments: [
      {
        id: 'cmt-201',
        author: '@asic_architect',
        text: '10:30 Plotting thermal resistance per square millimeter alongside sustained clock frequency is something even major hardware outlets skip. Brilliant engineering work.',
        timestamp: '10:30',
        likes: 964,
        sentiment: 'positive',
        score: 98,
        aspect: 'Technical Depth',
        isQuestion: false,
        publishedAgo: '2 weeks ago'
      },
      {
        id: 'cmt-202',
        author: '@kernel_dev_rs',
        text: '16:40 On the LLVM compilation slide, did you pin threads to performance cores only or let the scheduler use efficiency cores too? Worth noting in the chart subtitle.',
        timestamp: '16:40',
        likes: 187,
        sentiment: 'friction',
        score: 38,
        aspect: 'Technical Depth',
        isQuestion: true,
        publishedAgo: '2 weeks ago'
      },
      {
        id: 'cmt-203',
        author: '@maya_pipeline',
        text: '02:45 I have tried explaining backside power delivery to my junior hardware team for months—your 90-second diagram made it click immediately.',
        timestamp: '02:45',
        likes: 430,
        sentiment: 'positive',
        score: 94,
        aspect: 'Pacing & Script',
        isQuestion: false,
        publishedAgo: '2 weeks ago'
      }
    ]
  },
  {
    id: 'vid-oled-shootout',
    channelId: 'ch-vergecraft',
    title: 'Dual-Layer OLED vs MicroLED: 1,000-Hour Burn-In Telemetry',
    publishedDate: 'Sep 06, 2026',
    duration: '16:08',
    durationSeconds: 968,
    format: 'Hardware Shootout',
    thumbnailUrl: thumbOledMonitor,
    views: 462800,
    viewsFirst24h: 174000,
    avgViewDuration: '09:58',
    avgRetentionPct: 61.8,
    ctrPct: 7.4,
    likes: 29400,
    commentCount: 2690,
    engagementRate: 6.93,
    sentimentPositive: 76,
    sentimentNeutral: 13,
    sentimentFriction: 11,
    netSentimentScore: 65,
    executiveSummary:
      'Strong long-tail search traffic from monitor buyers. While spectroradiometer delta-E measurements scored 91% positive sentiment, friction rose to 11% around 11:20 due to matte vs glossy coating debate and requests for 32-inch 4K consumer panel coverage.',
    retentionCurve: [100, 86, 79, 74, 70, 67, 62, 58, 54, 49, 45, 41],
    moments: [
      {
        timestamp: '03:15',
        seconds: 195,
        progressPct: 20,
        retentionPct: 79,
        sentimentType: 'positive',
        sentimentDelta: 29,
        label: 'Automated Static UI Torture Loop Setup',
        detail: 'Viewers appreciated the transparency of the 1,000-hour DaVinci Resolve static timeline test rig.',
        commentCount: 380
      },
      {
        timestamp: '11:20',
        seconds: 680,
        progressPct: 70,
        retentionPct: 58,
        sentimentType: 'friction',
        sentimentDelta: -24,
        label: 'Semi-Matte Polarizer Grain Critique',
        detail: 'Heated debate in comments claiming the review was too harsh on micro-etch matte coatings in bright rooms.',
        commentCount: 410
      }
    ],
    aspects: [
      {
        aspect: 'Technical Depth',
        positivePct: 89,
        neutralPct: 7,
        frictionPct: 4,
        mentionCount: 1120,
        keyTakeaway: 'Spectroradiometer luminance decay graphs gave buyers concrete proof of tandem OLED longevity.',
        ownerAction: 'Add 2,000-hour milestone update to community tab and Q4 display roundup.'
      },
      {
        aspect: 'Pricing & Value',
        positivePct: 64,
        neutralPct: 18,
        frictionPct: 18,
        mentionCount: 780,
        keyTakeaway: 'Viewers felt the $4,200 reference monitor focus left out $900–$1,200 prosumer OLED displays.',
        ownerAction: 'Include a prosumer value tier in the next display shootout to capture broader search volume.'
      }
    ],
    comments: [
      {
        id: 'cmt-301',
        author: '@calman_pro',
        text: '03:15 Running an actual DaVinci Resolve GUI with static scopes at 250 nits for 1,000 hours is way more realistic than synthetic checkerboard tests.',
        timestamp: '03:15',
        likes: 615,
        sentiment: 'positive',
        score: 95,
        aspect: 'Technical Depth',
        isQuestion: false,
        publishedAgo: '3 weeks ago'
      },
      {
        id: 'cmt-302',
        author: '@brightroom_editor',
        text: '11:20 I think you dismissed the semi-matte coating too quickly. In an office with windows, glossy QD-OLED raises black levels way worse than subtle matte grain.',
        timestamp: '11:20',
        likes: 284,
        sentiment: 'friction',
        score: 31,
        aspect: 'Technical Depth',
        isQuestion: false,
        publishedAgo: '3 weeks ago'
      },
      {
        id: 'cmt-303',
        author: '@sam_motiondesign',
        text: 'Can you test whether uniform brightness limiter settings affect factory 3D LUT calibration accuracy on the 32-inch model?',
        timestamp: '07:45',
        likes: 92,
        sentiment: 'neutral',
        score: 64,
        aspect: 'Technical Depth',
        isQuestion: true,
        publishedAgo: '3 weeks ago'
      }
    ]
  },
  {
    id: 'vid-audio-acoustics',
    channelId: 'ch-vergecraft',
    title: 'Acoustic Treatment Myths: Measuring RT60 in Small Creator Studios',
    publishedDate: 'Aug 24, 2026',
    duration: '15:24',
    durationSeconds: 924,
    format: 'Deep-Dive Lab',
    thumbnailUrl: thumbAudioLab,
    views: 412900,
    viewsFirst24h: 146000,
    avgViewDuration: '10:19',
    avgRetentionPct: 67.0,
    ctrPct: 7.2,
    likes: 31200,
    commentCount: 2410,
    engagementRate: 8.14,
    sentimentPositive: 89,
    sentimentNeutral: 7,
    sentimentFriction: 4,
    netSentimentScore: 85,
    executiveSummary:
      'Highest net sentiment score (85) in the catalog. Binaural before-and-after audio sweeps at 06:50 drove massive positive engagement and shares among solo creators.',
    retentionCurve: [100, 89, 83, 78, 76, 79, 73, 68, 64, 60, 56, 52],
    moments: [
      {
        timestamp: '06:50',
        seconds: 410,
        progressPct: 44,
        retentionPct: 79,
        sentimentType: 'positive',
        sentimentDelta: 45,
        label: 'Binaural Untreated vs Broadband Absorber Sweep',
        detail: 'Headphone listeners replayed the 06:50 A/B vocal sweep heavily, driving a +3% retention climb.',
        commentCount: 890
      }
    ],
    aspects: [
      {
        aspect: 'Production & Audio',
        positivePct: 95,
        neutralPct: 4,
        frictionPct: 1,
        mentionCount: 1340,
        keyTakeaway: 'Binaural dummy-head recording allowed viewers to hear 250Hz room mode cancellation directly.',
        ownerAction: 'Use binaural head recordings for all future microphone and room treatment reviews.'
      }
    ],
    comments: [
      {
        id: 'cmt-401',
        author: '@podcast_engineer',
        text: '06:50 Hearing the 180Hz boxiness vanish the second you added the 4-inch air gap behind the rockwool panels was jaw-dropping on studio headphones.',
        timestamp: '06:50',
        likes: 740,
        sentiment: 'positive',
        score: 97,
        aspect: 'Production & Audio',
        isQuestion: false,
        publishedAgo: '1 month ago'
      }
    ]
  }
];

export const INITIAL_CONTENT_GAPS: ContentGapOpportunity[] = [
  {
    id: 'gap-global-shutter',
    topicTitle: 'Global Shutter vs Stacked CMOS: Flash Sync & LED Wall Flicker Lab Test',
    competitorChannelId: 'ch-framelab',
    competitorName: 'FrameLab Tech',
    competitorHandle: '@framelab',
    competitorBreakoutVideo: 'Global Shutter vs Rolling Shutter: High-Speed Lab Latencies',
    competitorViews: 812000,
    multiplierVsBaseline: 2.4,
    competitorWeakness:
      '14% viewer friction in FrameLab comments: viewers complained they only tested outdoor sports pans and ignored virtual production LED volume flicker & base ISO noise penalties.',
    recommendedAngle:
      'Film a head-to-head LED wall PWM flicker & 16-bit shadow noise floor lab test comparing Global Shutter against your Medium Format rig.',
    estimatedViewPotential: '620K – 890K views',
    searchMomentumPct: 142,
    savedToPipeline: false
  },
  {
    id: 'gap-unified-memory-llm',
    topicTitle: '800GB/s Unified Memory vs Dual Workstation GPUs: Local DaVinci & 3D Viewport Scaling',
    competitorChannelId: 'ch-circuittheory',
    competitorName: 'CircuitTheory',
    competitorHandle: '@circuittheory',
    competitorBreakoutVideo: 'Why Unified Memory Bandwidth Hits a Wall at 800GB/s',
    competitorViews: 615000,
    multiplierVsBaseline: 2.3,
    competitorWeakness:
      'CircuitTheory focused purely on synthetic C++ memory bandwidth benchmarks; creators in their top comments repeatedly asked how this impacts 8K RAW timeline scrubbing and Fusion node caching.',
    recommendedAngle:
      'Benchmark real production timelines (8K RED R3D, CinemaDNG, Unreal 5.5 viewport) across unified memory vs discrete PCIe 5.0 GPUs.',
    estimatedViewPotential: '540K – 760K views',
    searchMomentumPct: 118,
    savedToPipeline: true
  },
  {
    id: 'gap-100gbe-editing-nas',
    topicTitle: 'Silent All-Flash 25GbE Studio NAS Under $1,800 (Zero Rack Noise in Treated Rooms)',
    competitorChannelId: 'ch-pixelfoundry',
    competitorName: 'PixelFoundry',
    competitorHandle: '@pixelfoundry',
    competitorBreakoutVideo: '100Gbps NVMe NAS Build: Editing 12K RAW Over Ethernet',
    competitorViews: 940000,
    multiplierVsBaseline: 1.8,
    competitorWeakness:
      '19% negative sentiment on PixelFoundry video due to the $9,400 enterprise bill of materials and 58dBA server fan whine that makes it unusable inside a one-room creator studio.',
    recommendedAngle:
      'Combine your acoustic lab telemetry with a fanless/low-dBA 25GbE NVMe NAS build under $1,800 that stays below NC-20 noise floor.',
    estimatedViewPotential: '710K – 1.05M views',
    searchMomentumPct: 164,
    savedToPipeline: false
  },
  {
    id: 'gap-prosumer-oled-calibration',
    topicTitle: 'Hardware LUT Calibration on $950 QD-OLED Monitors: Can They Match a $4,000 Reference Grading Display?',
    competitorChannelId: 'ch-opticpulse',
    competitorName: 'OpticPulse Display Lab',
    competitorHandle: '@opticpulse',
    competitorBreakoutVideo: '240Hz QD-OLED After 3,000 Hours: Spectroradiometer Drift',
    competitorViews: 540000,
    multiplierVsBaseline: 1.9,
    competitorWeakness:
      'Viewers in both OpticPulse and VergeCraft comments are asking for a step-by-step DeckLink + ColourSpace LUT workflow to turn consumer QD-OLED panels into accurate Rec.709 grading monitors.',
    recommendedAngle:
      'Measure Delta-E 2000 before and after 3D LUT profiling on 3 popular $950 QD-OLED monitors against your studio reference panel.',
    estimatedViewPotential: '480K – 680K views',
    searchMomentumPct: 96,
    savedToPipeline: false
  }
];

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 100000 ? 0 : 1)}K`;
  }
  return num.toLocaleString();
}
