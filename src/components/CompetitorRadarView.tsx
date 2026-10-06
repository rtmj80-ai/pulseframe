import React, { useState } from 'react';
import {
  ChannelProfile,
  ContentGapOpportunity,
  TimeframeKey,
  formatCompactNumber
} from '../data/youtubeTelemetryData';
import {
  Plus,
  Search,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Target,
  TrendingUp,
  Layers
} from 'lucide-react';

interface CompetitorRadarViewProps {
  channels: ChannelProfile[];
  primaryChannelId: string;
  comparedIds: string[];
  onToggleCompareChannel: (id: string) => void;
  timeframe: TimeframeKey;
  contentGaps: ContentGapOpportunity[];
  onToggleSaveGap: (gapId: string) => void;
  onOpenAddChannel: () => void;
  onJumpToBenchmark: () => void;
  isDark: boolean;
}

type CompetitorFilterType = 'all' | 'high-overlap' | 'high-velocity' | 'benchmarked';
type CompetitorSortType = 'overlap' | 'views-growth' | 'avg-views' | 'engagement' | 'sentiment';

export const CompetitorRadarView: React.FC<CompetitorRadarViewProps> = ({
  channels,
  primaryChannelId,
  comparedIds,
  onToggleCompareChannel,
  timeframe,
  contentGaps,
  onToggleSaveGap,
  onOpenAddChannel,
  onJumpToBenchmark,
  isDark
}) => {
  const [compFilter, setCompFilter] = useState<CompetitorFilterType>('all');
  const [compSort, setCompSort] = useState<CompetitorSortType>('overlap');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScatterId, setSelectedScatterId] = useState<string | null>(null);
  const [gapFilterSavedOnly, setGapFilterSavedOnly] = useState(false);

  const primaryChannel =
    channels.find((c) => c.id === primaryChannelId) || channels[0];
  const competitors = channels.filter((c) => c.id !== primaryChannel.id);

  // Filter and sort competitors
  const filteredCompetitors = competitors
    .filter((c) => {
      if (compFilter === 'high-overlap' && c.overlapScore < 80) return false;
      if (
        compFilter === 'high-velocity' &&
        c.timeframes[timeframe].viewsGrowthPct <=
          primaryChannel.timeframes[timeframe].viewsGrowthPct
      ) {
        return false;
      }
      if (compFilter === 'benchmarked' && !comparedIds.includes(c.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchHandle = c.handle.toLowerCase().includes(q);
        const matchKw = c.sharedKeywords.some((k) => k.toLowerCase().includes(q));
        return matchName || matchHandle || matchKw;
      }
      return true;
    })
    .sort((a, b) => {
      if (compSort === 'overlap') return b.overlapScore - a.overlapScore;
      if (compSort === 'views-growth')
        return (
          b.timeframes[timeframe].viewsGrowthPct -
          a.timeframes[timeframe].viewsGrowthPct
        );
      if (compSort === 'avg-views')
        return (
          b.timeframes[timeframe].avgViewsPerVideo -
          a.timeframes[timeframe].avgViewsPerVideo
        );
      if (compSort === 'engagement')
        return (
          b.timeframes[timeframe].engagementRate -
          a.timeframes[timeframe].engagementRate
        );
      return (
        b.timeframes[timeframe].netSentimentScore -
        a.timeframes[timeframe].netSentimentScore
      );
    });

  const inspectedChannel =
    channels.find((c) => c.id === selectedScatterId) ||
    filteredCompetitors[0] ||
    competitors[0] ||
    primaryChannel;

  // Scatter Plot Geometry (X = Uploads/Month, Y = Avg Views/Video)
  const scatterW = 480;
  const scatterH = 240;
  const padL = 48;
  const padR = 24;
  const padT = 22;
  const padB = 34;
  const plotW = scatterW - padL - padR;
  const plotH = scatterH - padT - padB;

  const cadences = channels.map((c) => c.timeframes[timeframe].uploadsPerMonth);
  const avgViewsList = channels.map(
    (c) => c.timeframes[timeframe].avgViewsPerVideo / 1000
  ); // in K

  const minX = Math.max(1, Math.min(...cadences) - 1);
  const maxX = Math.max(...cadences) + 1;
  const minY = Math.max(50, Math.min(...avgViewsList) * 0.85);
  const maxY = Math.max(...avgViewsList) * 1.12;

  const getScatterX = (cadence: number) =>
    padL + ((cadence - minX) / Math.max(1, maxX - minX)) * plotW;
  const getScatterY = (viewsK: number) =>
    padT + plotH - ((viewsK - minY) / Math.max(1, maxY - minY)) * plotH;

  const visibleGaps = gapFilterSavedOnly
    ? contentGaps.filter((g) => g.savedToPipeline)
    : contentGaps;

  const surfaceClass = isDark
    ? 'bg-[#192338] border-[#293548] text-[#F1F5F9]'
    : 'bg-white border-indigo-100 shadow-2xs text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const dimTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-[#293548]' : 'border-indigo-100';
  const subtleBgClass = isDark ? 'bg-[#131B2E]' : 'bg-indigo-50/50';
  const positiveTextClass = isDark ? 'text-emerald-400' : 'text-emerald-600';

  return (
    <div className="space-y-6">
      {/* Top Header Strip */}
      <div className={`border rounded-lg p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${surfaceClass}`}>
        <div>
          <div className={`text-xs ${mutedTextClass} flex items-center gap-2 mb-1`}>
            <span>Closest Competitor Tracking</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {competitors.length} Peer Channels Monitored
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {contentGaps.filter((g) => g.savedToPipeline).length} Saved Pipeline Concepts
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            Closest Competitor Radar & Content Gap Intelligence
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onJumpToBenchmark}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
              isDark
                ? 'border-[#262C36] bg-[#171A21] text-[#F3F4F6] hover:bg-[#1F242D]'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Compare Selected ({comparedIds.length}) in Benchmark →</span>
          </button>

          <button
            onClick={onOpenAddChannel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#FF2E43] text-white hover:bg-[#e02438] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track New Competitor</span>
          </button>
        </div>
      </div>

      {/* Positioning Map (5 cols) + Inspected Competitor Proximity Dossier (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Columns: 2D Competitive Positioning Scatter Plot */}
        <div className={`lg:col-span-5 border rounded-lg p-5 flex flex-col justify-between ${surfaceClass}`}>
          <div className="pb-3 border-b border-inherit">
            <h2 className="text-base font-display font-semibold">
              Cohort Cadence vs. Yield Positioning ({timeframe})
            </h2>
            <p className={`text-xs ${mutedTextClass} mt-0.5`}>
              X: Uploads/Month · Y: Avg Views/Video (K) · Click any node to inspect
            </p>
          </div>

          <div className="my-2 w-full overflow-x-auto">
            <svg viewBox={`0 0 ${scatterW} ${scatterH}`} className="w-full h-56 select-none">
              {/* Grid Lines */}
              {[0, 0.5, 1].map((step, idx) => {
                const y = padT + step * plotH;
                const valY = Math.round(maxY - step * (maxY - minY));
                return (
                  <g key={idx}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={scatterW - padR}
                      y2={y}
                      stroke={isDark ? '#1F242D' : '#E2E8F0'}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-[#6B7280]"
                    >
                      {valY}K
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Labels */}
              {[0, 0.5, 1].map((step, idx) => {
                const x = padL + step * plotW;
                const valX = (minX + step * (maxX - minX)).toFixed(1);
                return (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={padT}
                      x2={x}
                      y2={padT + plotH}
                      stroke={isDark ? '#1F242D' : '#E2E8F0'}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={x}
                      y={scatterH - 8}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-[#6B7280]"
                    >
                      {valX}/mo
                    </text>
                  </g>
                );
              })}

              {/* Channel Bubbles */}
              {channels.map((ch) => {
                const tf = ch.timeframes[timeframe];
                const cx = getScatterX(tf.uploadsPerMonth);
                const cy = getScatterY(tf.avgViewsPerVideo / 1000);
                const r = Math.max(7, Math.min(15, ch.subscribers / 130000));
                const isSelected = inspectedChannel.id === ch.id;

                return (
                  <g
                    key={ch.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedScatterId(ch.id)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? r + 3 : r}
                      fill={ch.colorHex}
                      fillOpacity={ch.id === primaryChannel.id ? '0.9' : '0.7'}
                      stroke={isSelected ? '#FFFFFF' : isDark ? '#111318' : '#FFFFFF'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    <text
                      x={cx}
                      y={cy - r - 5}
                      textAnchor="middle"
                      className={`text-[10px] font-mono ${
                        isSelected || ch.id === primaryChannel.id
                          ? isDark
                            ? 'fill-white font-semibold'
                            : 'fill-slate-900 font-semibold'
                          : 'fill-[#9CA3AF]'
                      }`}
                    >
                      {ch.handle}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className={`pt-3 border-t ${borderClass} flex items-center justify-between text-xs ${mutedTextClass}`}>
            <span>Bubble size = Total Subscribers</span>
            <span className="font-mono tabular-nums">
              Baseline: {primaryChannel.handle}
            </span>
          </div>
        </div>

        {/* Right 7 Columns: Inspected Competitor Proximity Dossier */}
        <div className={`lg:col-span-7 border rounded-lg p-5 flex flex-col justify-between ${surfaceClass}`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit">
              <div>
                <div className={`text-xs ${mutedTextClass} flex items-center gap-2`}>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: inspectedChannel.colorHex }}
                  />
                  <span>{inspectedChannel.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {inspectedChannel.overlapScore}% Audience Overlap
                  </span>
                </div>
                <h2 className="text-lg font-display font-bold mt-1">
                  {inspectedChannel.name}{' '}
                  <span className={`font-mono text-sm font-normal ${mutedTextClass}`}>
                    ({inspectedChannel.handle})
                  </span>
                </h2>
              </div>

              {inspectedChannel.id !== primaryChannel.id && (
                <button
                  onClick={() => onToggleCompareChannel(inspectedChannel.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                    comparedIds.includes(inspectedChannel.id)
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : isDark
                        ? 'border-[#262C36] bg-[#171A21] text-[#F3F4F6] hover:bg-[#1F242D]'
                        : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {comparedIds.includes(inspectedChannel.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pinned in Benchmark</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pin to Benchmark</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 4-Column Mini Telemetry Grid for Inspected Channel */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b ${borderClass} font-mono tabular-nums`}>
              <div>
                <div className={`text-[11px] font-sans ${mutedTextClass}`}>Subscribers</div>
                <div className="text-base font-semibold mt-0.5">
                  {formatCompactNumber(inspectedChannel.subscribers)}
                </div>
                <div className="text-[11px] text-emerald-400">
                  +{inspectedChannel.timeframes[timeframe].subGrowthPct}% ({timeframe})
                </div>
              </div>
              <div>
                <div className={`text-[11px] font-sans ${mutedTextClass}`}>Avg Views / Video</div>
                <div className="text-base font-semibold mt-0.5">
                  {formatCompactNumber(
                    inspectedChannel.timeframes[timeframe].avgViewsPerVideo
                  )}
                </div>
                <div className={`text-[11px] ${mutedTextClass}`}>
                  {inspectedChannel.timeframes[timeframe].uploadsPerMonth} uploads/mo
                </div>
              </div>
              <div>
                <div className={`text-[11px] font-sans ${mutedTextClass}`}>Engagement Rate</div>
                <div className="text-base font-semibold mt-0.5">
                  {inspectedChannel.timeframes[timeframe].engagementRate}%
                </div>
                <div className={`text-[11px] ${mutedTextClass}`}>
                  {inspectedChannel.timeframes[timeframe].avgRetentionPct}% retention
                </div>
              </div>
              <div>
                <div className={`text-[11px] font-sans ${mutedTextClass}`}>Net Sentiment</div>
                <div className="text-base font-semibold text-emerald-400 mt-0.5">
                  +{inspectedChannel.timeframes[timeframe].netSentimentScore}
                </div>
                <div className={`text-[11px] ${mutedTextClass}`}>
                  {inspectedChannel.timeframes[timeframe].sentimentPositive}% pos /{' '}
                  {inspectedChannel.timeframes[timeframe].sentimentFriction}% fric
                </div>
              </div>
            </div>

            {/* Breakout Upload & Shared Keyword Footprint */}
            <div className="pt-4 space-y-3 text-xs">
              <div>
                <div className={`text-[11px] ${mutedTextClass} mb-1`}>
                  Recent Breakout Upload ({inspectedChannel.recentBreakoutPublished})
                </div>
                <div className={`p-3 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${subtleBgClass}`}>
                  <div className="font-medium">
                    {inspectedChannel.recentBreakoutTitle}
                  </div>
                  <div className="font-mono tabular-nums text-emerald-400 shrink-0">
                    {formatCompactNumber(inspectedChannel.recentBreakoutViews)} views ·{' '}
                    {inspectedChannel.recentBreakoutMultiplier}x baseline
                  </div>
                </div>
              </div>

              <div>
                <span className={`${mutedTextClass} mr-2`}>
                  Shared Audience Topic Keywords:
                </span>
                <span className="font-mono text-[11px]">
                  {inspectedChannel.sharedKeywords.join(' · ')}
                </span>
              </div>
            </div>
          </div>

          <div className={`pt-3 mt-4 border-t ${borderClass} flex items-center justify-between text-xs ${mutedTextClass}`}>
            <span>
              Click any row in the Competitor Roster below to update this proximity dossier
            </span>
          </div>
        </div>
      </div>

      {/* Closest Competitor Roster Table */}
      <div className={`border rounded-lg overflow-hidden ${surfaceClass}`}>
        <div className="p-5 border-b border-inherit flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-display font-semibold">
              Tracked Competitor Roster & Overlap Matrix
            </h2>
            <p className={`text-xs ${mutedTextClass} mt-0.5`}>
              Ranked by viewer audience overlap, search keyword similarity, and 30-day velocity momentum
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${dimTextClass}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competitor or keyword..."
                className={`pl-8 pr-3 py-1.5 text-xs rounded-md border focus:outline-none ${
                  isDark
                    ? 'bg-[#0A0B0E] border-[#262C36] text-[#F3F4F6]'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Filter Tabs */}
            <div
              className={`inline-flex items-center p-1 rounded-md border ${
                isDark ? 'bg-[#0A0B0E] border-[#1F242D]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {(
                [
                  { id: 'all', label: 'All Peers' },
                  { id: 'high-overlap', label: '≥80% Overlap' },
                  { id: 'high-velocity', label: 'Outperforming' },
                  { id: 'benchmarked', label: 'Pinned' }
                ] as { id: CompetitorFilterType; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCompFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    compFilter === tab.id
                      ? isDark
                        ? 'bg-[#1F242D] text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : mutedTextClass
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <select
              aria-label="Sort competitors"
              value={compSort}
              onChange={(e) => setCompSort(e.target.value as CompetitorSortType)}
              className={`text-xs rounded-md px-2.5 py-1.5 border focus:outline-none ${
                isDark
                  ? 'bg-[#171A21] border-[#262C36] text-[#F3F4F6]'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="overlap">Sort: Audience Overlap</option>
              <option value="views-growth">Sort: View Velocity Growth</option>
              <option value="avg-views">Sort: Avg Views / Video</option>
              <option value="engagement">Sort: Engagement Rate</option>
              <option value="sentiment">Sort: Net Sentiment Score</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-medium ${borderClass} ${subtleBgClass} ${mutedTextClass}`}>
                <th className="py-3 px-4">Competitor Channel</th>
                <th className="py-3 px-4 text-right">Audience Overlap</th>
                <th className="py-3 px-4 text-right">Subscribers</th>
                <th className="py-3 px-4 text-right">{timeframe} View Growth</th>
                <th className="py-3 px-4 text-right">Avg Views / Upload</th>
                <th className="py-3 px-4 text-right">Engagement</th>
                <th className="py-3 px-4 text-right">Net Sentiment</th>
                <th className="py-3 px-4 text-right">Benchmark Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-[#1F242D]' : 'divide-slate-200'}`}>
              {filteredCompetitors.map((comp) => {
                const tf = comp.timeframes[timeframe];
                const isPinned = comparedIds.includes(comp.id);
                const isInspected = inspectedChannel.id === comp.id;

                return (
                  <tr
                    key={comp.id}
                    onClick={() => setSelectedScatterId(comp.id)}
                    className={`transition-colors cursor-pointer ${
                      isInspected
                        ? isDark
                          ? 'bg-[#171A21]'
                          : 'bg-slate-100/80'
                        : isDark
                          ? 'hover:bg-[#171A21]/50'
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: comp.colorHex }}
                        />
                        <div>
                          <div className="font-semibold">
                            {comp.name}{' '}
                            <span className={`font-mono font-normal ${mutedTextClass}`}>
                              {comp.handle}
                            </span>
                          </div>
                          <div className={`text-[11px] ${dimTextClass} mt-0.5`}>
                            {comp.category} · {comp.sharedKeywords.slice(0, 3).join(' · ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="font-semibold">{comp.overlapScore}%</span>
                        <div className={`w-20 h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#131B2E]' : 'bg-slate-100'}`}>
                          <div
                            style={{
                              width: `${comp.overlapScore}%`,
                              backgroundColor: comp.colorHex
                            }}
                            className="h-full"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div>{formatCompactNumber(comp.subscribers)}</div>
                      <div className={`text-[11px] ${dimTextClass}`}>
                        +{tf.subGrowthPct}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span className={`inline-flex items-center justify-end gap-0.5 font-semibold ${positiveTextClass}`}>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{tf.viewsGrowthPct}%
                      </span>
                      <div className={`text-[11px] ${dimTextClass}`}>
                        {formatCompactNumber(tf.viewsTotal)} total
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div>{formatCompactNumber(tf.avgViewsPerVideo)}</div>
                      <div className={`text-[11px] ${dimTextClass}`}>
                        {tf.uploadsPerMonth}/mo cadence
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div>{tf.engagementRate.toFixed(2)}%</div>
                      <div className={`text-[11px] ${dimTextClass}`}>
                        {tf.avgRetentionPct}% ret
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <span className={`font-semibold ${positiveTextClass}`}>
                        +{tf.netSentimentScore}
                      </span>
                      <div className={`text-[11px] ${dimTextClass}`}>
                        {tf.sentimentPositive}% pos
                      </div>
                    </td>

                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onToggleCompareChannel(comp.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap cursor-pointer ${
                          isPinned
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                            : isDark
                              ? 'border-[#262C36] bg-[#0A0B0E] text-[#F3F4F6] hover:bg-[#1F242D]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isPinned ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>In Benchmark</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Compare</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Gap & Breakout Format Detector */}
      <div className={`border rounded-lg overflow-hidden ${surfaceClass}`}>
        <div className="p-5 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className={`text-xs ${mutedTextClass} flex items-center gap-2 mb-1`}>
              <Target className="w-3.5 h-3.5 text-[#FF2E43]" />
              <span>Actionable Competitive Opportunity Engine</span>
            </div>
            <h2 className="text-base font-display font-semibold">
              High-Velocity Competitor Breakout Topics & Audience Friction Gaps
            </h2>
            <p className={`text-xs ${mutedTextClass} mt-0.5`}>
              Identifies competitor uploads outperforming baseline by ≥1.8x where viewer comments reveal unanswered technical gaps
            </p>
          </div>

          <button
            onClick={() => setGapFilterSavedOnly((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
              gapFilterSavedOnly
                ? 'border-[#FF2E43] bg-[#FF2E43]/10 text-[#FF2E43]'
                : isDark
                  ? 'border-[#262C36] bg-[#171A21] text-[#F3F4F6]'
                  : 'border-slate-300 bg-slate-50 text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {gapFilterSavedOnly
                ? 'Showing Saved Pipeline Only'
                : `Filter Saved Pipeline (${contentGaps.filter((g) => g.savedToPipeline).length})`}
            </span>
          </button>
        </div>

        <div className={`divide-y ${isDark ? 'divide-[#1F242D]' : 'divide-slate-200'}`}>
          {visibleGaps.map((gap) => (
            <div key={gap.id} className="p-5 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  {/* Unboxed Metadata Line */}
                  <div className={`text-xs ${mutedTextClass} flex items-center gap-2 flex-wrap font-mono tabular-nums`}>
                    <span className="text-[#FF2E43] font-semibold">
                      {gap.multiplierVsBaseline}x Competitor Breakout
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Origin: {gap.competitorName} ({gap.competitorHandle})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      +{gap.searchMomentumPct}% Search Velocity
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Est. Yield: {gap.estimatedViewPotential}</span>
                  </div>
                  <h3 className="text-base font-display font-semibold mt-1">
                    {gap.topicTitle}
                  </h3>
                </div>

                <button
                  onClick={() => onToggleSaveGap(gap.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    gap.savedToPipeline
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : isDark
                        ? 'border-[#262C36] bg-[#171A21] text-[#F3F4F6] hover:bg-[#1F242D]'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {gap.savedToPipeline ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>Saved to Production Pipeline</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to Production Pipeline</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
                <div className={`p-3.5 rounded-md border ${isDark ? 'bg-[#131B2E] border-rose-500/30' : 'bg-rose-50/60 border-rose-200'}`}>
                  <div className="font-semibold text-rose-600 mb-1">
                    Competitor Comment Friction ({gap.competitorBreakoutVideo})
                  </div>
                  <p className={`leading-relaxed ${mutedTextClass}`}>
                    {gap.competitorWeakness}
                  </p>
                </div>

                <div className={`p-3.5 rounded-md border ${isDark ? 'bg-[#131B2E] border-emerald-500/30' : 'bg-emerald-50/60 border-emerald-200'}`}>
                  <div className="font-semibold text-emerald-700 mb-1">
                    Recommended Differentiation Angle for {primaryChannel.name}
                  </div>
                  <p className={`leading-relaxed ${mutedTextClass}`}>
                    {gap.recommendedAngle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
