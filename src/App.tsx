/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_CHANNELS,
  INITIAL_VIDEOS,
  INITIAL_CONTENT_GAPS,
  ChannelProfile,
  VideoTelemetry,
  VideoComment,
  ContentGapOpportunity,
  TimeframeKey
} from './data/youtubeTelemetryData';
import { ChannelBenchmarkView } from './components/ChannelBenchmarkView';
import { VideoSentimentView } from './components/VideoSentimentView';
import { CompetitorRadarView } from './components/CompetitorRadarView';
import { AddChannelModal } from './components/AddChannelModal';
import { UnifiedYouTubeSearchBar } from './components/UnifiedYouTubeSearchBar';
import { Plus, Sun, Moon } from 'lucide-react';

type ActiveWorkspaceTab = 'benchmark' | 'sentiment' | 'competitors';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('benchmark');
  const [timeframe, setTimeframe] = useState<TimeframeKey>('30D');
  const [isDark, setIsDark] = useState<boolean>(false);

  const [channels, setChannels] = useState<ChannelProfile[]>(INITIAL_CHANNELS);
  const [primaryChannelId, setPrimaryChannelId] = useState<string>('ch-vergecraft');
  const [comparedIds, setComparedIds] = useState<string[]>([
    'ch-framelab',
    'ch-circuittheory',
    'ch-opticpulse'
  ]);

  const [videos, setVideos] = useState<VideoTelemetry[]>(INITIAL_VIDEOS);
  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    INITIAL_VIDEOS[0].id
  );

  const [contentGaps, setContentGaps] = useState<ContentGapOpportunity[]>(
    INITIAL_CONTENT_GAPS
  );

  const [isAddChannelOpen, setIsAddChannelOpen] = useState<boolean>(false);

  // Toggle a channel in/out of the head-to-head benchmark comparison (max 4 compared)
  const handleToggleCompareChannel = (channelId: string) => {
    setComparedIds((prev) => {
      if (prev.includes(channelId)) {
        return prev.filter((id) => id !== channelId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), channelId];
      }
      return [...prev, channelId];
    });
  };

  // Switch primary baseline channel
  const handleSelectPrimaryChannel = (channelId: string) => {
    setPrimaryChannelId(channelId);
    setComparedIds((prev) => prev.filter((id) => id !== channelId));
  };

  // Add a newly resolved channel from the modal
  const handleAddChannel = (newChannel: ChannelProfile, pinToCompare: boolean) => {
    setChannels((prev) => [...prev, newChannel]);
    if (pinToCompare) {
      setComparedIds((prev) => {
        const next = prev.length >= 4 ? prev.slice(1) : prev;
        return [...next, newChannel.id];
      });
    }
  };

  // Add a newly scored viewer comment to a video and recalculate sentiment ratios
  const handleAddCommentToVideo = (videoId: string, newComment: VideoComment) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const updatedComments = [newComment, ...v.comments];
        const total = updatedComments.length;
        const pos = updatedComments.filter((c) => c.sentiment === 'positive').length;
        const fric = updatedComments.filter((c) => c.sentiment === 'friction').length;
        const posPct = Math.round((pos / total) * 100);
        const fricPct = Math.round((fric / total) * 100);
        const neuPct = Math.max(0, 100 - posPct - fricPct);

        return {
          ...v,
          commentCount: v.commentCount + 1,
          sentimentPositive: posPct,
          sentimentNeutral: neuPct,
          sentimentFriction: fricPct,
          netSentimentScore: posPct - fricPct,
          comments: updatedComments
        };
      })
    );
  };

  // Add a newly analyzed video to the catalog
  const handleAddAnalyzedVideo = (newVideo: VideoTelemetry) => {
    setVideos((prev) => [newVideo, ...prev]);
    setSelectedVideoId(newVideo.id);
  };

  // Toggle saving a competitor content gap opportunity to pipeline
  const handleToggleSaveGap = (gapId: string) => {
    setContentGaps((prev) =>
      prev.map((g) =>
        g.id === gapId ? { ...g, savedToPipeline: !g.savedToPipeline } : g
      )
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isDark
          ? 'bg-[#131B2E] text-[#F1F5F9]'
          : 'bg-gradient-to-b from-[#EEF2FF]/80 via-[#F6F8FC] to-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* Top Bar Contract: Strictly 3 Zones in a Single 56px Row */}
      <header
        className={`sticky top-0 z-30 h-14 px-6 border-b flex items-center justify-between ${
          isDark
            ? 'bg-[#192338]/95 border-[#293548] backdrop-blur-xs'
            : 'bg-white/95 border-indigo-100 shadow-2xs backdrop-blur-xs'
        }`}
      >
        {/* Zone 1: Single Text Element Wordmark */}
        <a
          href="#benchmark"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('benchmark');
          }}
          className="text-lg font-display font-bold tracking-tight whitespace-nowrap bg-gradient-to-r from-[#FF334B] via-[#E11D48] to-[#4F46E5] bg-clip-text text-transparent"
        >
          PulseFrame
        </a>

        {/* Zone 2: Clean Text Navigation Links with Subtle Hover/Active Underlines */}
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`py-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'benchmark'
                ? 'border-[#FF334B] text-[#FF334B] font-semibold'
                : isDark
                  ? 'border-transparent text-slate-300 hover:text-white'
                  : 'border-transparent text-slate-600 hover:text-indigo-600'
            }`}
          >
            Channel Benchmark
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`py-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sentiment'
                ? 'border-[#FF334B] text-[#FF334B] font-semibold'
                : isDark
                  ? 'border-transparent text-slate-300 hover:text-white'
                  : 'border-transparent text-slate-600 hover:text-indigo-600'
            }`}
          >
            Video Sentiment
          </button>
          <button
            onClick={() => setActiveTab('competitors')}
            className={`py-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'competitors'
                ? 'border-[#FF334B] text-[#FF334B] font-semibold'
                : isDark
                  ? 'border-transparent text-slate-300 hover:text-white'
                  : 'border-transparent text-slate-600 hover:text-indigo-600'
            }`}
          >
            Competitor Radar
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions (Timeframe Selector + Track Channel CTA) */}
        <div className="flex items-center gap-2.5">
          <div
            className={`hidden sm:inline-flex items-center p-0.5 rounded-md border font-mono text-xs ${
              isDark
                ? 'bg-[#131B2E] border-[#293548]'
                : 'bg-indigo-50/80 border-indigo-100'
            }`}
          >
            {(['30D', '90D', '12M'] as TimeframeKey[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  timeframe === tf
                    ? isDark
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : 'bg-white text-indigo-700 font-semibold shadow-2xs'
                    : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddChannelOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-[#FF334B] to-[#E11D48] text-white hover:from-[#e02438] hover:to-[#be123c] shadow-2xs transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Channel</span>
          </button>

          <button
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle color theme"
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isDark
                ? 'border-[#293548] bg-[#192338] text-amber-300 hover:text-amber-200'
                : 'border-indigo-100 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <UnifiedYouTubeSearchBar
          channels={channels}
          videos={videos}
          primaryChannelId={primaryChannelId}
          comparedIds={comparedIds}
          onSelectPrimaryChannel={handleSelectPrimaryChannel}
          onToggleCompareChannel={handleToggleCompareChannel}
          onSelectVideoForSentiment={(vidId) => setSelectedVideoId(vidId)}
          onAddResolvedChannel={(newChannel, makePrimary) => {
            setChannels((prev) => [...prev, newChannel]);
            if (makePrimary) {
              setPrimaryChannelId(newChannel.id);
            } else {
              setComparedIds((prev) => {
                const next = prev.length >= 4 ? prev.slice(1) : prev;
                return [...next, newChannel.id];
              });
            }
          }}
          onAddResolvedVideo={handleAddAnalyzedVideo}
          onNavigateTab={(tab) => setActiveTab(tab)}
          isDark={isDark}
        />

        {activeTab === 'benchmark' && (
          <ChannelBenchmarkView
            channels={channels}
            primaryChannelId={primaryChannelId}
            onSelectPrimaryChannel={handleSelectPrimaryChannel}
            comparedIds={comparedIds}
            onToggleCompareChannel={handleToggleCompareChannel}
            timeframe={timeframe}
            onOpenAddChannel={() => setIsAddChannelOpen(true)}
            onJumpToVideoSentiment={() => setActiveTab('sentiment')}
            onJumpToCompetitorRadar={() => setActiveTab('competitors')}
            isDark={isDark}
          />
        )}

        {activeTab === 'sentiment' && (
          <VideoSentimentView
            videos={videos}
            selectedVideoId={selectedVideoId}
            onSelectVideo={setSelectedVideoId}
            onAddCommentToVideo={handleAddCommentToVideo}
            onAddAnalyzedVideo={handleAddAnalyzedVideo}
            isDark={isDark}
          />
        )}

        {activeTab === 'competitors' && (
          <CompetitorRadarView
            channels={channels}
            primaryChannelId={primaryChannelId}
            comparedIds={comparedIds}
            onToggleCompareChannel={handleToggleCompareChannel}
            timeframe={timeframe}
            contentGaps={contentGaps}
            onToggleSaveGap={handleToggleSaveGap}
            onOpenAddChannel={() => setIsAddChannelOpen(true)}
            onJumpToBenchmark={() => setActiveTab('benchmark')}
            isDark={isDark}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer
        className={`border-t px-6 py-4 text-xs ${
          isDark
            ? 'border-[#1F242D] text-[#6B7280]'
            : 'border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PulseFrame Creator Intelligence · Channel Benchmarking, Video Sentiment & Competitor Telemetry
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('benchmark')}
              className="hover:underline cursor-pointer"
            >
              Channel Benchmark
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('sentiment')}
              className="hover:underline cursor-pointer"
            >
              Video Sentiment
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('competitors')}
              className="hover:underline cursor-pointer"
            >
              Competitor Radar
            </button>
          </div>
        </div>
      </footer>

      {/* Modal to Add/Resolve a New YouTube Channel or Competitor */}
      <AddChannelModal
        isOpen={isAddChannelOpen}
        onClose={() => setIsAddChannelOpen(false)}
        onAddChannel={handleAddChannel}
        isDark={isDark}
      />
    </div>
  );
}
