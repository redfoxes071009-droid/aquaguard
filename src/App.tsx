/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_MISSIONS, 
  INITIAL_SPECIES_LOGS, 
  MAP_STATIONS 
} from './data';
import { WaterMetrics, Mission, SpeciesLog } from './types';

// Subcomponents
import DashboardView from './components/DashboardView';
import InteractiveMap from './components/InteractiveMap';
import MissionsView from './components/MissionsView';
import LogView from './components/LogView';

// Icons
import { 
  Waves, LayoutDashboard, Compass, Star, LogOut, Info, AlertTriangle, CheckCircle, Navigation,
  Menu, X, Heart, ShieldAlert, CheckCircle2, MonitorDot
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [tab, setTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    if (urlTab && ['dashboard', 'monitor', 'missions', 'log'].includes(urlTab)) {
      return urlTab;
    }
    const hasStation = params.has('station') || params.has('sector');
    if (hasStation) {
      return 'monitor';
    }
    return 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global shared dynamic metrics with query parameter parsing for deep-linking
  const [metrics, setMetrics] = useState<WaterMetrics>(() => {
    const params = new URLSearchParams(window.location.search);
    const depth = params.get('depth') ? parseFloat(params.get('depth')!) : 450.2;
    const salinity = params.get('salinity') ? parseFloat(params.get('salinity')!) : 34.8;
    const oxygen = params.get('oxygen') ? parseFloat(params.get('oxygen')!) : 96.4;
    const temperature = params.get('temperature') ? parseFloat(params.get('temperature')!) : 18.5;
    return {
      depth,
      salinity,
      oxygen,
      temperature,
      oxygenStatus: oxygen < 93 ? 'warning' : 'stable',
    };
  });

  // Dynamic shared arrays
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [speciesLogs, setSpeciesLogs] = useState<SpeciesLog[]>(INITIAL_SPECIES_LOGS);

  // Highlighting specific Map stations on alert trigger
  const [mapHighlightSector, setMapHighlightSector] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('station') || params.get('sector') || '';
  });

  // Alerts states
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'warn' }[]>([]);

  const addNotification = (message: string, type: 'success' | 'warn' = 'success') => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleUpdateMetrics = (newMetrics: WaterMetrics) => {
    setMetrics(newMetrics);
    
    // Trigger notification if oxygen falls critical below 93%
    if (newMetrics.oxygen < 93 && metrics.oxygen >= 93) {
      addNotification('AQUAGUARD 경고: 산소 포화도가 기준치(93%) 이하로 저하되었습니다!', 'warn');
    } else if (newMetrics.oxygen >= 93 && metrics.oxygen < 93) {
      addNotification('산소 포화도가 안정권(93% 이상) 내로 회수되었습니다.', 'success');
    }
  };

  const handleAddMission = (newMission: Mission) => {
    setMissions(prev => [newMission, ...prev]);
    addNotification(`새 해양 미션 '${newMission.name}'이 등록 완료되었습니다!`);
  };

  const handleUpdateMissionProgress = (id: string, progress: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, progress } : m));
  };

  const handleAddSpeciesLog = (newLog: SpeciesLog) => {
    setSpeciesLogs(prev => [newLog, ...prev]);
    addNotification(`해양 도감에 '${newLog.name}'(이)가 신규 등재되었습니다!`);
  };

  const handleTriggerSectorAlert = (sector: string) => {
    setMapHighlightSector(sector);
    setTab('monitor');
    addNotification(`경계 구역: ${sector} 연동 지도를 표시합니다.`, 'warn');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#00f5d4]/30 selection:text-white">
      
      {/* Dynamic system custom toast alerts overlay */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-4 rounded-xl border shadow-2xl flex gap-3 backdrop-blur-md pointer-events-auto ${
                n.type === 'warn' 
                  ? 'bg-rose-950/90 border-[#f87171]/40 text-rose-200' 
                  : 'bg-slate-900/95 border-primary-container/30 text-slate-200'
              }`}
            >
              {n.type === 'warn' ? (
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle className="w-5 h-5 shrink-0 text-[#00f5d4]" />
              )}
              <span className="text-xs font-medium font-sans leading-relaxed">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-outline-variant/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#00bbf9] to-[#00f5d4] flex items-center justify-center text-slate-950 font-extrabold focus:outline-none select-none">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-display font-extrabold tracking-tight text-lg text-slate-100">AquaGuard</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-[#00f5d4] uppercase tracking-widest font-mono select-none px-2 py-0.5 rounded-full bg-primary-container/5 border border-primary-container/20">GLOBAL HQ</span>
          </div>
        </div>

        {/* Desktop Tabs navigators */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900 border border-white/5 rounded-full p-1">
          {[
            { id: 'dashboard', label: '종합 대시보드', icon: LayoutDashboard },
            { id: 'monitor', label: '구역 수질 지도', icon: Compass },
            { id: 'missions', label: '복원 프로젝트', icon: Star },
            { id: 'log', label: '해양 생물 도감', icon: Info }
          ].map(item => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  if (item.id !== 'monitor') setMapHighlightSector('');
                }}
                className={`px-5 py-2 rounded-full text-xs font-display font-medium transition-all flex items-center gap-2 text-nowrap focus:outline-none ${
                  isActive 
                    ? 'bg-primary-container text-slate-950 font-extrabold shadow-lg shadow-primary-container/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-white/10 rounded-lg text-slate-400 focus:outline-none hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-b border-outline-variant/30 bg-slate-900/95 backdrop-blur-md px-6 py-4 flex flex-col gap-2 relative z-30"
          >
            {[
              { id: 'dashboard', label: '종합 대시보드', icon: LayoutDashboard },
              { id: 'monitor', label: '구역 수질 지도', icon: Compass },
              { id: 'missions', label: '복원 프로젝트', icon: Star },
              { id: 'log', label: '해양 생물 도감', icon: Info }
            ].map(item => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setMobileMenuOpen(false);
                    if (item.id !== 'monitor') setMapHighlightSector('');
                  }}
                  className={`w-full p-3 rounded-lg text-xs font-display font-semibold transition-all flex items-center gap-3 ${
                    isActive 
                      ? 'bg-primary-container text-slate-950' 
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body contents layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            
            {/* Dashboard View Component */}
            {tab === 'dashboard' && (
              <DashboardView 
                metrics={metrics}
                onUpdateMetrics={handleUpdateMetrics}
                onNavigate={(t) => setTab(t)}
                onShowNotification={addNotification}
              />
            )}

            {/* Comprehensive Interactive Map View Tab */}
            {tab === 'monitor' && (
              <div className="flex flex-col gap-8">
                <div>
                  <span className="font-display text-xs font-semibold text-primary-container tracking-wider uppercase block mb-2 font-bold">TOPOGRAPHIC GEOGRAPHICAL GRID</span>
                  <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-100 tracking-tight">지리 분석 맵</h1>
                  <p className="text-sm text-slate-400 font-sans mt-1">태평양 연계 각 섹터에 분산 안착된 관측 모니터링 노드의 실시간 깊이(Depth), 산소(Oxygen) 수수 상태 데이터 피드입니다.</p>
                </div>
                
                <InteractiveMap 
                  onSelectStation={(st) => {
                    setMetrics({
                      depth: st.depth,
                      salinity: st.salinity,
                      oxygen: st.oxygen,
                      temperature: st.temperature,
                      oxygenStatus: st.oxygen < 93 ? 'warning' : 'stable'
                    });
                  }}
                  highlightedSector={mapHighlightSector}
                  onClose={() => setMapHighlightSector('')}
                />
              </div>
            )}

            {/* Active Restore Missions View Tab */}
            {tab === 'missions' && (
              <MissionsView 
                missions={missions}
                onAddMission={handleAddMission}
                onUpdateProgress={handleUpdateMissionProgress}
                onNavigate={(t) => setTab(t)}
              />
            )}

            {/* Biological Taxonomy Logs View Tab */}
            {tab === 'log' && (
              <LogView 
                speciesLogs={speciesLogs}
                onAddSpeciesLog={handleAddSpeciesLog}
                onNavigate={(t) => setTab(t)}
                onTriggerSectorAlert={handleTriggerSectorAlert}
                onShowNotification={addNotification}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer copyright segment */}
      <footer className="mt-auto border-t border-outline-variant/20 bg-slate-950/70 py-10 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Waves className="w-5 h-5 text-primary-fixed" />
            <span className="font-display font-bold text-sm text-slate-400">© 2026 AquaGuard High-Precision Systems, Inc.</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
            <span>대한민국 해안 보전 및 전 지구 생태 보존 기금 후원 하에 운영됩니다.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
