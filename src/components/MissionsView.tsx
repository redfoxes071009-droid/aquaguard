/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mission, MissionStatus } from '../types';
import { IMAGES } from '../data';
import { 
  Plus, Filter, Compass, ShieldAlert, CheckCircle2, ChevronRight, Activity, 
  Timer, Award, RefreshCw, X, FileEdit, AlertTriangle, ListChecks, ArrowUpRight
} from 'lucide-react';

interface MissionsViewProps {
  missions: Mission[];
  onAddMission: (mission: Mission) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onNavigate: (tab: string) => void;
  setSelectedLogSector?: (sector: string) => void;
}

export default function MissionsView({ missions, onAddMission, onUpdateProgress, onNavigate, setSelectedLogSector }: MissionsViewProps) {
  const [filter, setFilter] = useState<string>('all');
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    status: 'ongoing' as MissionStatus,
    sector: '',
    description: '',
    progress: 50,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFilterChange = (type: string) => {
    setFilter(type);
  };

  const filteredMissions = missions.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'ongoing') return m.status === 'ongoing';
    if (filter === 'survey') return m.status === 'survey';
    if (filter === 'maintenance') return m.status === 'maintenance';
    return true;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) : value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = '미션명을 입력해 주세요.';
    if (!formData.sector.trim()) errors.sector = '작전 구역/섹터를 지정해 주세요.';
    if (!formData.description.trim()) errors.description = '정확한 수행 설명 기술이 필요합니다.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const koreanStatuses: Record<MissionStatus, string> = {
      ongoing: '진행중',
      survey: '데이터 수집',
      maintenance: '긴급 점검'
    };

    const newMission: Mission = {
      id: `m-${Date.now()}`,
      name: formData.name,
      status: formData.status,
      statusKorean: koreanStatuses[formData.status],
      sector: formData.sector,
      description: formData.description,
      progress: formData.progress,
      lastUpdated: '방금 전 등록됨',
      featuredImage: formData.status === 'ongoing' ? IMAGES.coralRestoration : undefined
    };

    onAddMission(newMission);
    setIsNewMissionOpen(false);
    
    // Reset Form
    setFormData({
      name: '',
      status: 'ongoing',
      sector: '',
      description: '',
      progress: 50
    });
    setFormErrors({});
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* View Header with custom actions */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/20 pb-4">
        <div>
          <span className="font-display text-xs font-semibold text-primary-container tracking-wider uppercase block mb-2">ACTIVE DEPLOYMENT PANEL</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-100 tracking-tight">Missions</h1>
          <p className="text-sm text-slate-400 font-sans mt-1">태평양 구역 A-1에서 진행 중인 하이드로 봇 수치 수집 및 복원 미션을 조율합니다.</p>
        </div>
        
        {/* Actions buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex bg-slate-950/60 p-1 border border-white/5 rounded-full overflow-x-auto">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-display transition-all whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-primary-container/10 border border-primary-container/30 text-primary-container font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              전체
            </button>
            <button 
              onClick={() => handleFilterChange('ongoing')}
              className={`px-4 py-1.5 rounded-full text-xs font-display transition-all whitespace-nowrap ${
                filter === 'ongoing' 
                  ? 'bg-primary-container/10 border border-primary-container/30 text-primary-container font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              진행중
            </button>
            <button 
              onClick={() => handleFilterChange('survey')}
              className={`px-4 py-1.5 rounded-full text-xs font-display transition-all whitespace-nowrap ${
                filter === 'survey' 
                  ? 'bg-primary-container/10 border border-primary-container/30 text-primary-container font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              데이터 수집
            </button>
            <button 
              onClick={() => handleFilterChange('maintenance')}
              className={`px-4 py-1.5 rounded-full text-xs font-display transition-all whitespace-nowrap ${
                filter === 'maintenance' 
                  ? 'bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              긴급 점검
            </button>
          </div>

          <button 
            onClick={() => setIsNewMissionOpen(true)}
            className="px-5 py-2.5 bg-[#00f5d4] hover:bg-primary-fixed text-slate-950 font-display text-xs font-semibold rounded-full glow-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 focus:outline-none"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>새 미션 등록</span>
          </button>
        </div>
      </section>

      {/* Featured Mission and Secondary Grid (Screenshot 2 Bento Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Main large Featured card */}
        <div className="xl:col-span-8 flex flex-col justify-end relative rounded-2xl overflow-hidden min-h-[420px] bg-slate-900 border border-outline-variant/30 group">
          
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Reef restoration corals" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 duration-1000"
              src={IMAGES.coralRestoration}
              referrerPolicy="no-referrer"
            />
            {/* Ambient gradients */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-6 z-20 flex flex-col justify-end" />
          </div>

          {/* Featured details details */}
          <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-between">
            {/* Badges top */}
            <div className="flex items-center gap-2 mb-10">
              <span className="px-3 py-1 bg-primary-fixed-dim/20 text-[#00dfc1] rounded-full font-display text-xs backdrop-blur-md border border-primary-fixed-dim/30">
                진행중
              </span>
              <span className="px-3 py-1 bg-white/10 text-white rounded-full font-display text-xs backdrop-blur-md border border-white/10">
                태평양 산호군
              </span>
            </div>

            {/* Title details */}
            <div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-slate-100 mb-2">산호초 복원 (Coral Reef Restoration)</h2>
              <p className="text-slate-300 font-sans text-xs md:text-sm max-w-xl mb-6">
                자율형 정밀 해저 드론을 대거 투동하여 심해 산호 서식 구경의 백화 현상 영역을 3D 매핑 모니터링하고 
                자족 보정형 인공 골격 구조물을 안착시키는 전략적 복원 프로젝트입니다.
              </p>

              {/* Progress slider input tracker */}
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-display">복원 및 정밀 안착 진행도</span>
                  <span className="text-primary-container font-display font-bold text-sm">68% COMPLETE</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      transition={{ duration: 1 }}
                      className="h-full bg-primary-container" 
                    />
                  </div>
                  {/* Slider controls quick calibration */}
                  <button 
                    onClick={() => onUpdateProgress('m1', 68 + 1 > 100 ? 100 : 68 + 1)}
                    className="p-1 px-2 border border-white/10 hover:bg-white/5 font-mono text-[9px] uppercase rounded"
                  >
                    텔레메트리 Calibrate +1%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary side Bento missions cards */}
        <div className="xl:col-span-4 flex flex-col sm:flex-row xl:flex-col gap-6">
          {filteredMissions.filter(m => m.id !== 'm1').map((mission) => {
            const isMaintenance = mission.status === 'maintenance';
            return (
              <div 
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                className={`flex-1 glass-card rounded-xl p-5 border-l-[4px] hover:scale-[1.01] transition-all flex flex-col justify-between cursor-pointer duration-300 ${
                  isMaintenance 
                    ? 'border-error-coral bg-rose-950/5 hover:border-red-400' 
                    : 'border-primary-container hover:border-primary-fixed'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-display uppercase tracking-wider font-semibold border ${
                      isMaintenance 
                        ? 'bg-rose-950/40 border-error-coral/40 text-error-coral' 
                        : 'bg-primary-container/10 border-primary-container/20 text-[#00f5d4]'
                    }`}>
                      {mission.statusKorean}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono italic">{mission.lastUpdated}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-100 mb-1 group-hover:text-primary-container truncate">{mission.name}</h3>
                  <p className="text-slate-400 text-xs font-sans line-clamp-3 leading-relaxed">{mission.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-slate-400">{mission.sector}</span>
                  <div className="flex items-center gap-1.5 text-xs text-primary-container font-mono font-bold">
                    <span>{mission.progress}%</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f5d4]" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMissions.filter(m => m.id !== 'm1').length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-white/5 rounded-xl bg-slate-950/35">
              <ListChecks className="w-10 h-10 text-slate-700 mb-2" />
              <p className="text-xs text-slate-400">필터에 해당하는 세부 서식 미션이 없습니다.</p>
              <button onClick={() => setFilter('all')} className="mt-2 text-[10px] text-primary-container hover:underline uppercase tracking-wide">필터 지우기</button>
            </div>
          )}
        </div>
      </div>

      {/* System stats details widget lists (Grid footer section) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-fixed">
            <Activity className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-display font-medium tracking-widest uppercase">활성 무니터링 유닛</div>
            <div className="font-display font-bold text-base text-slate-100">{missions.length + 125} UNITS ACTIVE</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-fixed">
            <Timer className="w-5 h-5 shrink-0 animate-pulse" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-display font-medium tracking-widest uppercase">센서 누적 가동</div>
            <div className="font-display font-bold text-base text-slate-100">14,230 HRS ACTIVE</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-fixed">
            <Award className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-display font-medium tracking-widest uppercase">보존 기여 지수</div>
            <div className="font-display font-bold text-base text-slate-100">4.2M POINTS</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-fixed">
            <Compass className="w-5 h-5 shrink-0 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-display font-medium tracking-widest uppercase">통신 동기화율</div>
            <div className="font-display font-bold text-base text-slate-100">99.9% SYNC RATE</div>
          </div>
        </div>

      </section>

      {/* Static interactive map backdrop promo segment */}
      <section className="mt-4">
        <div className="glass-card rounded-2xl border border-outline-variant/30 relative overflow-hidden min-h-[300px] flex flex-col justify-center items-center text-center p-8">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img 
              className="w-full h-full object-cover grayscale opacity-40 mix-blend-color-dodge hover:scale-105 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaCo-gymRPYgHW3bwXHcEj1Jl-JYou7oq1KLq6cczHWhNQSqaCUmhHurH9S0EZdfvUEnC0C2mBQmZO7OzcSIhkMZ9XY4bEQoRngkMjyLhlofbYhWH98cVHJbw6eNoL4yZvcM8KMM8GkEOgkb1hKuWQcglfdkhfFiWSwUe7DnuQsCKyC-7cBtvbPrGpoGFQOhZ4NypaNkFUhPxoExYzCN6nz40zJd69fFxQrrgc8azcEPzHWN5NKUwjSIGqSg1cJLBi3JFC2AWR" 
              alt="Topo dark ocean map background visual" 
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <Compass className="w-12 h-12 text-[#00f5d4] mb-4 animate-spin-slow" />
            <h3 className="font-display font-bold text-lg text-slate-100 mb-2">실시간 구역 매핑 스테이션</h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-md mb-6">
              태평양 구역 곳곳에 산재해 연계 통동을 가동 중인 원격 센서와 자율 잠수 노드의 
              좌표 및 해저 오렌지 관측 수치를 실시간으로 지리적 분석 지도로 확인하세요.
            </p>
            <button 
              onClick={() => onNavigate('monitor')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-full text-xs font-display font-semibold transition-all border border-white/5 flex items-center gap-1.5 focus:outline-none"
            >
              <span>통합 가상 지도 가기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Register New Mission Modal popup */}
      <AnimatePresence>
        {isNewMissionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewMissionOpen(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-outline-variant/40 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                <h4 className="font-display font-bold text-slate-100 flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-primary-container" />
                  새 자율 수집 및 보존 미션 등록
                </h4>
                <button 
                  onClick={() => setIsNewMissionOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                
                {/* Mission Name input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-display tracking-wide text-slate-300">미션명 (프로젝트 이름)</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="예: 산소 순환 유공 밸브 정밀 매핑"
                    className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-slate-100"
                  />
                  {formErrors.name && <span className="text-[10px] text-error-coral font-medium font-sans">{formErrors.name}</span>}
                </div>

                {/* Status/Category selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-display tracking-wide text-slate-300">미션 구분형태</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-slate-200"
                    >
                      <option value="ongoing">진행중 (Coral restoration style)</option>
                      <option value="survey">데이터 수집 (Telemeter survey)</option>
                      <option value="maintenance">긴급 점검 (Emergency tuning)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-display tracking-wide text-slate-300">초기 수행 진척률 (%)</label>
                    <input 
                      type="number" 
                      name="progress"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={handleInputChange}
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-slate-100"
                    />
                  </div>
                </div>

                {/* Sector location input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-display tracking-wide text-slate-300">작전 영역 / 지정 섹터</label>
                  <input 
                    type="text" 
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    placeholder="예: 태평양 산호군 - Sector B-3"
                    className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-slate-100"
                  />
                  {formErrors.sector && <span className="text-[10px] text-error-coral font-medium font-sans">{formErrors.sector}</span>}
                </div>

                {/* Description Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-display tracking-wide text-slate-300">상세 안내 및 매핑 사양 기술</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="자율 수중 로봇의 수치 제어 및 탐사 범위, 보호 대상을 한글로 명확히 입력해 주세요."
                    className="bg-slate-950/60 border border-white/10 rounded-lg p-3.5 text-xs focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-slate-100 font-sans leading-relaxed"
                  />
                  {formErrors.description && <span className="text-[10px] text-error-coral font-medium font-sans">{formErrors.description}</span>}
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3 text-right">
                  <button 
                    type="button"
                    onClick={() => setIsNewMissionOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 transition-all font-display ml-auto"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-primary-container hover:bg-primary-fixed text-slate-950 rounded-lg text-xs font-display font-bold transition-all hover:shadow-lg hover:shadow-primary-container/10 cursor-pointer"
                  >
                    미션 등록 승인
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detailed Mission specs card drawer */}
      <AnimatePresence>
        {selectedMission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMission(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-outline-variant/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                <span className="font-display text-xs font-semibold text-primary-container uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  미션 세부 Telemetry
                </span>
                <button 
                  onClick={() => setSelectedMission(null)}
                  className="text-slate-400 hover:text-slate-100 text-xs px-2 py-1 hover:bg-white/5 rounded"
                >
                  닫기
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{selectedMission.sector}</span>
                    <span className="text-primary-container font-mono text-xs font-bold">{selectedMission.statusKorean}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-100">{selectedMission.name}</h3>
                  <p className="text-slate-300 text-xs font-sans mt-3 leading-relaxed whitespace-pre-line">{selectedMission.description}</p>
                </div>

                {/* Progress bar info */}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center text-xs mb-1.5 text-slate-400">
                    <span>안착 및 통신 확보 실시간 가속</span>
                    <span className="font-bold text-[#00f5d4]">{selectedMission.progress}% Complete</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary-container" style={{ width: `${selectedMission.progress}%` }} />
                  </div>

                  {/* interactive sliders or updates inside details drawer */}
                  <div className="flex gap-2 bg-slate-950/60 p-3 rounded-lg border border-white/5 items-center justify-between">
                    <span className="text-[11px] text-slate-400">자율 수치 미세 증감:</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          const nextVal = Math.max(0, selectedMission.progress - 5);
                          onUpdateProgress(selectedMission.id, nextVal);
                          setSelectedMission({ ...selectedMission, progress: nextVal });
                        }}
                        className="p-1 px-[7px] border border-white/10 text-xs font-display text-slate-400 hover:text-white rounded"
                      >
                        -5%
                      </button>
                      <button 
                        onClick={() => {
                          const nextVal = Math.min(100, selectedMission.progress + 5);
                          onUpdateProgress(selectedMission.id, nextVal);
                          setSelectedMission({ ...selectedMission, progress: nextVal });
                        }}
                        className="p-1 px-[5px] border border-white/10 text-xs font-display text-primary-container hover:text-white rounded"
                      >
                        +5%
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950/40 p-3.5 border border-white/5 rounded-lg text-slate-400 text-[10px] font-mono leading-relaxed justify-between">
                  <span>최종 갱신 주기 파악:</span>
                  <span className="text-slate-300 font-semibold">{selectedMission.lastUpdated}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
