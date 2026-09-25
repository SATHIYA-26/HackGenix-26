'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DataSourcePopover from '@/components/DataSourcePopover';
import TopReasonsCard from '@/components/TopReasonsCard';
import KeyInsightsCard from '@/components/KeyInsightsCard';
import RevenueImpactCard from '@/components/RevenueImpactCard';
import SentimentHealthCard from '@/components/SentimentHealthCard';
import EvidenceDrawer from '@/components/EvidenceDrawer';
import AiResponseModal from '@/components/AiResponseModal';
import ProblemDiscoveryView from '@/components/ProblemDiscoveryView';
import IntegrationsView from '@/components/IntegrationsView';
import { problemClustersData, sourcesData } from '@/lib/data';
import { ProblemCluster, FeedbackSource } from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSources, setSelectedSources] = useState<FeedbackSource[]>(
    sourcesData.map((s) => s.id)
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(true); // Open initially to showcase the Chattermill screenshot feature!
  const [showCalloutBubble, setShowCalloutBubble] = useState(true);
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // Selected cluster for drilldown and evidence inspection
  const [selectedCluster, setSelectedCluster] = useState<ProblemCluster>(problemClustersData[0]);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  // AI Response generator modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [modalCluster, setModalCluster] = useState<ProblemCluster | null>(problemClustersData[0]);
  const [modalInitialQuote, setModalInitialQuote] = useState<string | undefined>(undefined);

  // Toggle single source
  const handleToggleSource = (id: FeedbackSource) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllSources = () => {
    setSelectedSources(sourcesData.map((s) => s.id));
  };

  const handleClearAllSources = () => {
    setSelectedSources([]);
  };

  const handleOpenEvidence = (cluster: ProblemCluster) => {
    setSelectedCluster(cluster);
    setIsEvidenceOpen(true);
  };

  const handleOpenAiGenerator = (cluster?: ProblemCluster, quote?: string) => {
    setModalCluster(cluster || selectedCluster || problemClustersData[0]);
    setModalInitialQuote(quote);
    setIsAiModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#edf2f7] text-[#1e293b]">
      {/* 1. Left Vertical Slim Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={3}
      />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          title="Trending Negativity Drivers Dashboard"
          selectedSourcesCount={selectedSources.length}
          totalSourcesCount={sourcesData.length}
          isPopoverOpen={isPopoverOpen}
          setIsPopoverOpen={setIsPopoverOpen}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onSave={() => alert('Dashboard state saved successfully!')}
          onOpenAiGenerator={() => handleOpenAiGenerator(selectedCluster)}
        />

        {/* Content Container */}
        <main className="flex-1 p-6 relative">
          {/* Data Source Popover & Signature Chattermill Electric-Blue Callout Bubble */}
          <DataSourcePopover
            isOpen={isPopoverOpen}
            onClose={() => setIsPopoverOpen(false)}
            selectedSources={selectedSources}
            toggleSource={handleToggleSource}
            selectAllSources={handleSelectAllSources}
            clearAllSources={handleClearAllSources}
            showCalloutBubble={showCalloutBubble}
            dismissCalloutBubble={() => setShowCalloutBubble(false)}
          />

          {/* Tab 1: Primary Overview Dashboard (Chattermill 4-card Layout) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Row 1: Top Reasons for Negativity & Key Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopReasonsCard
                  clusters={problemClustersData}
                  selectedClusterId={selectedCluster?.id || null}
                  onSelectCluster={(cluster) => setSelectedCluster(cluster)}
                  onOpenEvidence={handleOpenEvidence}
                />

                <KeyInsightsCard
                  selectedCluster={selectedCluster}
                  onOpenEvidence={handleOpenEvidence}
                  onOpenAiGenerator={handleOpenAiGenerator}
                />
              </div>

              {/* Row 2: Revenue Impact & NPS Sentiment Score */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueImpactCard
                  onSelectClusterByLabel={(label) => {
                    const match = problemClustersData.find((c) =>
                      c.title.toLowerCase().includes(label.toLowerCase().slice(0, 4))
                    );
                    if (match) handleOpenEvidence(match);
                  }}
                />

                <SentimentHealthCard
                  onOpenDetails={() => handleOpenEvidence(selectedCluster)}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Problem Discovery & BERTopic Clusters */}
          {(activeTab === 'clusters' || activeTab === 'priority' || activeTab === 'revenue') && (
            <ProblemDiscoveryView
              clusters={problemClustersData}
              onOpenEvidence={handleOpenEvidence}
              onOpenAiGenerator={handleOpenAiGenerator}
            />
          )}

          {/* Tab 3: Connectors & Pipeline Health */}
          {activeTab === 'integrations' && <IntegrationsView />}

          {/* Tab 4: AI Insights View */}
          {activeTab === 'insights' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <KeyInsightsCard
                selectedCluster={selectedCluster}
                onOpenEvidence={handleOpenEvidence}
                onOpenAiGenerator={handleOpenAiGenerator}
              />
              <ProblemDiscoveryView
                clusters={problemClustersData}
                onOpenEvidence={handleOpenEvidence}
                onOpenAiGenerator={handleOpenAiGenerator}
              />
            </div>
          )}

          {/* Tab 5: Sentiment Drivers */}
          {activeTab === 'drivers' && (
            <div className="space-y-6">
              <TopReasonsCard
                clusters={problemClustersData}
                selectedClusterId={selectedCluster?.id || null}
                onSelectCluster={(cluster) => setSelectedCluster(cluster)}
                onOpenEvidence={handleOpenEvidence}
              />
              <SentimentHealthCard
                onOpenDetails={() => handleOpenEvidence(selectedCluster)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Traceable Evidence Drawer (Slides from Right) */}
      <EvidenceDrawer
        cluster={selectedCluster}
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        onOpenAiGenerator={(cluster, quote) => handleOpenAiGenerator(cluster, quote)}
      />

      {/* AI Customer Response Generator Modal */}
      <AiResponseModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        cluster={modalCluster}
        initialQuote={modalInitialQuote}
      />
    </div>
  );
}
