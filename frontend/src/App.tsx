import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Overview } from './pages/Overview';
import { UrlInvestigation } from './pages/UrlInvestigation';
import { AttackGraphView } from './pages/AttackGraphView';
import { BrandImpersonationView } from './pages/BrandImpersonationView';
import { ThreatIntelView } from './pages/ThreatIntelView';
import { ScanHistoryView } from './pages/ScanHistoryView';
import { WhatIfSimulatorView } from './pages/WhatIfSimulatorView';
import { ReportsView } from './pages/ReportsView';
import { TakedownDispatcher } from './pages/TakedownDispatcher';
import { AdminPortal } from './pages/AdminPortal';
import { FeedbackView } from './pages/FeedbackView';
import { SettingsView } from './pages/SettingsView';
import { ScanResponse, SampleUrl, UserSession } from './types';
import { api } from './services/api';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('investigate');
  const [currentScan, setCurrentScan] = useState<ScanResponse | null>(null);
  const [samples, setSamples] = useState<SampleUrl[]>([]);

  useEffect(() => {
    // Clear any previous persistent session on initial mount so starting page is always this login page
    localStorage.removeItem('px_session');
    setViewMode('landing');

    // Fetch initial sample benchmark dataset
    api.getSampleDataset()
      .then(setSamples)
      .catch(console.error);

    // Fetch most recent scan to populate initial active state
    api.listScans()
      .then(res => {
        if (res.scans && res.scans.length > 0) {
          api.getScan(res.scans[0].scan_id)
            .then(setCurrentScan)
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, []);

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('px_session', JSON.stringify(session));
    setViewMode('app');
    setCurrentTab('investigate');
  };

  const handleExploreGuest = () => {
    const guestSession: UserSession = {
      email: 'guest.analyst@phantomx.preview',
      displayName: 'Guest Threat Investigator',
      role: 'ANALYST',
      clearanceLevel: 'LEVEL-1 PREVIEW (READ-ONLY)',
      badgeId: 'GUEST-001',
      authenticatedAt: new Date().toISOString()
    };
    setUserSession(guestSession);
    setViewMode('app');
    setCurrentTab('investigate');
  };

  const handleSignOut = () => {
    setUserSession(null);
    localStorage.removeItem('px_session');
    setViewMode('landing');
  };

  const handleSelectScan = async (scanId: string) => {
    try {
      const scan = await api.getScan(scanId);
      setCurrentScan(scan);
      setCurrentTab('investigate');
    } catch (e) {
      console.error(e);
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'overview':
        return { title: 'Security Command Overview' };
      case 'investigate':
        return { title: 'User Investigation Console' };
      case 'graph':
        return { title: 'Attack DNA Graph Topology', subtitle: 'Synthesized relationship nodes and edges' };
      case 'brand':
        return { title: 'Brand Impersonation Radar', subtitle: 'Homoglyph & typosquatting detection' };
      case 'intel':
        return { title: 'Threat Intelligence Providers', subtitle: 'Reputation lookups and telemetry feeds' };
      case 'history':
        return { title: 'Digital Evidence Vault', subtitle: 'Persisted scan history and cryptographic hashes' };
      case 'simulator':
        return { title: 'What-If Defense Simulator', subtitle: 'Hypothetical risk scenario sandbox' };
      case 'reports':
        return { title: 'Forensic Reports & Verification' };
      case 'takedown':
        return { title: 'Takedown Playbooks & Remediation', subtitle: 'Automated ICANN RAA 3.18 registrar & CERT cease-and-desist dispatcher' };
      case 'admin':
        return { title: 'SOC Admin Command Console', subtitle: 'Global quarantine, team RBAC, and incident governance' };
      case 'feedback':
        return { title: 'User Feedback & QA Portal' };
      case 'settings':
        return { title: 'Settings & Security Controls' };
      default:
        return { title: 'PHANTOM X', subtitle: 'Autonomous Cyber Defense' };
    }
  };

  const handleScanFromLanding = async (url: string) => {
    handleExploreGuest();
    try {
      const scan = await api.createScan(url);
      setCurrentScan(scan);
      setCurrentTab('investigate');
    } catch (e) {
      console.error('Scan error from landing:', e);
    }
  };

  // If in landing page view mode, display the full Public Landing Page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onLogin={handleLogin}
        onExploreGuest={handleExploreGuest}
        onScanUrl={handleScanFromLanding}
      />
    );
  }

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Persistent Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeScanId={currentScan?.scan_id}
        userSession={userSession}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={title}
          userSession={userSession}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-y-auto bg-slate-100/60">
          {currentTab === 'overview' && (
            <Overview
              onSelectScan={handleSelectScan}
              onNavigateInvestigate={() => setCurrentTab('investigate')}
            />
          )}

          {currentTab === 'investigate' && (
            <UrlInvestigation
              currentScan={currentScan}
              setCurrentScan={setCurrentScan}
              samples={samples}
              userSession={userSession}
              onNavigateTakedown={() => setCurrentTab('takedown')}
              onNavigateAdmin={() => setCurrentTab('admin')}
            />
          )}

          {currentTab === 'graph' && (
            <AttackGraphView
              currentScan={currentScan}
              onNavigateInvestigate={() => setCurrentTab('investigate')}
            />
          )}

          {currentTab === 'brand' && (
            <BrandImpersonationView
              currentScan={currentScan}
              onScanUrl={(url) => {
                setCurrentTab('investigate');
              }}
            />
          )}

          {currentTab === 'intel' && (
            <ThreatIntelView currentScan={currentScan} />
          )}

          {currentTab === 'history' && (
            <ScanHistoryView onSelectScan={handleSelectScan} />
          )}

          {currentTab === 'simulator' && (
            <WhatIfSimulatorView />
          )}

          {currentTab === 'reports' && (
            <ReportsView currentScan={currentScan} />
          )}

          {currentTab === 'takedown' && (
            <TakedownDispatcher
              currentScan={currentScan}
              userSession={userSession}
              onNavigateInvestigate={() => setCurrentTab('investigate')}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPortal
              userSession={userSession}
              onNavigateInvestigate={() => setCurrentTab('investigate')}
            />
          )}

          {currentTab === 'feedback' && (
            <FeedbackView userSession={userSession} currentScan={currentScan} />
          )}

          {currentTab === 'settings' && (
            <SettingsView userSession={userSession} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
