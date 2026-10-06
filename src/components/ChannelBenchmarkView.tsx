import React, { useState } from 'react';
import {
  ChannelProfile,
  TimeframeKey,
  formatCompactNumber
} from '../data/youtubeTelemetryData';
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  Check,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface ChannelBenchmarkViewProps {
  channels: ChannelProfile[];
  primaryChannelId: string;
  onSelectPrimaryChannel: (id: string) => void;
  comparedIds: string[];
  onToggleCompareChannel: (id: string) => void;
  timeframe: TimeframeKey;
  onOpenAddChannel: () => void;
  onJumpToVideoSentiment: () => void;
  onJumpToCompetitorRadar: () => void;
  isDark: boolean;
}

type SeriesMetricType = 'velocity' | 'engagement' | 'sentiment';

export const ChannelBenchmarkView: React.FC<ChannelBenchmarkViewProps> = ({
  channels,
  primaryChannelId,
  onSelectPrimaryChannel,
  comparedIds,
  onToggleCompareChannel,
  timeframe,
  onOpenAddChannel,
  onJumpToVideoSentiment,
  onJumpToCompetitorRadar,
  isDark
}) => {
  const [seriesMetric, setSeriesMetric] = useState<SeriesMetricType>('velocity');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const primaryChannel =
    channels.find((c) => c.id === primaryChannelId) || channels[0];
  const comparedChannels = channels.filter(
    (c) => c.id !== primaryChannel.id && comparedIds.includes(c.id)
  );
  const activeCohort = [primaryChannel, ...comparedChannels];

  const primaryTf = primaryChannel.timeframes[timeframe];

  // Calculate competitor averages for delta comparison
  const compAvgViews =
    comparedChannels.length > 0
      ? comparedChannels.reduce(
          (acc, c) => acc + c.timeframes[timeframe].viewsTotal,
          0
        ) / comparedChannels.length
      : primaryTf.viewsTotal;

  const compAvgEngagement =
    comparedChannels.length > 0
      ? comparedChannels.reduce(
          (acc, c) => acc + c.timeframes[timeframe].engagementRate,
          0
        ) / comparedChannels.length
      : primaryTf.engagementRate;

  const compAvgSentiment =
    comparedChannels.length > 0
      ? comparedChannels.reduce(
          (acc, c) => acc + c.timeframes[timeframe].netSentimentScore,
          0
        ) / comparedChannels.length
      : primaryTf.netSentimentScore;

  const compAvgSubGrowth =
    comparedChannels.length > 0
      ? comparedChannels.reduce(
          (acc, c) => acc + c.timeframes[timeframe].subGrowthPct,
          0
        ) / comparedChannels.length
      : primaryTf.subGrowthPct;

  const viewsVsCohortPct =
    compAvgViews > 0
      ? ((primaryTf.viewsTotal - compAvgViews) / compAvgViews) * 100
      : 0;
  const engVsCohortDiff = primaryTf.engagementRate - compAvgEngagement;
  const sentVsCohortDiff = primaryTf.netSentimentScore - compAvgSentiment;
  const subGrowthDiff = primaryTf.subGrowthPct - compAvgSubGrowth;

  // Prepare SVG Multi-Series Chart Geometry
  const dates = primaryTf.seriesDates;
  const getSeriesValues = (ch: ChannelProfile): number[] => {
    const tf = ch.timeframes[timeframe];
    if (seriesMetric === 'velocity') return tf.viewVelocitySeries;
    if (seriesMetric === 'engagement') return tf.engagementSeries;
    return tf.sentimentSeries;
  };

  const allSeriesValues = activeCohort.flatMap((ch) => getSeriesValues(ch));
  const minVal = Math.max(0, Math.min(...allSeriesValues) * 0.88);
  const maxVal = Math.max(...allSeriesValues) * 1.08;
  const valSpan = Math.max(1, maxVal - minVal);

  const chartWidth = 680;
  const chartHeight = 250;
  const padLeft = 44;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const xForIndex = (idx: number) =>
    padLeft + (idx / Math.max(1, dates.length - 1)) * plotW;
  const yForValue = (val: number) =>
    padTop + plotH - ((val - minVal) / valSpan) * plotH;

  // Radar Chart Geometry (6 axes)
  const radarAxes: { key: keyof ChannelProfile['radar']; label: string }[] = [
    { key: 'uploadCadence', label: 'Upload Cadence' },
    { key: 'viewVelocity', label: 'View Velocity' },
    { key: 'audienceRetention', label: 'Retention' },
    { key: 'engagementDepth', label: 'Engagement' },
    { key: 'sentimentHealth', label: 'Sentiment' },
    { key: 'evergreenLongTail', label: 'Evergreen Tail' }
  ];
  const radarCenter = 135;
  const radarRadius = 86;

  const getRadarPoint = (axisIdx: number, score: number) => {
    const angle = (Math.PI * 2 * axisIdx) / radarAxes.length - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, score)) / 100) * radarRadius;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle)
    };
  };

  // Export Benchmark CSV handler
  const handleExportBenchmarkCsv = () => {
    const headers = [
      'Channel Name',
      'Handle',
      'Role',
      'Subscribers',
      `${timeframe} Net Sub Growth (%)`,
      `${timeframe} Total Views`,
      'Avg Views / Video',
      'First 24h Velocity',
      'Engagement Rate (%)',
      'Avg Retention (%)',
      'CTR Estimate (%)',
      'Uploads / Month',
      'Positive Sentiment (%)',
      'Constructive Friction (%)',
      'Net Sentiment Score'
    ];

    const rows = activeCohort.map((ch) => {
      const tf = ch.timeframes[timeframe];
      return [
        `"${ch.name}"`,
        ch.handle,
        ch.id === primaryChannel.id ? 'Primary Baseline' : 'Tracked Competitor',
        ch.subscribers,
        tf.subGrowthPct,
        tf.viewsTotal,
        tf.avgViewsPerVideo,
        tf.first24hVelocity,
        tf.engagementRate,
        tf.avgRetentionPct,
        tf.ctrEstimate,
        tf.uploadsPerMonth,
        tf.sentimentPositive,
        tf.sentimentFriction,
        tf.netSentimentScore
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulseframe-benchmark-${primaryChannel.handle.replace('@', '')}-${timeframe}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const surfaceClass = isDark
    ? 'bg-[#192338] border-[#293548] text-[#F1F5F9]'
    : 'bg-white border-indigo-100 shadow-2xs text-slate-900';
  const mutedTextClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const dimTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderClass = isDark ? 'border-[#293548]' : 'border-indigo-100';
  const subtleBgClass = isDark ? 'bg-[#131B2E]' : 'bg-indigo-50/50';
  const positiveTextClass = isDark ? 'text-emerald-400' : 'text-emerald-600';
  const warningTextClass = isDark ? 'text-amber-400' : 'text-amber-600';
  const dangerTextClass = isDark ? 'text-rose-400' : 'text-rose-600';

  const activeStepIndex =
    hoverIndex !== null ? hoverIndex : dates.length - 1;

  return (
    <div className="space-y-6">
      {/* Section Header & Cohort Selector Strip */}
      <div className={`border rounded-lg p-5 ${surfaceClass}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-inherit">
          <div>
            <div className={`text-xs ${mutedTextClass} flex items-center gap-2 mb-1`}>
              <span>Head-to-Head Telemetry</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{timeframe} Window</span>
              <span aria-hidden="true">·</span>
              <span>{activeCohort.length} Channels Active</span>
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">
              Channel Benchmarking & Cohort Velocity
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <label
                htmlFor="primary-channel-select"
                className={`text-xs ${mutedTextClass} whitespace-nowrap`}
              >
                Baseline Channel:
              </label>
              <select
                id="primary-channel-select"
                value={primaryChannel.id}
                onChange={(e) => onSelectPrimaryChannel(e.target.value)}
                className={`text-xs font-medium rounded-md px-3 py-2 border transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF2E43] ${
                  isDark
                    ? 'bg-[#171A21] border-[#262C36] text-[#F3F4F6]'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name} ({ch.handle})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportBenchmarkCsv}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                isDark
                  ? 'border-[#262C36] bg-[#171A21] text-[#F3F4F6] hover:bg-[#1F242D]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddChannel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-gradient-to-r from-[#FF334B] to-[#E11D48] text-white hover:from-[#e02438] hover:to-[#be123c] shadow-2xs transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Channel to Roster</span>
            </button>
          </div>
        </div>

        {/* Competitor Comparison Toggle Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium ${mutedTextClass} mr-1 flex items-center gap-1.5`}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Compare Against (up to 4):</span>
            </span>

            {channels
              .filter((c) => c.id !== primaryChannel.id)
              .map((comp) => {
                const isSelected = comparedIds.includes(comp.id);
                return (
                  <button
                    key={comp.id}
                    onClick={() => onToggleCompareChannel(comp.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#131B2E] border-indigo-400 text-white'
                          : 'bg-indigo-50/90 border-indigo-300 text-slate-900 shadow-2xs'
                        : isDark
                          ? 'bg-transparent border-[#293548] text-slate-400 hover:text-slate-200'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isSelected ? comp.colorHex : '#94A3B8'
                      }}
                    />
                    <span>{comp.name}</span>
                    <span className="font-mono tabular-nums opacity-75">
                      {formatCompactNumber(comp.subscribers)}
                    </span>
                    {isSelected && <Check className={`w-3.5 h-3.5 ${positiveTextClass}`} />}
                  </button>
                );
              })}
          </div>

          <div className={`text-xs ${mutedTextClass} flex items-center gap-3 shrink-0`}>
            <button
              onClick={onJumpToVideoSentiment}
              className="hover:underline text-indigo-600 font-semibold whitespace-nowrap cursor-pointer"
            >
              Inspect Video Sentiment →
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column KPI Delta Strip (Single-Elevation Composite Panel with Bright Accent Tops) */}
      <div
        className={`border rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x ${surfaceClass} ${
          isDark ? 'divide-[#293548]' : 'divide-indigo-100'
        }`}
      >
        {/* KPI 1: Subscribers & Growth Velocity */}
        <div className="p-5 border-t-3 border-t-[#FF334B]">
          <div className={`text-xs ${mutedTextClass} flex items-center justify-between`}>
            <span className="font-medium">Baseline Subscribers</span>
            <span className="font-mono tabular-nums text-[#FF334B] font-medium">{primaryChannel.handle}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-mono font-semibold tabular-nums tracking-tight">
              {formatCompactNumber(primaryChannel.subscribers)}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold tabular-nums ${
                subGrowthDiff >= 0 ? positiveTextClass : warningTextClass
              }`}
            >
              {subGrowthDiff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {primaryTf.subGrowthPct > 0 ? `+${primaryTf.subGrowthPct}%` : `${primaryTf.subGrowthPct}%`} ({timeframe})
            </span>
          </div>
          <div className={`mt-2 text-xs ${dimTextClass} flex items-center gap-1.5 font-mono tabular-nums`}>
            <span>+{formatCompactNumber(primaryTf.subscribersDelta)} net</span>
            <span aria-hidden="true">·</span>
            <span>
              {subGrowthDiff >= 0 ? `+${subGrowthDiff.toFixed(1)}%` : `${subGrowthDiff.toFixed(1)}%`} vs peer avg
            </span>
          </div>
        </div>

        {/* KPI 2: Period View Velocity */}
        <div className="p-5 border-t-3 border-t-[#2563EB]">
          <div className={`text-xs ${mutedTextClass} flex items-center justify-between`}>
            <span className="font-medium">{timeframe} View Volume</span>
            <span className="font-mono tabular-nums text-blue-600 font-medium">{primaryTf.uploadsPerMonth} uploads/mo</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-mono font-semibold tabular-nums tracking-tight">
              {formatCompactNumber(primaryTf.viewsTotal)}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold tabular-nums ${
                viewsVsCohortPct >= 0 ? positiveTextClass : warningTextClass
              }`}
            >
              {viewsVsCohortPct >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {viewsVsCohortPct >= 0
                ? `+${viewsVsCohortPct.toFixed(1)}%`
                : `${viewsVsCohortPct.toFixed(1)}%`}{' '}
              vs peers
            </span>
          </div>
          <div className={`mt-2 text-xs ${dimTextClass} flex items-center gap-1.5 font-mono tabular-nums`}>
            <span>{formatCompactNumber(primaryTf.avgViewsPerVideo)} avg/video</span>
            <span aria-hidden="true">·</span>
            <span>{formatCompactNumber(primaryTf.first24hVelocity)} first 24h</span>
          </div>
        </div>

        {/* KPI 3: Engagement Rate Depth */}
        <div className="p-5 border-t-3 border-t-[#7C3AED]">
          <div className={`text-xs ${mutedTextClass} flex items-center justify-between`}>
            <span className="font-medium">Engagement Rate</span>
            <span className="font-mono tabular-nums text-violet-600 font-medium">{primaryTf.avgRetentionPct}% retention</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-mono font-semibold tabular-nums tracking-tight">
              {primaryTf.engagementRate.toFixed(2)}%
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold tabular-nums ${
                engVsCohortDiff >= 0 ? positiveTextClass : warningTextClass
              }`}
            >
              {engVsCohortDiff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {engVsCohortDiff >= 0
                ? `+${engVsCohortDiff.toFixed(2)}%`
                : `${engVsCohortDiff.toFixed(2)}%`}{' '}
              vs peers
            </span>
          </div>
          <div className={`mt-2 text-xs ${dimTextClass} flex items-center gap-1.5 font-mono tabular-nums`}>
            <span>{primaryTf.likeRate}% likes</span>
            <span aria-hidden="true">·</span>
            <span>{primaryTf.commentRate}% comments</span>
          </div>
        </div>

        {/* KPI 4: Audience Sentiment Net Score */}
        <div className="p-5 border-t-3 border-t-[#10B981]">
          <div className={`text-xs ${mutedTextClass} flex items-center justify-between`}>
            <span className="font-medium">Net Audience Sentiment</span>
            <span className={`font-mono tabular-nums font-medium ${positiveTextClass}`}>{primaryTf.sentimentPositive}% positive</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-mono font-semibold tabular-nums tracking-tight">
              +{primaryTf.netSentimentScore}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold tabular-nums ${
                sentVsCohortDiff >= 0 ? positiveTextClass : dangerTextClass
              }`}
            >
              {sentVsCohortDiff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {sentVsCohortDiff >= 0
                ? `+${sentVsCohortDiff.toFixed(0)} pts`
                : `${sentVsCohortDiff.toFixed(0)} pts`}{' '}
              vs peers
            </span>
          </div>
          <div className={`mt-2 text-xs ${dimTextClass} flex items-center gap-1.5 font-mono tabular-nums`}>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {primaryTf.sentimentPositive}% pos
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {primaryTf.sentimentFriction}% friction
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Visual Anchor: Multi-Series Velocity Chart (65%) + 6-Axis Radar (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Multi-Series Telemetry Trajectory */}
        <div className={`lg:col-span-8 border rounded-lg p-5 flex flex-col justify-between ${surfaceClass}`}>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-inherit">
              <div>
                <h2 className="text-base font-display font-semibold">
                  Multi-Channel Trajectory Comparison ({timeframe})
                </h2>
                <p className={`text-xs ${mutedTextClass} mt-0.5`}>
                  Hover any interval node to inspect synchronized channel telemetry across the cohort
                </p>
              </div>

              {/* Segmented Metric Selector */}
              <div
                className={`inline-flex items-center p-1 rounded-md border ${
                  isDark ? 'bg-[#0A0B0E] border-[#1F242D]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  onClick={() => setSeriesMetric('velocity')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    seriesMetric === 'velocity'
                      ? isDark
                        ? 'bg-[#1F242D] text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : mutedTextClass
                  }`}
                >
                  View Velocity (K/day)
                </button>
                <button
                  onClick={() => setSeriesMetric('engagement')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    seriesMetric === 'engagement'
                      ? isDark
                        ? 'bg-[#1F242D] text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : mutedTextClass
                  }`}
                >
                  Engagement Rate (%)
                </button>
                <button
                  onClick={() => setSeriesMetric('sentiment')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    seriesMetric === 'sentiment'
                      ? isDark
                        ? 'bg-[#1F242D] text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : mutedTextClass
                  }`}
                >
                  Positive Sentiment (%)
                </button>
              </div>
            </div>

            {/* Interactive Readout Bar for Hovered / Latest Date */}
            <div className={`py-3 px-3.5 my-3 rounded-md flex flex-wrap items-center justify-between gap-3 ${subtleBgClass}`}>
              <div className="flex items-center gap-2 text-xs">
                <span className={mutedTextClass}>Interval:</span>
                <span className="font-mono font-semibold tabular-nums">
                  {dates[activeStepIndex]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {activeCohort.map((ch) => {
                  const vals = getSeriesValues(ch);
                  const val = vals[activeStepIndex] ?? vals[vals.length - 1];
                  const unit =
                    seriesMetric === 'velocity'
                      ? 'K/day'
                      : '%';
                  return (
                    <div key={ch.id} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: ch.colorHex }}
                      />
                      <span className={ch.id === primaryChannel.id ? 'font-semibold' : mutedTextClass}>
                        {ch.name}:
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {val}
                        {unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SVG Multi-Series Chart */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-64 select-none"
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Horizontal Reference Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
                  const y = padTop + step * plotH;
                  const labelVal = maxVal - step * valSpan;
                  return (
                    <g key={i}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke={isDark ? '#1F242D' : '#E2E8F0'}
                        strokeDasharray={step === 1 ? undefined : '3 3'}
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-[#6B7280]"
                      >
                        {seriesMetric === 'engagement'
                          ? labelVal.toFixed(1)
                          : Math.round(labelVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Active Hover Vertical Crosshair */}
                <line
                  x1={xForIndex(activeStepIndex)}
                  y1={padTop}
                  x2={xForIndex(activeStepIndex)}
                  y2={padTop + plotH}
                  stroke={isDark ? '#374151' : '#CBD5E1'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Channel Trajectories */}
                {activeCohort.map((ch) => {
                  const vals = getSeriesValues(ch);
                  const isPrimary = ch.id === primaryChannel.id;
                  const points = vals
                    .map((v, idx) => `${xForIndex(idx)},${yForValue(v)}`)
                    .join(' ');

                  return (
                    <g key={ch.id}>
                      <polyline
                        fill="none"
                        stroke={ch.colorHex}
                        strokeWidth={isPrimary ? '2.75' : '1.75'}
                        strokeOpacity={isPrimary ? '1' : '0.85'}
                        points={points}
                      />
                      {vals.map((v, idx) => (
                        <circle
                          key={idx}
                          cx={xForIndex(idx)}
                          cy={yForValue(v)}
                          r={idx === activeStepIndex ? 4.5 : isPrimary ? 3 : 2.2}
                          fill={ch.colorHex}
                          stroke={isDark ? '#111318' : '#FFFFFF'}
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  );
                })}

                {/* X-Axis Labels + Invisible Hover Columns */}
                {dates.map((d, idx) => {
                  const x = xForIndex(idx);
                  const colW = plotW / dates.length;
                  return (
                    <g key={d}>
                      <text
                        x={x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          idx === activeStepIndex
                            ? isDark
                              ? 'fill-white font-semibold'
                              : 'fill-slate-900 font-semibold'
                            : 'fill-[#6B7280]'
                        }`}
                      >
                        {d}
                      </text>
                      <rect
                        x={x - colW / 2}
                        y={padTop}
                        width={colW}
                        height={plotH}
                        fill="transparent"
                        className="cursor-crosshair"
                        onMouseEnter={() => setHoverIndex(idx)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Bottom Legend & Insight Strip */}
          <div className={`pt-3 border-t ${borderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${mutedTextClass}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF334B] shrink-0" />
              <span>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{primaryChannel.name}</strong> ranks{' '}
                <strong className="font-mono tabular-nums text-indigo-600">
                  #{activeCohort
                    .slice()
                    .sort(
                      (a, b) =>
                        b.timeframes[timeframe].engagementRate -
                        a.timeframes[timeframe].engagementRate
                    )
                    .findIndex((c) => c.id === primaryChannel.id) + 1}
                </strong>{' '}
                in cohort engagement depth and{' '}
                <strong className={`font-mono tabular-nums ${positiveTextClass}`}>
                  #{activeCohort
                    .slice()
                    .sort(
                      (a, b) =>
                        b.timeframes[timeframe].netSentimentScore -
                        a.timeframes[timeframe].netSentimentScore
                    )
                    .findIndex((c) => c.id === primaryChannel.id) + 1}
                </strong>{' '}
                in net audience sentiment.
              </span>
            </div>
            <button
              onClick={onJumpToCompetitorRadar}
              className="text-xs font-semibold text-indigo-600 hover:underline whitespace-nowrap cursor-pointer"
            >
              View Content Gaps →
            </button>
          </div>
        </div>

        {/* Right 4 Columns: 6-Axis Normalized Competitive Radar */}
        <div className={`lg:col-span-4 border rounded-lg p-5 flex flex-col justify-between ${surfaceClass}`}>
          <div className="pb-3 border-b border-inherit">
            <h2 className="text-base font-display font-semibold">
              6-Axis Channel Fingerprint
            </h2>
            <p className={`text-xs ${mutedTextClass} mt-0.5`}>
              Normalized 0–100 percentile scores across creator dimensions
            </p>
          </div>

          {/* Radar SVG */}
          <div className="my-2 flex items-center justify-center">
            <svg viewBox="0 0 270 270" className="w-full max-w-[265px] h-auto select-none">
              {/* Concentric Hexagonal Rings */}
              {[25, 50, 75, 100].map((level) => {
                const ringPoints = radarAxes
                  .map((_, idx) => {
                    const pt = getRadarPoint(idx, level);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={level}
                    points={ringPoints}
                    fill="none"
                    stroke={isDark ? '#1F242D' : '#E2E8F0'}
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis Spokes & Labels */}
              {radarAxes.map((axis, idx) => {
                const outerPt = getRadarPoint(idx, 100);
                const labelPt = getRadarPoint(idx, 120);
                return (
                  <g key={axis.key}>
                    <line
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={outerPt.x}
                      y2={outerPt.y}
                      stroke={isDark ? '#1F242D' : '#E2E8F0'}
                      strokeWidth="1"
                    />
                    <text
                      x={labelPt.x}
                      y={labelPt.y + 3}
                      textAnchor="middle"
                      className="text-[9.5px] font-medium fill-[#9CA3AF]"
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              })}

              {/* Polygons for Compared Channels */}
              {activeCohort
                .slice()
                .reverse()
                .map((ch) => {
                  const isPrimary = ch.id === primaryChannel.id;
                  const polyPoints = radarAxes
                    .map((axis, idx) => {
                      const pt = getRadarPoint(idx, ch.radar[axis.key]);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(' ');
                  return (
                    <g key={ch.id}>
                      <polygon
                        points={polyPoints}
                        fill={ch.colorHex}
                        fillOpacity={isPrimary ? '0.20' : '0.07'}
                        stroke={ch.colorHex}
                        strokeWidth={isPrimary ? '2.2' : '1.4'}
                      />
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Tabular Axis Score Comparison */}
          <div className={`pt-3 border-t ${borderClass} space-y-2`}>
            {radarAxes.map((axis) => {
              const primaryScore = primaryChannel.radar[axis.key];
              const topComp = comparedChannels.reduce(
                (best, c) =>
                  c.radar[axis.key] > best ? c.radar[axis.key] : best,
                0
              );
              const diff = primaryScore - topComp;
              return (
                <div
                  key={axis.key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className={mutedTextClass}>{axis.label}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="font-semibold">{primaryScore}/100</span>
                    <span
                      className={`w-14 text-right font-medium ${
                        diff >= 0 ? positiveTextClass : warningTextClass
                      }`}
                    >
                      {diff >= 0 ? `+${diff}` : diff} vs top
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Head-to-Head Granular Metric Matrix Table */}
      <div className={`border rounded-lg overflow-hidden ${surfaceClass}`}>
        <div className="p-5 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-display font-semibold">
              Side-by-Side Channel Telemetry Matrix ({timeframe})
            </h2>
            <p className={`text-xs ${mutedTextClass} mt-0.5`}>
              Direct numeric benchmark across velocity, retention, format mix, and sentiment polarity
            </p>
          </div>
          <div className={`text-xs ${mutedTextClass} font-mono tabular-nums`}>
            Leader highlighted per row · Baseline: {primaryChannel.name}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-xs font-medium ${borderClass} ${subtleBgClass} ${mutedTextClass}`}
              >
                <th className="py-3 px-4">Telemetry Dimension</th>
                {activeCohort.map((ch) => (
                  <th key={ch.id} className="py-3 px-4 text-right font-mono">
                    <div className="inline-flex items-center justify-end gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: ch.colorHex }}
                      />
                      <span className={isDark ? 'text-[#F3F4F6]' : 'text-slate-900'}>
                        {ch.name}
                      </span>
                    </div>
                    <div className={`text-[11px] font-normal ${dimTextClass}`}>
                      {ch.handle} {ch.id === primaryChannel.id ? '· Baseline' : `· ${ch.overlapScore}% overlap`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-[#1F242D]' : 'divide-slate-200'}`}>
              {[
                {
                  label: 'Total Subscribers',
                  sub: 'Current channel footprint',
                  getVal: (ch: ChannelProfile) => ch.subscribers,
                  fmt: (v: number) => formatCompactNumber(v)
                },
                {
                  label: `${timeframe} Subscriber Velocity`,
                  sub: 'Net subscriber growth rate',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].subGrowthPct,
                  fmt: (v: number) => `+${v.toFixed(1)}%`
                },
                {
                  label: `${timeframe} Total Views`,
                  sub: 'Aggregate long-form + shorts views',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].viewsTotal,
                  fmt: (v: number) => formatCompactNumber(v)
                },
                {
                  label: 'Average Views per Upload',
                  sub: 'Mean views per published video',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].avgViewsPerVideo,
                  fmt: (v: number) => formatCompactNumber(v)
                },
                {
                  label: 'First-24h View Velocity',
                  sub: 'Initial launch notification traction',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].first24hVelocity,
                  fmt: (v: number) => formatCompactNumber(v)
                },
                {
                  label: 'Engagement Rate',
                  sub: '(Likes + Comments) / Total Views',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].engagementRate,
                  fmt: (v: number) => `${v.toFixed(2)}%`
                },
                {
                  label: 'Average Audience Retention',
                  sub: 'Mean percentage of video watched',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].avgRetentionPct,
                  fmt: (v: number) => `${v.toFixed(1)}%`
                },
                {
                  label: 'Impressions CTR Estimate',
                  sub: 'Thumbnail & title click-through rate',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].ctrEstimate,
                  fmt: (v: number) => `${v.toFixed(1)}%`
                },
                {
                  label: 'Upload Cadence',
                  sub: 'Published videos per 30-day cycle',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].uploadsPerMonth,
                  fmt: (v: number) => `${v.toFixed(1)} / mo`
                },
                {
                  label: 'Positive Audience Sentiment',
                  sub: 'Share of praise vs total comments',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].sentimentPositive,
                  fmt: (v: number) => `${v}%`
                },
                {
                  label: 'Net Sentiment Score',
                  sub: 'Positive % minus Constructive Friction %',
                  getVal: (ch: ChannelProfile) => ch.timeframes[timeframe].netSentimentScore,
                  fmt: (v: number) => `+${v}`
                }
              ].map((row) => {
                const values = activeCohort.map((ch) => row.getVal(ch));
                const maxRowVal = Math.max(...values);

                return (
                  <tr
                    key={row.label}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-[#171A21]/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{row.label}</div>
                      <div className={`text-[11px] ${dimTextClass}`}>{row.sub}</div>
                    </td>
                    {activeCohort.map((ch) => {
                      const val = row.getVal(ch);
                      const isLeader = val === maxRowVal;
                      return (
                        <td
                          key={ch.id}
                          className="py-3 px-4 text-right font-mono tabular-nums"
                        >
                          <span
                            className={
                              isLeader
                                ? `font-semibold ${positiveTextClass}`
                                : isDark
                                  ? 'text-slate-200'
                                  : 'text-slate-800'
                            }
                          >
                            {row.fmt(val)}
                          </span>
                          {isLeader && (
                            <span className="ml-1.5 text-[10px] text-indigo-600 font-semibold">
                              · Lead
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
