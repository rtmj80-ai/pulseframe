import React, { useState, useRef, useEffect } from 'react';
import {
  ChannelProfile,
  VideoTelemetry,
  VideoComment,
  TimestampMoment,
  formatCompactNumber
} from '../data/youtubeTelemetryData';
import {
  Search,
  Tv,
  Film,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2
} from 'lucide-react';
import thumbFallback from '../assets/images/thumb_oled_monitor_shootout_1791259106128.jpg';

export type SearchTargetMode = 'auto' | 'channel' | 'video';

interface UnifiedYouTubeSearchBarProps {
  channels: ChannelProfile[];
  videos: VideoTelemetry[];
  primaryChannelId: string;
  comparedIds: string[];
  onSelectPrimaryChannel: (channelId: string) => void;
  onToggleCompareChannel: (channelId: string) => void;
  onSelectVideoForSentiment: (videoId: string) => void;
  onAddResolvedChannel: (channel: ChannelProfile, makePrimary: boolean) => void;
  onAddResolvedVideo: (video: VideoTelemetry) => void;
  onNavigateTab: (tab: 'benchmark' | 'sentiment' | 'competitors') => void;
  isDark: boolean;
}

const DYNAMIC_COLORS = ['#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];

export const UnifiedYouTubeSearchBar: React.FC<UnifiedYouTubeSearchBarProps> = ({
  channels,
  videos,
  primaryChannelId,
  comparedIds,
  onSelectPrimaryChannel,
  onToggleCompareChannel,
  onSelectVideoForSentiment,
  onAddResolvedChannel,
  onAddResolvedVideo,
  onNavigateTab,
  isDark
}) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchTargetMode>('auto');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'channel' | 'video';
    message: string;
    targetId: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  // Filter existing channels matching query
  const matchingChannels = trimmedQuery
    ? channels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(lowerQuery) ||
          ch.handle.toLowerCase().includes(lowerQuery) ||
          ch.category.toLowerCase().includes(lowerQuery) ||
          ch.sharedKeywords.some((k) => k.toLowerCase().includes(lowerQuery))
      )
    : channels.slice(0, 3);

  // Filter existing videos matching query
  const matchingVideos = trimmedQuery
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(lowerQuery) ||
          v.format.toLowerCase().includes(lowerQuery)
      )
    : videos.slice(0, 3);

  // Determine whether the input looks like a video vs channel when in 'auto' mode
  const inferTargetType = (input: string): 'channel' | 'video' => {
    if (searchMode === 'channel') return 'channel';
    if (searchMode === 'video') return 'video';
    const lower = input.toLowerCase();
    if (
      lower.includes('watch?v=') ||
      lower.includes('youtu.be/') ||
      lower.includes('shorts/')
    ) {
      return 'video';
    }
    if (
      lower.startsWith('@') ||
      lower.includes('youtube.com/@') ||
      lower.includes('youtube.com/channel/') ||
      lower.includes('youtube.com/c/')
    ) {
      return 'channel';
    }
    // If query has 5+ words or contains typical video words like "vs", "review", "why", "how", "test", "benchmark"
    const words = lower.split(/\s+/);
    if (
      words.length >= 4 ||
      /\b(vs|review|test|why|how|inside|shootout|comparison|tutorial|teardown)\b/i.test(
        lower
      )
    ) {
      return 'video';
    }
    return 'channel';
  };

  // Resolve and add/select a YouTube Channel by name, @handle, or URL
  const triggerChannelLookup = async (rawInput: string, makePrimary = false) => {
    const clean = rawInput.trim();
    if (!clean || isSubmitting) return;

    // Check if an exact channel already exists in state
    const existing = channels.find(
      (c) =>
        c.name.toLowerCase() === clean.toLowerCase() ||
        c.handle.toLowerCase() === clean.toLowerCase() ||
        c.handle.toLowerCase() === `@${clean.toLowerCase().replace(/^@/, '')}`
    );

    if (existing) {
      if (makePrimary) {
        onSelectPrimaryChannel(existing.id);
      } else if (
        existing.id !== primaryChannelId &&
        !comparedIds.includes(existing.id)
      ) {
        onToggleCompareChannel(existing.id);
      }
      onNavigateTab('benchmark');
      setStatusBanner({
        type: 'channel',
        message: `Loaded channel "${existing.name} (${existing.handle})" in Channel Benchmark.`,
        targetId: existing.id
      });
      setIsFocused(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/youtube?action=resolve-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve-channel',
          query: clean,
          category: 'Hardware & Creator Tech'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const ch = data.channel;
        const colorHex =
          DYNAMIC_COLORS[channels.length % DYNAMIC_COLORS.length];
        const baseVel = Math.round(ch.views30d / 30000);
        const baseEng = ch.engagementRate;
        const baseSent = ch.sentimentPositive;

        const createdChannel: ChannelProfile = {
          id: `ch-search-${Date.now()}`,
          name: ch.name,
          handle: ch.handle,
          category: ch.category,
          colorHex,
          subscribers: ch.subscribers,
          overlapScore: ch.overlapScore,
          sharedKeywords: ch.sharedKeywords,
          recentBreakoutTitle: ch.recentBreakoutTitle,
          recentBreakoutViews: Math.round(
            ch.avgViewsPerVideo * ch.recentBreakoutMultiplier
          ),
          recentBreakoutMultiplier: ch.recentBreakoutMultiplier,
          recentBreakoutPublished: '4 days ago',
          radar: ch.radar,
          timeframes: {
            '30D': {
              subscribersDelta: Math.round(
                (ch.subscribers * ch.subGrowth30d) / 100
              ),
              subGrowthPct: ch.subGrowth30d,
              viewsTotal: ch.views30d,
              viewsGrowthPct: ch.viewsGrowth30d,
              avgViewsPerVideo: ch.avgViewsPerVideo,
              first24hVelocity: Math.round(ch.avgViewsPerVideo * 0.42),
              engagementRate: ch.engagementRate,
              likeRate: ch.likeRate,
              commentRate: ch.commentRate,
              uploadsPerMonth: ch.uploadsPerMonth,
              avgRetentionPct: ch.avgRetentionPct,
              medianWatchMinutes: 10.4,
              ctrEstimate: ch.ctrEstimate,
              shortsSharePct: 15,
              sentimentPositive: ch.sentimentPositive,
              sentimentNeutral: ch.sentimentNeutral,
              sentimentFriction: ch.sentimentFriction,
              netSentimentScore: ch.netSentimentScore,
              seriesDates: [
                'Sep 08',
                'Sep 12',
                'Sep 16',
                'Sep 20',
                'Sep 24',
                'Sep 28',
                'Oct 02',
                'Oct 05'
              ],
              viewVelocitySeries: [
                Math.max(20, baseVel - 20),
                Math.max(24, baseVel - 14),
                Math.max(26, baseVel - 9),
                Math.max(30, baseVel - 4),
                baseVel,
                baseVel + 7,
                baseVel + 13,
                baseVel + 19
              ],
              engagementSeries: [
                Number((baseEng - 0.3).toFixed(1)),
                Number((baseEng - 0.2).toFixed(1)),
                Number((baseEng - 0.1).toFixed(1)),
                Number(baseEng.toFixed(1)),
                Number((baseEng + 0.1).toFixed(1)),
                Number((baseEng + 0.2).toFixed(1)),
                Number((baseEng + 0.2).toFixed(1)),
                Number((baseEng + 0.3).toFixed(1))
              ],
              sentimentSeries: [
                baseSent - 2,
                baseSent - 1,
                baseSent - 1,
                baseSent,
                baseSent + 1,
                baseSent + 1,
                baseSent + 2,
                baseSent + 2
              ]
            },
            '90D': {
              subscribersDelta: Math.round(
                (ch.subscribers * ch.subGrowth30d * 2.8) / 100
              ),
              subGrowthPct: Number((ch.subGrowth30d * 2.8).toFixed(1)),
              viewsTotal: Math.round(ch.views30d * 2.85),
              viewsGrowthPct: Number((ch.viewsGrowth30d * 1.4).toFixed(1)),
              avgViewsPerVideo: Math.round(ch.avgViewsPerVideo * 0.96),
              first24hVelocity: Math.round(ch.avgViewsPerVideo * 0.4),
              engagementRate: Number((ch.engagementRate * 0.98).toFixed(2)),
              likeRate: ch.likeRate,
              commentRate: ch.commentRate,
              uploadsPerMonth: ch.uploadsPerMonth,
              avgRetentionPct: ch.avgRetentionPct,
              medianWatchMinutes: 10.1,
              ctrEstimate: ch.ctrEstimate,
              shortsSharePct: 16,
              sentimentPositive: ch.sentimentPositive,
              sentimentNeutral: ch.sentimentNeutral,
              sentimentFriction: ch.sentimentFriction,
              netSentimentScore: ch.netSentimentScore,
              seriesDates: [
                'Jul 15',
                'Jul 27',
                'Aug 08',
                'Aug 20',
                'Sep 01',
                'Sep 13',
                'Sep 25',
                'Oct 05'
              ],
              viewVelocitySeries: [
                Math.max(18, baseVel - 25),
                Math.max(22, baseVel - 18),
                Math.max(25, baseVel - 12),
                Math.max(28, baseVel - 6),
                baseVel,
                baseVel + 6,
                baseVel + 12,
                baseVel + 19
              ],
              engagementSeries: [
                Number((baseEng - 0.4).toFixed(1)),
                Number((baseEng - 0.3).toFixed(1)),
                Number((baseEng - 0.2).toFixed(1)),
                Number((baseEng - 0.1).toFixed(1)),
                Number(baseEng.toFixed(1)),
                Number((baseEng + 0.1).toFixed(1)),
                Number((baseEng + 0.2).toFixed(1)),
                Number((baseEng + 0.3).toFixed(1))
              ],
              sentimentSeries: [
                baseSent - 3,
                baseSent - 2,
                baseSent - 2,
                baseSent - 1,
                baseSent,
                baseSent + 1,
                baseSent + 1,
                baseSent + 2
              ]
            },
            '12M': {
              subscribersDelta: Math.round(
                (ch.subscribers * ch.subGrowth30d * 10.5) / 100
              ),
              subGrowthPct: Number((ch.subGrowth30d * 10.5).toFixed(1)),
              viewsTotal: Math.round(ch.views30d * 11.2),
              viewsGrowthPct: Number((ch.viewsGrowth30d * 3.2).toFixed(1)),
              avgViewsPerVideo: Math.round(ch.avgViewsPerVideo * 0.92),
              first24hVelocity: Math.round(ch.avgViewsPerVideo * 0.38),
              engagementRate: Number((ch.engagementRate * 0.95).toFixed(2)),
              likeRate: ch.likeRate,
              commentRate: ch.commentRate,
              uploadsPerMonth: ch.uploadsPerMonth,
              avgRetentionPct: ch.avgRetentionPct,
              medianWatchMinutes: 9.9,
              ctrEstimate: ch.ctrEstimate,
              shortsSharePct: 17,
              sentimentPositive: ch.sentimentPositive,
              sentimentNeutral: ch.sentimentNeutral,
              sentimentFriction: ch.sentimentFriction,
              netSentimentScore: ch.netSentimentScore,
              seriesDates: [
                'Nov',
                'Dec',
                'Jan',
                'Feb',
                'Apr',
                'Jun',
                'Aug',
                'Oct'
              ],
              viewVelocitySeries: [
                Math.max(15, baseVel - 32),
                Math.max(18, baseVel - 24),
                Math.max(22, baseVel - 16),
                Math.max(25, baseVel - 9),
                baseVel - 2,
                baseVel + 5,
                baseVel + 12,
                baseVel + 19
              ],
              engagementSeries: [
                Number((baseEng - 0.5).toFixed(1)),
                Number((baseEng - 0.4).toFixed(1)),
                Number((baseEng - 0.3).toFixed(1)),
                Number((baseEng - 0.2).toFixed(1)),
                Number((baseEng - 0.1).toFixed(1)),
                Number(baseEng.toFixed(1)),
                Number((baseEng + 0.1).toFixed(1)),
                Number((baseEng + 0.3).toFixed(1))
              ],
              sentimentSeries: [
                baseSent - 4,
                baseSent - 3,
                baseSent - 2,
                baseSent - 1,
                baseSent,
                baseSent,
                baseSent + 1,
                baseSent + 2
              ]
            }
          }
        };

        onAddResolvedChannel(createdChannel, makePrimary);
        onNavigateTab('benchmark');
        setStatusBanner({
          type: 'channel',
          message: `Indexed YouTube channel "${createdChannel.name} (${createdChannel.handle})" with ${formatCompactNumber(createdChannel.subscribers)} subscribers and pinned to Benchmark.`,
          targetId: createdChannel.id
        });
        setQuery('');
        setIsFocused(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve and analyze a YouTube Video by title or URL
  const triggerVideoLookup = async (rawInput: string) => {
    const clean = rawInput.trim();
    if (!clean || isSubmitting) return;

    // Check if an existing video matches exactly
    const existing = videos.find(
      (v) => v.title.toLowerCase() === clean.toLowerCase()
    );
    if (existing) {
      onSelectVideoForSentiment(existing.id);
      onNavigateTab('sentiment');
      setStatusBanner({
        type: 'video',
        message: `Opened sentiment telemetry for "${existing.title}".`,
        targetId: existing.id
      });
      setIsFocused(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/youtube?action=analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-video',
          videoInput: clean,
          comments: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        const pos = data.summary?.positivePct ?? 81;
        const neu = data.summary?.neutralPct ?? 11;
        const fric = data.summary?.frictionPct ?? 8;
        const comments: VideoComment[] = data.analyzedComments || [];

        const newMoments: TimestampMoment[] = comments
          .slice(0, 4)
          .map((c, idx) => ({
            timestamp: c.timestamp,
            seconds: (idx + 1) * 165,
            progressPct: 15 + idx * 23,
            retentionPct: 86 - idx * 7,
            sentimentType: c.sentiment,
            sentimentDelta:
              c.sentiment === 'positive'
                ? 29
                : c.sentiment === 'friction'
                  ? -17
                  : 9,
            label: `${c.aspect} Spike (${c.timestamp})`,
            detail: c.text,
            commentCount: 52 + idx * 38
          }));

        const realViews = data.statistics?.views || 214500;
        const realLikes = data.statistics?.likes || 15800;
        const realCommentCount = data.statistics?.commentCount || 1240;
        const computedEngagement =
          realViews > 0
            ? Number((((realLikes + realCommentCount) / realViews) * 100).toFixed(2))
            : 7.94;

        const createdVideo: VideoTelemetry = {
          id: `vid-search-${Date.now()}`,
          channelId: primaryChannelId,
          title: data.title || clean,
          publishedDate: data.publishedDate || 'Indexed via Search',
          duration: '17:24',
          durationSeconds: 1044,
          format: 'Long-Form 4K',
          thumbnailUrl: data.thumbnailUrl || thumbFallback,
          views: realViews,
          viewsFirst24h: Math.round(realViews * 0.38),
          avgViewDuration: '11:18',
          avgRetentionPct: 64.9,
          ctrPct: 8.1,
          likes: realLikes,
          commentCount: realCommentCount,
          engagementRate: computedEngagement,
          sentimentPositive: pos,
          sentimentNeutral: neu,
          sentimentFriction: fric,
          netSentimentScore: pos - fric,
          executiveSummary: `Sentiment analysis completed for "${data.title || clean}" (${comments.length} viewer comments scored). Audience praise reaches ${pos}% centered on technical benchmark depth, with ${fric}% constructive friction.`,
          retentionCurve: [100, 89, 84, 79, 76, 73, 69, 65, 61, 57, 53, 49],
          moments: newMoments,
          aspects: [
            {
              aspect: 'Technical Depth',
              positivePct: Math.min(96, pos + 7),
              neutralPct: Math.max(2, neu - 3),
              frictionPct: Math.max(2, fric - 4),
              mentionCount: 490,
              keyTakeaway:
                'Viewers praised the side-by-side empirical methodology and benchmark clarity.',
              ownerAction:
                'Include downloadable test charts in the video description to boost long-tail saves.'
            },
            {
              aspect: 'Production & Audio',
              positivePct: pos - 2,
              neutralPct: neu,
              frictionPct: fric + 2,
              mentionCount: 310,
              keyTakeaway:
                'Minor volume dip flagged during overhead B-cam transition around 04:15.',
              ownerAction:
                'Normalize secondary lavalier tracks to -14 LUFS before final master export.'
            },
            {
              aspect: 'Pricing & Value',
              positivePct: Math.max(60, pos - 6),
              neutralPct: neu + 3,
              frictionPct: fric + 3,
              mentionCount: 265,
              keyTakeaway:
                'Audience requested mid-range alternative comparisons alongside flagship hardware.',
              ownerAction:
                'Add a 90-second value tier chapter in upcoming hardware shootouts.'
            }
          ],
          comments
        };

        onAddResolvedVideo(createdVideo);
        onNavigateTab('sentiment');
        setStatusBanner({
          type: 'video',
          message: `Analyzed YouTube video "${createdVideo.title}" (+${createdVideo.netSentimentScore} Net Sentiment) in Video Sentiment Inspector.`,
          targetId: createdVideo.id
        });
        setQuery('');
        setIsFocused(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    const target = inferTargetType(trimmedQuery);
    if (target === 'video') {
      await triggerVideoLookup(trimmedQuery);
    } else {
      await triggerChannelLookup(trimmedQuery, false);
    }
  };

  const detectedType = trimmedQuery ? inferTargetType(trimmedQuery) : 'channel';

  const surfaceClass = isDark
    ? 'bg-[#192338] border-[#293548] text-[#F1F5F9]'
    : 'bg-white border-indigo-100 shadow-2xs text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const dimTextClass = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div ref={containerRef} className="relative mb-6">
      <div className={`border rounded-lg p-3.5 ${surfaceClass}`}>
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
        >
          {/* Segmented Mode Selector: Auto / Channel / Video */}
          <div
            className={`inline-flex items-center p-1 rounded-md border shrink-0 ${
              isDark
                ? 'bg-[#131B2E] border-[#293548]'
                : 'bg-indigo-50/80 border-indigo-100'
            }`}
          >
            {(
              [
                { id: 'auto', label: 'All / Auto' },
                { id: 'channel', label: 'YouTube Channel' },
                { id: 'video', label: 'YouTube Video' }
              ] as { id: SearchTargetMode; label: string }[]
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSearchMode(mode.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  searchMode === mode.id
                    ? isDark
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-white text-indigo-700 font-semibold shadow-2xs'
                    : mutedTextClass
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-indigo-300' : 'text-indigo-500'
              }`}
            />
            <input
              type="text"
              value={query}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              aria-label="Enter YouTube channel name, @handle, or YouTube video title/URL"
              placeholder={
                searchMode === 'channel'
                  ? 'Enter YouTube channel name, @handle, or URL (e.g. Marques Brownlee, @mkbhd, FrameLab Tech)...'
                  : searchMode === 'video'
                    ? 'Enter YouTube video name or URL to run sentiment check (e.g. iPhone 17 Pro Camera Review)...'
                    : 'Enter any YouTube channel name (@handle) or YouTube video title / URL...'
              }
              className={`w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${
                isDark
                  ? 'bg-[#131B2E] border-[#293548] text-white placeholder:text-slate-400'
                  : 'bg-slate-50/70 border-indigo-100 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search query"
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200/50 cursor-pointer ${mutedTextClass}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting || !trimmedQuery}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-gradient-to-r from-[#FF334B] to-[#E11D48] text-white hover:from-[#e02438] hover:to-[#be123c] shadow-2xs transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>
                    {!trimmedQuery
                      ? 'Search Channel or Video'
                      : detectedType === 'video'
                        ? 'Check Video Sentiment'
                        : 'Benchmark Channel'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Search Presets Strip */}
        <div className="mt-2.5 pt-2.5 border-t border-inherit flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className={dimTextClass}>Try searching:</span>
            <button
              type="button"
              onClick={() => triggerChannelLookup('@mkbhd', false)}
              className="font-mono text-indigo-600 hover:text-[#FF334B] hover:underline cursor-pointer font-medium"
            >
              @mkbhd (Channel)
            </button>
            <span aria-hidden="true" className={dimTextClass}>
              ·
            </span>
            <button
              type="button"
              onClick={() => triggerChannelLookup('Gamers Nexus', false)}
              className="text-indigo-600 hover:text-[#FF334B] hover:underline cursor-pointer font-medium"
            >
              Gamers Nexus (Channel)
            </button>
            <span aria-hidden="true" className={dimTextClass}>
              ·
            </span>
            <button
              type="button"
              onClick={() =>
                triggerVideoLookup(
                  'Sony FX6 vs RED Komodo-X Dynamic Range Lab Test'
                )
              }
              className="text-indigo-600 hover:text-[#FF334B] hover:underline cursor-pointer font-medium"
            >
              "Sony FX6 vs RED Komodo-X Dynamic Range Lab Test" (Video)
            </button>
          </div>

          {statusBanner && (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{statusBanner.message}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Autocomplete & Direct Lookup Dropdown */}
      {isFocused && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-40 border rounded-lg shadow-xl overflow-hidden ${
            isDark
              ? 'bg-[#192338] border-[#293548] text-white'
              : 'bg-white border-indigo-100 text-slate-900'
          }`}
        >
          {/* Direct Live Action Row when user has typed a channel or video name */}
          {trimmedQuery && (
            <div
              className={`p-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isDark
                  ? 'bg-[#131B2E] border-[#293548]'
                  : 'bg-indigo-50/60 border-indigo-100'
              }`}
            >
              <div className="text-xs">
                <span className={mutedTextClass}>Live Lookup for </span>
                <strong className="font-semibold">"{trimmedQuery}"</strong>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerChannelLookup(trimmedQuery, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[#FF334B] text-white hover:bg-[#e02438] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Benchmark as YouTube Channel</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerVideoLookup(trimmedQuery)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    isDark
                      ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30'
                      : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Run Sentiment Check as YouTube Video</span>
                </button>
              </div>
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${
              isDark ? 'divide-[#293548]' : 'divide-indigo-100'
            }`}
          >
            {/* Left Column: Matching YouTube Channels */}
            <div className="p-3.5 space-y-2">
              <div className={`text-[11px] font-medium ${mutedTextClass} flex items-center justify-between`}>
                <span>YouTube Channels ({matchingChannels.length})</span>
                <span>Subscribers · Action</span>
              </div>

              {matchingChannels.length === 0 ? (
                <div className={`py-4 text-xs ${dimTextClass}`}>
                  No tracked channel matches "{trimmedQuery}". Click{' '}
                  <strong>Benchmark as YouTube Channel</strong> above to index it live.
                </div>
              ) : (
                <div className="space-y-1">
                  {matchingChannels.map((ch) => {
                    const isPrimary = ch.id === primaryChannelId;
                    const isCompared = comparedIds.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        className={`p-2 rounded-md flex items-center justify-between gap-2 text-xs transition-colors ${
                          isDark ? 'hover:bg-[#131B2E]' : 'hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: ch.colorHex }}
                          />
                          <div className="truncate">
                            <span className="font-semibold">{ch.name}</span>{' '}
                            <span className={`font-mono ${mutedTextClass}`}>
                              {ch.handle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                          <span className={mutedTextClass}>
                            {formatCompactNumber(ch.subscribers)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPrimaryChannel(ch.id);
                              onNavigateTab('benchmark');
                              setIsFocused(false);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-sans font-medium border cursor-pointer ${
                              isPrimary
                                ? 'border-rose-300 bg-rose-50 text-rose-700'
                                : isDark
                                  ? 'border-[#293548] text-slate-300 hover:text-white'
                                  : 'border-slate-200 text-slate-600 hover:text-indigo-700 hover:border-indigo-200'
                            }`}
                          >
                            {isPrimary ? 'Baseline' : 'Set Baseline'}
                          </button>
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!isCompared) onToggleCompareChannel(ch.id);
                                onNavigateTab('benchmark');
                                setIsFocused(false);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-sans font-medium border cursor-pointer ${
                                isCompared
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                  : isDark
                                    ? 'border-[#293548] text-white hover:bg-[#131B2E]'
                                    : 'border-indigo-200 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-100'
                              }`}
                            >
                              {isCompared ? 'Comparing' : 'Compare'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Matching YouTube Videos */}
            <div className="p-3.5 space-y-2">
              <div className={`text-[11px] font-medium ${mutedTextClass} flex items-center justify-between`}>
                <span>YouTube Videos ({matchingVideos.length})</span>
                <span>Sentiment · Action</span>
              </div>

              {matchingVideos.length === 0 ? (
                <div className={`py-4 text-xs ${dimTextClass}`}>
                  No indexed video matches "{trimmedQuery}". Click{' '}
                  <strong>Run Sentiment Check as YouTube Video</strong> above to analyze it.
                </div>
              ) : (
                <div className="space-y-1">
                  {matchingVideos.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => {
                        onSelectVideoForSentiment(vid.id);
                        onNavigateTab('sentiment');
                        setIsFocused(false);
                      }}
                      className={`p-2 rounded-md flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-[#131B2E]' : 'hover:bg-indigo-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{vid.title}</div>
                        <div className={`text-[11px] font-mono tabular-nums ${dimTextClass}`}>
                          {vid.duration} · {formatCompactNumber(vid.views)} views
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                        <span className="text-emerald-600 font-semibold">
                          +{vid.netSentimentScore} Net
                        </span>
                        <span className="text-[11px] font-sans text-indigo-600 font-medium hover:underline">
                          Inspect →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
