import React, { useState } from 'react';
import { ChannelProfile } from '../data/youtubeTelemetryData';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: ChannelProfile, pinToCompare: boolean) => void;
  isDark: boolean;
}

const CHANNEL_COLORS = ['#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
  isDark
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Hardware & Tech');
  const [pinToCompare, setPinToCompare] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/youtube/resolve-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, category })
      });

      if (!response.ok) {
        throw new Error('Could not resolve channel telemetry.');
      }

      const data = await response.json();
      const ch = data.channel;
      const colorHex =
        CHANNEL_COLORS[Math.floor(Math.random() * CHANNEL_COLORS.length)];

      const baseVel = Math.round(ch.views30d / 30000);
      const baseEng = ch.engagementRate;
      const baseSent = ch.sentimentPositive;

      const newProfile: ChannelProfile = {
        id: `ch-custom-${Date.now()}`,
        name: ch.name,
        handle: ch.handle,
        category: ch.category,
        colorHex,
        subscribers: ch.subscribers,
        overlapScore: ch.overlapScore,
        sharedKeywords: ch.sharedKeywords,
        recentBreakoutTitle: ch.recentBreakoutTitle,
        recentBreakoutViews: Math.round(ch.avgViewsPerVideo * ch.recentBreakoutMultiplier),
        recentBreakoutMultiplier: ch.recentBreakoutMultiplier,
        recentBreakoutPublished: '5 days ago',
        radar: ch.radar,
        timeframes: {
          '30D': {
            subscribersDelta: Math.round((ch.subscribers * ch.subGrowth30d) / 100),
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
            medianWatchMinutes: 10.2,
            ctrEstimate: ch.ctrEstimate,
            shortsSharePct: 16,
            sentimentPositive: ch.sentimentPositive,
            sentimentNeutral: ch.sentimentNeutral,
            sentimentFriction: ch.sentimentFriction,
            netSentimentScore: ch.netSentimentScore,
            seriesDates: ['Sep 08', 'Sep 12', 'Sep 16', 'Sep 20', 'Sep 24', 'Sep 28', 'Oct 02', 'Oct 05'],
            viewVelocitySeries: [
              Math.max(20, baseVel - 22),
              Math.max(22, baseVel - 16),
              Math.max(25, baseVel - 12),
              Math.max(28, baseVel - 5),
              baseVel,
              baseVel + 8,
              baseVel + 14,
              baseVel + 21
            ],
            engagementSeries: [
              Number((baseEng - 0.3).toFixed(1)),
              Number((baseEng - 0.2).toFixed(1)),
              Number((baseEng - 0.1).toFixed(1)),
              Number(baseEng.toFixed(1)),
              Number((baseEng + 0.1).toFixed(1)),
              Number((baseEng + 0.2).toFixed(1)),
              Number((baseEng + 0.1).toFixed(1)),
              Number((baseEng + 0.3).toFixed(1))
            ],
            sentimentSeries: [
              baseSent - 3,
              baseSent - 2,
              baseSent - 1,
              baseSent,
              baseSent + 1,
              baseSent,
              baseSent + 2,
              baseSent + 2
            ]
          },
          '90D': {
            subscribersDelta: Math.round((ch.subscribers * ch.subGrowth30d * 2.8) / 100),
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
            medianWatchMinutes: 10.0,
            ctrEstimate: ch.ctrEstimate,
            shortsSharePct: 18,
            sentimentPositive: ch.sentimentPositive,
            sentimentNeutral: ch.sentimentNeutral,
            sentimentFriction: ch.sentimentFriction,
            netSentimentScore: ch.netSentimentScore,
            seriesDates: ['Jul 15', 'Jul 27', 'Aug 08', 'Aug 20', 'Sep 01', 'Sep 13', 'Sep 25', 'Oct 05'],
            viewVelocitySeries: [
              Math.max(18, baseVel - 28),
              Math.max(20, baseVel - 20),
              Math.max(24, baseVel - 14),
              Math.max(26, baseVel - 8),
              baseVel,
              baseVel + 6,
              baseVel + 12,
              baseVel + 21
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
              baseSent - 4,
              baseSent - 3,
              baseSent - 2,
              baseSent - 1,
              baseSent,
              baseSent + 1,
              baseSent + 1,
              baseSent + 2
            ]
          },
          '12M': {
            subscribersDelta: Math.round((ch.subscribers * ch.subGrowth30d * 10.5) / 100),
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
            medianWatchMinutes: 9.8,
            ctrEstimate: ch.ctrEstimate,
            shortsSharePct: 18,
            sentimentPositive: ch.sentimentPositive,
            sentimentNeutral: ch.sentimentNeutral,
            sentimentFriction: ch.sentimentFriction,
            netSentimentScore: ch.netSentimentScore,
            seriesDates: ['Nov', 'Dec', 'Jan', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct'],
            viewVelocitySeries: [
              Math.max(15, baseVel - 35),
              Math.max(18, baseVel - 26),
              Math.max(22, baseVel - 18),
              Math.max(25, baseVel - 10),
              baseVel - 2,
              baseVel + 5,
              baseVel + 12,
              baseVel + 21
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
              baseSent - 5,
              baseSent - 4,
              baseSent - 3,
              baseSent - 2,
              baseSent - 1,
              baseSent,
              baseSent + 1,
              baseSent + 2
            ]
          }
        }
      };

      onAddChannel(newProfile, pinToCompare);
      setQuery('');
      onClose();
    } catch {
      setErrorMsg('Unable to resolve channel right now. Please check the handle or URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-lg rounded-lg border p-6 space-y-5 shadow-xl ${
          isDark
            ? 'bg-[#192338] border-[#293548] text-white'
            : 'bg-white border-indigo-100 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-inherit">
          <div>
            <h2 className="text-lg font-display font-bold">
              Track YouTube Channel or Competitor
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#9CA3AF]' : 'text-slate-500'}`}>
              Enter a YouTube @handle, channel URL, or creator name to index their velocity and sentiment
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium">
              YouTube Channel Handle, URL, or Name
            </label>
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. @mkbhd, https://youtube.com/@dave2d, or Gerald Undone"
              className={`w-full px-3.5 py-2 text-xs rounded-md border focus:outline-none focus:ring-1 focus:ring-[#FF2E43] ${
                isDark
                  ? 'bg-[#0A0B0E] border-[#262C36] text-[#F3F4F6]'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Quick-Select Real Tech Creator Handles */}
          <div className="space-y-1.5">
            <span className={`block text-[11px] ${isDark ? 'text-[#9CA3AF]' : 'text-slate-500'}`}>
              Quick-fill popular benchmark channels:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '@mkbhd', cat: 'Consumer Tech & Flagships' },
                { label: '@dave2d', cat: 'Laptops & Silicon' },
                { label: '@geraldundone', cat: 'Camera Lab & Optics' },
                { label: '@gamersnexus', cat: 'Thermal & Hardware Engineering' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setQuery(preset.label);
                    setCategory(preset.cat);
                  }}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#262C36] bg-[#171A21] text-[#9CA3AF] hover:text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium">Primary Vertical / Niche</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-md border focus:outline-none ${
                isDark
                  ? 'bg-[#0A0B0E] border-[#262C36] text-[#F3F4F6]'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="Camera Systems & Optics">Camera Systems & Optics</option>
              <option value="Silicon & Compute Architecture">Silicon & Compute Architecture</option>
              <option value="Consumer Tech & Flagships">Consumer Tech & Flagships</option>
              <option value="Thermal & Hardware Engineering">Thermal & Hardware Engineering</option>
              <option value="Display Calibration & OLED Telemetry">Display Calibration & OLED Telemetry</option>
              <option value="Studio Audio & Acoustic Engineering">Studio Audio & Acoustic Engineering</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={pinToCompare}
              onChange={(e) => setPinToCompare(e.target.checked)}
              className="rounded accent-[#FF2E43]"
            />
            <span>Immediately pin this channel into active head-to-head Benchmark comparison</span>
          </label>

          {errorMsg && (
            <div className="text-xs text-rose-400">{errorMsg}</div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 text-xs font-medium rounded-md border cursor-pointer ${
                isDark
                  ? 'border-[#262C36] text-[#9CA3AF] hover:text-white'
                  : 'border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[#FF2E43] text-white hover:bg-[#e02438] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Resolving Telemetry...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Index & Track Channel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
