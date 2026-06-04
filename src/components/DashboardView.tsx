/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IMAGES, MAP_STATIONS, MapStation } from '../data';
import { WaterMetrics } from '../types';
import InteractiveMap from './InteractiveMap';
import { 
  Waves, RefreshCw, FileText, Share2, Eye, ShieldAlert, CheckCircle2, 
  MapPin, HelpCircle, Thermometer, Droplets, Wind, AlertTriangle, Cpu, Sparkles, Send, Anchor, Compass
} from 'lucide-react';

interface DashboardViewProps {
  metrics: WaterMetrics;
  onUpdateMetrics: (newMetrics: WaterMetrics) => void;
  onNavigate: (tab: string) => void;
  setSelectedLogSector?: (sector: string) => void;
  onShowNotification?: (message: string, type?: 'success' | 'warn') => void;
}

export default function DashboardView({ metrics, onUpdateMetrics, onNavigate, setSelectedLogSector, onShowNotification }: DashboardViewProps) {
  const [isSimulating, setIsSimulating] = useState(true);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<MapStation | null>(MAP_STATIONS[0]);
  const [timestamp, setTimestamp] = useState('');
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  const [adviceQuery, setAdviceQuery] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Copy current telemetry metrics state as a sharing link URL
  const handleCopyShareLink = () => {
    try {
      const params = new URLSearchParams();
      params.set('tab', 'dashboard');
      params.set('depth', metrics.depth.toString());
      params.set('salinity', metrics.salinity.toString());
      params.set('oxygen', metrics.oxygen.toString());
      params.set('temperature', metrics.temperature.toString());

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      
      navigator.clipboard.writeText(shareUrl);
      if (onShowNotification) {
        onShowNotification('AQUAGUARD: 현재 모니터링 수치가 포함된 공유 링크가 클립보드에 복사되었습니다!', 'success');
      }
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  // Simulation waves data fluctuation
  const [chartData, setChartData] = useState<number[]>([40, 55, 45, 70, 60, 85, 75, 90, 65, 50, 80, 95]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Soft oscillation of metrics is simulation is active
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const depthChange = (Math.random() - 0.5) * 1.5;
      const salinityChange = (Math.random() - 0.5) * 0.1;
      const oxygenChange = (Math.random() - 0.5) * 0.2;
      const tempChange = (Math.random() - 0.5) * 0.1;

      // Ensure stable limits
      const updatedDepth = parseFloat(Math.max(400, Math.min(500, metrics.depth + depthChange)).toFixed(1));
      const updatedSalinity = parseFloat(Math.max(30, Math.min(40, metrics.salinity + salinityChange)).toFixed(1));
      const updatedOxygen = parseFloat(Math.max(90, Math.min(100, metrics.oxygen + oxygenChange)).toFixed(1));
      const updatedTemp = parseFloat(Math.max(15, Math.min(30, metrics.temperature + tempChange)).toFixed(1));

      onUpdateMetrics({
        depth: updatedDepth,
        salinity: updatedSalinity,
        oxygen: updatedOxygen,
        temperature: updatedTemp,
        oxygenStatus: updatedOxygen < 93 ? 'warning' : 'stable'
      });

      // Shift charting slightly
      setChartData(prev => {
        const next = [...prev.slice(1)];
        const lastVal = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 15;
        const newVal = Math.max(30, Math.min(100, lastVal + change));
        next.push(newVal);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, metrics, onUpdateMetrics]);

  // Request Gemini advisor insight
  const fetchAiAdvice = async (customPrompt?: string) => {
    setIsAiLoading(true);
    setAiAdvice('');
    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depth: metrics.depth,
          temperature: metrics.temperature,
          salinity: metrics.salinity,
          oxygen: metrics.oxygen,
          prompt: customPrompt || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiAdvice(data.advice);
      } else {
        setAiAdvice(data.error || 'AI 어드바이저 호출 중 오류 발생');
      }
    } catch (error) {
      setAiAdvice('네트워크 연결 끊김 또는 서버 연결에 실패했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendQuery = () => {
    if (!adviceQuery.trim()) return;
    fetchAiAdvice(adviceQuery);
    setAdviceQuery('');
    setSelectedPresetIndex(null);
  };

  const advicePresets = [
    { title: "현재 데이터 종합 분석", query: `현재 수온 ${metrics.temperature}°C, 수심 ${metrics.depth}m, 염도 ${metrics.salinity} PSU, 산소 포화도 ${metrics.oxygen}% 조건을 해양학적 측면에서 철저히 분석하고 잠재 리스크를 예측해라.` },
    { title: "산소 수치 저하 행동 수칙", query: "산소 포화도가 기준치인 93% 이하로 떨어지는 원인(예: 조류 순환 지연, 부영양화 등)과 이에 특화된 드론 복구 프로토콜을 한글로 정리해라." },
    { title: "최근 염분 변동성 경향 점검", query: "태평양 Sector A-1 일대의 34.8 PSU 내외 염도 등락에 따른 해양 미생물 활성화 및 산호 백화 가속화 메커니즘을 분석해라." }
  ];

  const handlePresetSelect = (idx: number) => {
    setSelectedPresetIndex(idx);
    fetchAiAdvice(advicePresets[idx].query);
  };

  // Export report to txt file on click
  const handleExportReport = () => {
    const rawData = `AQUAGUARD TELEMETRY REPORT
----------------------------------
발생 시각: ${new Date().toLocaleString('ko-KR')}
실시간 상태: ${isSimulating ? 'SIMULATOR ACTIVE' : 'MANUAL FEED'}

[수온 (Temperature)]: ${metrics.temperature}°C
[센서 수심 (Depth)]: ${metrics.depth}m
[염도 지수 (Salinity)]: ${metrics.salinity} PSU
[산소 수준 (Oxygen)]: ${metrics.oxygen}% (상태: ${metrics.oxygenStatus.toUpperCase()})

[수정 가속화 조경지]: Pacific Sector A-1
----------------------------------
분석 보고서가 출력 완료되었습니다.`;

    const blob = new Blob([rawData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquaguard_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Landing top hero segment with Backdrop */}
      <section className="relative h-[65vh] xl:h-[75vh] min-h-[450px] flex items-center rounded-2xl overflow-hidden glass-card">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Deep Ocean Reef Background" 
            className="w-full h-full object-cover opacity-70 scale-105 transition-transform duration-1000"
            src={IMAGES.oceanBackdrop}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-deep via-surface-deep/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-deep/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 px-6 xl:px-16 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-[#00f5d4] font-display text-xs tracking-widest rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            PACIFIC SECTOR A-1 ACTIVE
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-slate-100 mb-6 leading-tight">
            지속 가능한 내일을 위한<br />
            <span className="text-[#00f5d4] text-glow font-extrabold">해양 수호</span>
          </h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl mb-10 font-sans">
            AquaGuard의 고정밀 실시간 모니터링 시스템은 깊은 바다 속에 자율 주행 모니터링 드론 테크와 
            최첨단 화학 물질 센서를 결합하여 생태 균형을 추적하고 보호합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate('missions')}
              className="px-8 py-3.5 bg-primary-container hover:bg-primary-fixed text-slate-950 font-display font-semibold rounded-lg glow-hover transition-all flex items-center justify-center gap-2"
            >
              <span>미션 센터 가기</span>
              <Anchor className="w-4 h-4 shrink-0" />
            </button>
            <button 
              onClick={() => setIsMapModalOpen(true)}
              className="px-8 py-3.5 border border-primary-fixed-dim hover:bg-primary-fixed-dim/5 text-[#00dfc1] font-display font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>지역 수심 맵 열기</span>
              <Compass className="w-4 h-4 shrink-0 animate-spin-slow" />
            </button>
          </div>
        </div>

        {/* Level indicator floating pill */}
        <div className="absolute bottom-8 right-6 hidden lg:block">
          <div className="glass-card p-5 rounded-xl border-l-4 border-primary-container min-w-[240px] drop-shadow-xl backdrop-blur-md">
            <p className="font-display text-xs tracking-wider text-primary-container/80 uppercase">시뮬레이션 산소 Saturation</p>
            <div className="flex items-end justify-between mt-2">
              <span className={`font-display text-2xl font-bold ${
                metrics.oxygen < 93 ? 'text-error-coral animate-pulse' : 'text-slate-100'
              }`}>{metrics.oxygen}%</span>
              <div className="flex items-center gap-1.5 text-xs text-primary-container font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping" />
                <span>ONLINE</span>
              </div>
            </div>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-container transition-all duration-300"
                style={{ width: `${metrics.oxygen}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Control Room / Dashboard interface */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 border border-primary-container/20 text-[#00dfc1] rounded-full text-xs font-mono font-medium mb-2">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-primary-container animate-ping' : 'bg-rose-400 animate-pulse'}`} />
              {isSimulating ? '실시간 데이터 수신 중' : '수동 입력 세트 활성화'}
            </span>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-slate-100">태평양 구역 A-1 모니터링</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">시스템 타임스탬프: <span className="text-slate-300">{timestamp || '2024.05.24 14:30:12'}</span></p>
          </div>
          
          {/* Tools */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-xs font-display font-medium transition-all flex items-center justify-center gap-2 ${
                isSimulating 
                  ? 'border-primary-container/30 bg-primary-container/5 text-[#00f5d4] hover:bg-primary-container/10' 
                  : 'border-white/10 bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span>{isSimulating ? '시뮬레이터 일시정지' : '시뮬레이터 시작'}</span>
            </button>
            <button 
              onClick={handleCopyShareLink}
              className="px-4 py-2 border border-primary-fixed-dim bg-[#00dfc1]/10 hover:bg-[#00dfc1]/20 text-[#00dfc1] font-display text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>공유 링크 복사</span>
            </button>
            <button 
              onClick={handleExportReport}
              className="px-4 py-2 bg-primary-container text-slate-950 hover:bg-primary-fixed font-display text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-container/10"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>보고서 내보내기</span>
            </button>
          </div>
        </div>

        {/* Primary Bento telemetry indicators */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left panel: Live overview metric chart and controls */}
          <div className="xl:col-span-8 flex flex-col gap-6 glass-card p-6 rounded-xl border border-outline-variant/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-display font-bold text-base text-slate-100">해양 수질 상태 요약</h4>
                <p className="text-xs text-slate-400">지정 시간별 센서 오차 보완 수산 데이터 흐름</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col text-right">
                  <span className="font-display text-sm font-semibold text-primary-container">{metrics.temperature}°C</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">평균 수온</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col text-right">
                  <span className="font-display text-sm font-semibold text-[#00dfc1]">{metrics.salinity} PSU</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">염분도</span>
                </div>
              </div>
            </div>

            {/* Custom SVG telemetry Chart */}
            <div className="relative h-60 w-full bg-slate-950/60 rounded-xl border border-white/5 flex items-end p-4 overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #00f5d4 1.5px, transparent 0)',
                backgroundSize: '20px 20px'
              }} />
              
              {/* Overlay telemetry guidelines */}
              <div className="absolute inset-x-0 bottom-1/4 border-b border-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-2/4 border-b border-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-3/4 border-b border-white/5 pointer-events-none" />

              <div className="flex items-end justify-between w-full h-full gap-2 relative z-10 pt-6">
                {chartData.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                    <div className="w-full relative flex justify-center">
                      {/* Floating hover indicator badge */}
                      <span className="absolute -top-6 text-[9px] font-mono font-medium text-primary-container opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-primary-container/20 px-1 rounded">
                        {val.toFixed(0)}%
                      </span>
                    </div>
                    {/* Animated gradient bar using standard Tailwind classes */}
                    <div 
                      style={{ height: `${val}%` }}
                      className="w-full bg-linear-to-t from-primary-container/10 to-primary-container hover:to-primary-fixed rounded-t-sm transition-all duration-300"
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-2">T{(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Tuning Controls (Only editable if simulation paused or directly used as fine-tuning) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4">
              <div className="p-4 bg-slate-950/40 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-300 font-medium">수온 제어</span>
                  <span className="text-xs font-mono font-semibold text-primary-container">{metrics.temperature}°C</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="35" 
                  step="0.1" 
                  value={metrics.temperature} 
                  onChange={(e) => {
                    setIsSimulating(false);
                    onUpdateMetrics({ ...metrics, temperature: parseFloat(e.target.value) });
                  }}
                  className="w-full accent-[#00f5d4] bg-slate-800" 
                />
              </div>

              <div className="p-4 bg-slate-950/40 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-300 font-medium">염도 제어</span>
                  <span className="text-xs font-mono font-semibold text-primary-container">{metrics.salinity} PSU</span>
                </div>
                <input 
                  type="range" 
                  min="25" 
                  max="45" 
                  step="0.1" 
                  value={metrics.salinity} 
                  onChange={(e) => {
                    setIsSimulating(false);
                    onUpdateMetrics({ ...metrics, salinity: parseFloat(e.target.value) });
                  }}
                  className="w-full accent-[#00f5d4] bg-slate-800" 
                />
              </div>

              <div className="p-4 bg-slate-950/40 rounded-lg border border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-300 font-medium">산소 수준 제어</span>
                  <span className={`text-xs font-mono font-semibold ${metrics.oxygen < 93 ? 'text-error-coral animate-pulse' : 'text-primary-container'}`}>{metrics.oxygen}%</span>
                </div>
                <input 
                  type="range" 
                  min="85" 
                  max="100" 
                  step="0.1" 
                  value={metrics.oxygen} 
                  onChange={(e) => {
                    setIsSimulating(false);
                    const val = parseFloat(e.target.value);
                    onUpdateMetrics({ ...metrics, oxygen: val, oxygenStatus: val < 93 ? 'warning' : 'stable' });
                  }}
                  className="w-full accent-[#00f5d4] bg-slate-800" 
                />
                {metrics.oxygen < 93 && (
                  <div className="absolute right-2 top-2">
                    <span className="w-1.5 h-1.5 bg-error-coral rounded-full animate-ping block" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Digital quick gauges status */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            
            {/* Depth Card widget */}
            <div 
              onClick={() => {
                setSelectedStation(MAP_STATIONS.find(s => s.name.includes('A-1')) || null);
                setIsMapModalOpen(true);
              }}
              className="glass-card hover:border-[#00f5d4]/40 p-5 rounded-xl border-l-[4px] border-primary-container flex flex-col justify-between cursor-pointer transition-all hover:translate-x-1 duration-300 group"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-[10px] tracking-wider text-slate-400 uppercase font-bold">REAL-TIME TELEMETRY</span>
                <Eye className="w-4 h-4 text-slate-400 group-hover:text-primary-container transition-colors" />
              </div>
              <p className="text-slate-300 font-display text-sm font-semibold mb-1">현재 수심 (Depth)</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-slate-100 tracking-tight">{metrics.depth}</span>
                <span className="text-[10px] font-mono tracking-widest text-[#00dfc1]">METERS</span>
              </div>
            </div>

            {/* Salinity Widget */}
            <div 
              onClick={() => {
                setSelectedStation(MAP_STATIONS.find(s => s.name.includes('A-3')) || null);
                setIsMapModalOpen(true);
              }}
              className="glass-card hover:border-[#00f5d4]/40 p-5 rounded-xl border-l-[4px] border-[#00dfc1] flex flex-col justify-between cursor-pointer transition-all hover:translate-x-1 duration-300 group"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-[10px] tracking-wider text-slate-400 uppercase font-bold">SALINITY SENSOR</span>
                <Eye className="w-4 h-4 text-slate-400 group-hover:text-primary-container transition-colors" />
              </div>
              <p className="text-slate-300 font-display text-sm font-semibold mb-1">염도 (Salinity)</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-slate-100 tracking-tight">{metrics.salinity}</span>
                <span className="text-[10px] font-mono tracking-widest text-primary-container">PSU</span>
              </div>
            </div>

            {/* Oxygen Saturation widget */}
            <div 
              onClick={() => {
                setSelectedStation(MAP_STATIONS.find(s => s.name.includes('B-3')) || null);
                setIsMapModalOpen(true);
              }}
              className={`glass-card p-5 rounded-xl border-l-[4px] flex flex-col justify-between cursor-pointer transition-all hover:translate-x-1 duration-300 group ${
                metrics.oxygen < 93 
                  ? 'border-error-coral bg-rose-950/10 hover:border-red-400' 
                  : 'border-primary-fixed-dim hover:border-[#00f5d4]/40'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className={`font-display text-[10px] tracking-wider uppercase font-bold ${
                  metrics.oxygen < 93 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                }`}>
                  {metrics.oxygen < 93 ? 'WARNING: LOW OXYGEN' : 'OXYGEN MONITOR'}
                </span>
                <AlertTriangle className={`w-4 h-4 ${metrics.oxygen < 93 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
              </div>
              <p className="text-slate-300 font-display text-sm font-semibold mb-1">산소 포화도 (Oxygen)</p>
              <div className="flex items-baseline gap-2">
                <span className={`font-display text-3xl font-bold tracking-tight ${
                  metrics.oxygen < 93 ? 'text-rose-400' : 'text-slate-100'
                }`}>{metrics.oxygen}</span>
                <span className="text-[10px] font-mono tracking-widest text-[#00dfc1]">SAT %</span>
              </div>
            </div>

          </div>
        </div>

        {/* Gemini AI Expert Assistant integration widget */}
        <div className="glass-card p-6 rounded-xl border border-outline-variant/30 relative overflow-hidden backdrop-blur-md">
          {/* Neon accent patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-[#00dfc1]/5 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-6 relative z-10">
            {/* Advice panel info */}
            <div className="w-full lg:w-1/3 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary-container" />
                <h4 className="font-display font-bold text-slate-100">AI 해양 전문가 어드바이저</h4>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6">
                AQUAGUARD 3.5-Flash 모델이 현재 모니터링 수집 값을 정밀 검진하여 생태 위협을 예측하고 대응 솔루션을 제공합니다.
              </p>
              
              {/* Presets */}
              <span className="text-[10px] font-display font-bold text-primary-container uppercase tracking-wide mb-2 block">빠른 종합 질문 선택</span>
              <div className="flex flex-col gap-2">
                {advicePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(idx)}
                    className={`w-full text-left font-sans text-xs p-2.5 rounded transition-all border ${
                      selectedPresetIndex === idx 
                        ? 'bg-primary-container/10 border-primary-container/40 text-slate-100 font-medium' 
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/70 hover:text-slate-300'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Feed panel */}
            <div className="flex-1 flex flex-col bg-slate-950/70 border border-white/5 rounded-xl p-5 min-h-[300px] justify-between">
              <div className="overflow-y-auto mb-4 font-sans text-xs max-h-60 leading-relaxed scrollbar">
                {isAiLoading ? (
                  <div className="flex flex-col gap-2 text-slate-400 items-center justify-center h-48">
                    <Cpu className="w-8 h-8 text-primary-container animate-spin" />
                    <p className="font-display tracking-[0.1em] text-[10px] animate-pulse">AQUAGUARD AI ANALYZING CURRENT TELEMETRY...</p>
                  </div>
                ) : aiAdvice ? (
                  <div className="text-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-primary-container/15 border border-primary-container/20 text-[#00f5d4] px-3 py-1.5 rounded-lg w-full mb-4 text-[10px] font-display uppercase tracking-widest font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>HYDRO-TECHNICAL ANALYSIS ADVICE</span>
                      </div>
                      <button 
                        onClick={() => {
                          const adviceUrl = `${window.location.origin}${window.location.pathname}?tab=dashboard&depth=${metrics.depth}&salinity=${metrics.salinity}&oxygen=${metrics.oxygen}&temperature=${metrics.temperature}`;
                          navigator.clipboard.writeText(`[AQUAGUARD AI 분석 결과]\n수심: ${metrics.depth}m, 수온: ${metrics.temperature}°C, 염도: ${metrics.salinity} PSU, 산소: ${metrics.oxygen}%\n\n대응 지침:\n"${aiAdvice}"\n\n공유 링크: ${adviceUrl}`);
                          if (onShowNotification) {
                            onShowNotification('AI 대응 가이드 및 실시간 공유 링크가 클립보드에 복사되었습니다!', 'success');
                          }
                        }}
                        className="flex items-center gap-1 text-[9px] text-[#00f5d4] hover:text-white hover:bg-primary-container/20 transition-colors bg-slate-950/45 px-2.5 py-1 rounded-md border border-primary-container/30 pointer-events-auto cursor-pointer"
                      >
                        <Share2 className="w-2.5 h-2.5" />
                        <span>링크 & 지침 복사</span>
                      </button>
                    </div>
                    {/* Rendered content with elegant typography */}
                    <div className="space-y-3 whitespace-pre-line text-sm leading-relaxed text-slate-300 block-markdown">
                      {aiAdvice}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 h-48 h-full text-center p-6">
                    <Anchor className="w-10 h-10 mb-2 text-slate-700 animate-bounce" style={{ animationDuration: '3s' }} />
                    <p className="text-slate-400 font-medium text-sm">AI 어드바이저가 활성화 전 상태입니다.</p>
                    <p className="text-[11px] text-slate-500 mt-1 font-sans">궁금한 분석 질문 또는 위Presets를 눌러 즉석 AI 피드를 수신하세요.</p>
                  </div>
                )}
              </div>

              {/* Input field query */}
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <input
                  type="text"
                  placeholder="예: 수온이 2°C 증가하면 산소 Saturation에 어떤 변화가 생기나요?"
                  value={adviceQuery}
                  onChange={(e) => setAdviceQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendQuery();
                  }}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none transition-all placeholder:text-slate-500 text-slate-200"
                />
                <button
                  onClick={handleSendQuery}
                  disabled={isAiLoading || !adviceQuery.trim()}
                  className="p-2.5 rounded-lg bg-primary-container hover:bg-primary-fixed disabled:bg-slate-800 disabled:text-slate-600 font-semibold text-slate-950 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bento landing secondary cards grid details (screenshot 1 bento cards) */}
        <div className="mt-8">
          <h4 className="font-display font-semibold text-primary-container text-xs tracking-widest uppercase mb-4 block">주요 실시간 모니터링 기술 모듈</h4>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Card 1: Autonomous marine monitor drone */}
            <div className="md:col-span-8 bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden group hover:border-[#00f5d4]/30 duration-300 relative min-h-[300px]">
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent p-6 z-20 flex flex-col justify-end">
                <h5 className="font-display font-bold text-lg text-slate-100 group-hover:text-primary-container duration-300">심해 자율 주행 모니터링</h5>
                <p className="text-xs text-slate-300 font-sans mt-2 max-w-xl">
                  사람의 발길이 닿지 않는 수심 1,000m 이상의 고압 해저지형 공간에 정밀 해양 관측 드론을 파견하여 실시간 생태 감지를 완수합니다.
                </p>
                <button 
                  onClick={() => setIsDroneModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-slate-950/85 hover:bg-[#00f5d4] hover:text-slate-950 rounded-lg text-xs font-display font-semibold border border-white/5 text-primary-container font-medium w-fit transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>실시간 드론 캠 연결</span>
                </button>
              </div>
              <img 
                alt="Underwater Autonomous Drone" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 pointer-events-none"
                src={IMAGES.underwaterDrone}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right side bento cards */}
            <div className="md:col-span-4 flex flex-col gap-6">
              
              {/* Salinity details bento visual wrapper */}
              <div className="bg-[#14212D]/60 p-6 rounded-xl border border-white/5 hover:border-primary-container/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-6 text-primary-container text-glow">
                  <Droplets className="w-5 h-5 text-glow" />
                </div>
                <h5 className="font-display font-semibold text-slate-100 text-sm mb-2">염도 및 성분 정밀 분석</h5>
                <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                  해동 및 기류 변화에 따른 해수의 미세 화학성 등락 패턴을 실시간 탐지하여 이상 징후 발생 기류를 모니전원에게 선 알림합니다.
                </p>
                <div className="flex items-baseline gap-1 bg-slate-950/60 p-3.5 rounded border border-white/5 w-fit">
                  <span className="font-display font-semibold text-lg text-primary-container">{metrics.salinity}</span>
                  <span className="text-[9px] font-mono text-slate-400">PSU DATA STABLE</span>
                </div>
              </div>

              {/* Marine tracker details */}
              <div 
                onClick={() => onNavigate('log')}
                className="bg-[#14212D]/60 p-6 rounded-xl border border-white/5 hover:border-primary-container/40 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-6 text-primary-container">
                  <Waves className="w-5 h-5 shrink-0" />
                </div>
                <h5 className="font-display font-semibold text-slate-100 text-sm mb-2 group-hover:text-primary-container duration-300">해양 생물 감지 로그 추적</h5>
                <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                  AI 비전 딥러닝 기반의 식별 망을 통해 희귀 해양 보호류 감지 이력을 아카이빙하고 생태 지도를 그립니다.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#1b2023] border border-white/10 flex items-center justify-center text-[10px] font-mono">A1</span>
                  <span className="w-6 h-6 rounded-full bg-[#1b2023] border border-white/10 flex items-center justify-center text-[10px] font-mono">B7</span>
                  <span className="w-8 h-6 rounded-full bg-[#1b2023] border border-white/10 flex items-center justify-center text-[10px] font-mono">+12</span>
                  <span className="text-[10px] text-primary-container font-medium uppercase font-display ml-auto tracking-wide group-hover:translate-x-1 transition-transform">도감 확인 →</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Floating full-screen SVG Topographic Interactive Map Modal Drawer */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-slate-900 border border-outline-variant/50 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-slate-950/40">
                <div>
                  <h4 className="font-display font-bold text-slate-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-container" />
                    실시간 구역 맵 수집 센터
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">태평양 각 섹터의 모니터링 원격 정밀 센서 노드 상태 분석 지표</p>
                </div>
                <button 
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
                >
                  닫기
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <InteractiveMap 
                  onSelectStation={(st) => setSelectedStation(st)}
                  onClose={() => setIsMapModalOpen(false)} 
                />
              </div>

              <div className="px-6 py-3 border-t border-outline-variant/20 bg-slate-950/30 text-right">
                <span className="text-[10px] text-slate-500 font-mono">AQUAGUARD NAVIGATIONAL TELEMETRY COOPERATION</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Drone cam detail telemetry popup modal */}
      <AnimatePresence>
        {isDroneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDroneModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-outline-variant/50 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-slate-950/40">
                <h4 className="font-display font-bold text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary-container animate-spin-slow" />
                  심해 드론 실시간 통합 Telemetry 캠
                </h4>
                <button 
                  onClick={() => setIsDroneModalOpen(false)}
                  className="text-slate-400 hover:text-slate-100 text-xs"
                >
                  닫기
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Simulated Feed Screen */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-primary-container/30 group">
                  <div className="absolute top-3 left-3 bg-red-600 animate-pulse text-white font-mono text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 bg-white rounded-full block" />
                    LIVE VIDEO FEED
                  </div>
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-white/5 font-mono text-[9px] p-1.5 rounded flex flex-col gap-0.5 text-slate-300">
                    <span>ALT: -1,104M</span>
                    <span>BAT: 94% ACTIVE</span>
                  </div>

                  {/* Scan line effect overlay placeholder */}
                  <div className="absolute inset-x-0 h-[1.5px] bg-primary-container/20 top-1/2 animate-bounce pointer-events-none" />

                  {/* Drone graphic */}
                  <img 
                    alt="Autonomous Underwater exploration Drone Live feed" 
                    className="w-full h-full object-cover group-hover:scale-105 duration-1000"
                    src={IMAGES.underwaterDrone}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-primary-container/5 mix-blend-overlay pointer-events-none" />
                </div>

                {/* Sub telemetries */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-3 rounded bg-slate-950/40 border border-white/5 font-mono">
                    <span className="text-slate-400">드론 모델명:</span>
                    <span className="text-slate-200">AQUASCOUT - MK IV (Autonomous)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-3 rounded bg-slate-950/40 border border-white/5 font-mono">
                    <span className="text-slate-400">자율 제어 주파수:</span>
                    <span className="text-slate-200">2.44 GHz Secure Fiber Uplink</span>
                  </div>
                  <div className="flex justify-between items-center text-xs p-3 rounded bg-slate-950/40 border border-white/5 font-mono">
                    <span className="text-slate-400">인공 구조물 밀착 복원율:</span>
                    <span className="text-[#00f5d4]">96.8% Match Rate</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsDroneModalOpen(false);
                    onNavigate('missions');
                  }}
                  className="w-full py-2.5 bg-primary-container hover:bg-primary-fixed text-slate-950 font-display text-xs font-bold rounded-lg transition-all"
                >
                  미션 상태 제어판 가기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
