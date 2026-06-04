/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpeciesLog, SpeciesCategory } from '../types';
import { IMAGES } from '../data';
import { 
  Search, ShieldAlert, CheckCircle2, ChevronRight, Eye, ShieldCheck, 
  MapPin, Plus, Heart, HelpCircle, Activity, Sparkles, X, Info, Trash2, Camera, ArrowUpRight, Share2
} from 'lucide-react';

interface LogViewProps {
  speciesLogs: SpeciesLog[];
  onAddSpeciesLog: (log: SpeciesLog) => void;
  onNavigate: (tab: string) => void;
  onTriggerSectorAlert?: (sector: string) => void;
  onShowNotification?: (message: string, type?: 'success' | 'warn') => void;
}

export default function LogView({ speciesLogs, onAddSpeciesLog, onNavigate, onTriggerSectorAlert, onShowNotification }: LogViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesLog | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const speciesId = params.get('species');
    if (speciesId) {
      return speciesLogs.find(s => s.id === speciesId) || null;
    }
    return null;
  });
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Species Form states
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    category: 'fish' as SpeciesCategory,
    description: '',
    habitat: '',
    toxicityLevel: 'None',
    sizeOrCount: '',
    sector: 'Sector A-1',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = '생물명을 한글로 입력해 주세요.';
    if (!formData.scientificName.trim()) errors.scientificName = '학명을 입력해 주세요 (영어).';
    if (!formData.description.trim()) errors.description = '이 종의 상세 정보 및 서식 관측 로그를 기입해 주세요.';
    if (!formData.habitat.trim()) errors.habitat = '서식처(예: 암반 조간대, 열대 매각 등)를 입력해 주세요.';
    if (!formData.sizeOrCount.trim()) errors.sizeOrCount = '관찰 크기 또는 개체수(예: 15cm, 20 마리)를 입력해 주세요.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const koreanCategories: Record<SpeciesCategory, string> = {
      corals: '산호류',
      fish: '어류',
      crustaceans: '갑각류',
      rare: '희귀종'
    };

    const newLog: SpeciesLog = {
      id: `sp-${Date.now()}`,
      name: formData.name,
      scientificName: formData.scientificName,
      category: formData.category,
      categoryKorean: koreanCategories[formData.category],
      description: formData.description,
      habitat: formData.habitat,
      toxicityLevel: formData.toxicityLevel,
      sizeOrCount: formData.sizeOrCount,
      sector: formData.sector,
      lastSighting: '최근 관측: 방금 전',
      image: formData.category === 'corals' ? IMAGES.actiniaAnemone : formData.category === 'rare' ? IMAGES.blueNudibranch : IMAGES.yellowTang
    };

    onAddSpeciesLog(newLog);
    setIsNewLogOpen(false);

    // Reset Form
    setFormData({
      name: '',
      scientificName: '',
      category: 'fish',
      description: '',
      habitat: '',
      toxicityLevel: 'None',
      sizeOrCount: '',
      sector: 'Sector A-1',
    });
    setFormErrors({});
  };

  // Processing log listings
  const filteredLogs = speciesLogs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(search.toLowerCase()) || 
                          log.scientificName.toLowerCase().includes(search.toLowerCase()) ||
                          log.habitat.toLowerCase().includes(search.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && log.category === selectedCategory;
  });

  return (
    <div className="flex flex-col gap-10">
      
      {/* View Header */}
      <section className="border-b border-outline-variant/20 pb-4">
        <span className="font-display text-xs font-semibold text-primary-container tracking-wider uppercase block mb-2">PACIFIC MARINE LOG LIFE CATALOG</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-100 tracking-tight">해양 생물 로그</h1>
        <p className="text-sm text-slate-400 font-sans mt-1">실시간 자동 감지 및 모니터링 드론 비전이 추적한 태평양 섹터 A-1 일대의 주요 해양 종 목록입니다.</p>
      </section>

      {/* Search & filters segment (Screenshot 3 header search) */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input Box */}
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="종 이름, 학명 또는 주요 서식지로 실시간 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-sans outline-none text-slate-200 focus:ring-1 focus:ring-primary-container focus:border-[#00f5d4] transition-all"
          />
        </div>

        {/* Categories togglers */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full md:w-auto scrollbar">
          {[
            { id: 'all', label: '전체' },
            { id: 'corals', label: '산호류' },
            { id: 'fish', label: '어류' },
            { id: 'crustaceans', label: '갑각류' },
            { id: 'rare', label: '희귀종' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-display font-medium transition-all whitespace-nowrap focus:outline-none ${
                selectedCategory === cat.id 
                  ? 'bg-primary-container text-slate-950 font-bold hover:bg-primary-fixed shadow-lg shadow-primary-container/5' 
                  : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Primary Logs list Grid layout */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left side: featured larger species and cards list */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Featured Species Card (MALMIJAL ACTINIA) */}
          {selectedCategory === 'all' && (
            <div 
              onClick={() => setSelectedSpecies(speciesLogs[0])}
              className="relative rounded-2xl overflow-hidden min-h-[360px] bg-slate-950 border border-primary-container/30 flex flex-col justify-end group cursor-pointer"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  alt="Actinia Anemone coral biology" 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-[1.01] duration-700 pointer-events-none"
                  src={IMAGES.actiniaAnemone}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Specs text overlays */}
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary-container/10 border border-primary-container/30 text-primary-container text-[10px] uppercase font-display font-bold px-3 py-1 rounded-full">
                    실시간 감지됨
                  </span>
                  <span className="text-primary-fixed-dim font-display text-[11px] font-semibold">
                    • 0.5km 거리 이격
                  </span>
                </div>

                <h3 className="font-display font-bold text-2xl text-slate-100 mb-2">말미잘속 (Actinia)</h3>
                <p className="text-slate-350 font-sans text-xs md:text-sm line-clamp-2 max-w-xl mb-4 leading-relaxed">
                  이 종은 주황색과 선명한 에메랄드 청록색 촉수를 뽐내는 군락 형태의 해양 말미잘입니다. 암 석으로 둘러싸인 조간대 깊은 바위 틈에서 
                  군락을 이루며 수온 18.5°C 내외 조경수 유속 조건에서 최적의 활성도를 나타냅니다.
                </p>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-900/90 border border-white/5 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">주요 서식지</span>
                    <span className="font-display font-semibold text-xs text-primary-container">암반 조간대</span>
                  </div>
                  <div className="bg-slate-900/90 border border-white/5 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">독성 구분</span>
                    <span className="font-display font-semibold text-xs text-primary-container">Level 2</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Normal Species Grid Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredLogs.filter(l => !l.isFeatured).map(log => {
              return (
                <div 
                  key={log.id}
                  onClick={() => setSelectedSpecies(log)}
                  className="bg-[#14212D]/60 rounded-2xl border border-white/5 p-5 hover:border-primary-container/40 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Species visual thumb */}
                    <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-slate-900">
                      <img 
                        alt={log.name} 
                        className="w-full h-full object-cover group-hover:scale-105 duration-500 pointer-events-none"
                        src={log.image}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-slate-950/60 p-2 border border-white/10 rounded-lg backdrop-blur-sm opacity-80">
                        <Eye className="w-4 h-4 text-primary-container" />
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display font-bold text-base text-slate-100 group-hover:text-primary-container transition-colors truncate pr-2">{log.name}</h4>
                      <span className="text-primary-fixed font-mono text-sm font-semibold shrink-0">{log.sizeOrCount}</span>
                    </div>
                    <p className="text-slate-400 font-sans text-xs line-clamp-2 leading-relaxed">{log.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-sans text-[11px]">{log.lastSighting}</span>
                    <button className="text-[#00f5d4] group-hover:text-primary-fixed text-[11px] font-display font-semibold flex items-center gap-1">
                      <span>상세 정보</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredLogs.filter(l => !l.isFeatured).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-slate-950/30">
                <Info className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-slate-400 text-sm">해당 카테고리에 할당된 도감 정보가 발견되지 않았습니다.</p>
                <button onClick={() => { setSelectedCategory('all'); setSearch(''); }} className="mt-2 text-xs text-primary-container hover:underline uppercase tracking-wide">도감 초기화</button>
              </div>
            )}
          </div>
        </div>

        {/* Right side widgets: diversity counts and invaders warnings */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* Quick Species Diversity Progress index card */}
          <div className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-fixed font-semibold text-glow">
                <Activity className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-100 text-sm">종 다양성 지수 (Diversity)</h4>
                <p className="text-primary-fixed-dim font-display font-bold text-sm mt-0.5">H' = 3.24 (우수 수준)</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              자동 추종 로봇이 최근 30일간 감식 분류한 종 밀도 분석 결과, 가시도가 뛰어난 다이버 산호 존 중심으로 균형도가 고도 성립되어 있습니다.
            </p>

            <div className="h-2 bg-slate-950 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-primary-container w-[78%]" />
            </div>
            <span className="text-[10px] text-slate-500 font-sans block text-right">전월 대비 12% 증가 추세 복구 중</span>
          </div>

          {/* WARNING Alert Crown Starfish popup container (Screenshot 3 card 4) */}
          <div className="glass-card rounded-2xl border border-[#f87171]/20 p-6 bg-red-950/5 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-950/40 border border-red-900/30 flex items-center justify-center text-error-coral animate-pulse">
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-100 text-sm">주의 대상 포착 경계</h4>
                <p className="text-error-coral font-display font-bold text-sm mt-0.5">침입 외래종 감지 경고</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              수자원 보전 가치가 높은 <span className="text-rose-400 font-semibold">'Sector B-3'</span> 구역에서 생태 파괴 주요 가해종인 <strong>'가시관불가사리'</strong> 군립이 비전 센싱되었습니다.
            </p>

            {/* Quick action button that highlights Sector B-3 in Map modal */}
            <button 
              onClick={() => {
                if (onTriggerSectorAlert) {
                  onTriggerSectorAlert('B-3');
                }
              }}
              className="w-full py-2.5 bg-rose-950/30 border border-[#f87171]/30 hover:bg-rose-950/60 duration-300 text-rose-400 tracking-wider font-display font-bold text-[10px] rounded-lg tracking-widest uppercase focus:outline-none"
            >
              종합 수질 지도에서 위치 확인하기
            </button>
          </div>

          {/* Quick inline manual logs button add */}
          <div 
            onClick={() => setIsNewLogOpen(true)}
            className="rounded-2xl border-2 border-dashed border-white/5 p-6 hover:border-primary-container/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer group min-h-[180px] bg-slate-950/20"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 hover:border-[#00f5d4]/40 flex items-center justify-center text-slate-400 group-hover:text-primary-container transition-all group-hover:scale-105 mb-4">
              <Plus className="w-5 h-5 shrink-0" />
            </div>
            <h4 className="font-display font-bold text-slate-100 text-sm mb-1 group-hover:text-primary-container duration-300">새 로그 수동 등록</h4>
            <p className="text-xs text-slate-500 font-sans max-w-[200px] leading-relaxed">자율 감지망 외의 목격 생물을 직접 시스템 데이터베이스에 등재합니다.</p>
          </div>

        </div>
      </section>

      {/* Manual Species Addition Form Modal Drawer */}
      <AnimatePresence>
        {isNewLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewLogOpen(false)}
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
                  <Camera className="w-5 h-5 text-primary-container animate-pulse" />
                  신규 관견 해양 생물 도감 추가
                </h4>
                <button 
                  onClick={() => setIsNewLogOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display text-slate-300">생물명 (한글명)</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="예: 백상아리"
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary-container"
                    />
                    {formErrors.name && <span className="text-[9px] text-error-coral">{formErrors.name}</span>}
                  </div>

                  {/* Scientific Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display text-slate-300">학식명 (Scientific Name)</label>
                    <input 
                      type="text" 
                      name="scientificName"
                      value={formData.scientificName}
                      onChange={handleInputChange}
                      placeholder="Carcharodon carcharias"
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-primary-container"
                    />
                    {formErrors.scientificName && <span className="text-[9px] text-error-coral">{formErrors.scientificName}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display text-slate-300">범주 형태</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary-container"
                    >
                      <option value="corals">산호류</option>
                      <option value="fish">어류</option>
                      <option value="crustaceans">갑각류</option>
                      <option value="rare">희귀종</option>
                    </select>
                  </div>

                  {/* Sighting size/volume */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display text-slate-300 font-sans">감지 크기 / 목량 개체수</label>
                    <input 
                      type="text" 
                      name="sizeOrCount"
                      value={formData.sizeOrCount}
                      onChange={handleInputChange}
                      placeholder="예: 4m 내외, 2 마리"
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 focus:outline-none "
                    />
                    {formErrors.sizeOrCount && <span className="text-[9px] text-error-coral">{formErrors.sizeOrCount}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Sighting habitat */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display text-slate-300">주요 섭 취/서식처</label>
                    <input 
                      type="text" 
                      name="habitat"
                      value={formData.habitat}
                      onChange={handleInputChange}
                      placeholder="예: 원양 표 층수 (수 심 0-250m)"
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3.5 py-1.5 text-xs text-slate-100 focus:outline-none "
                    />
                    {formErrors.habitat && <span className="text-[9px] text-error-coral">{formErrors.habitat}</span>}
                  </div>

                  {/* Sighting Sector coordinate */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-display text-slate-300">감견 구역 좌표</label>
                    <select 
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="Sector A-1">Sector A-1 (Pacific Outer)</option>
                      <option value="Sector A-3">Sector A-3 (Coral Sanctum)</option>
                      <option value="Sector B-2">Sector B-2 (Volcano Ridge)</option>
                      <option value="Sector B-3">Sector B-3 (Abyssal Ridge)</option>
                    </select>
                  </div>
                </div>

                {/* Toxicity Level */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-display text-slate-300">해당 생물 독성 지표 단계</label>
                  <select 
                    name="toxicityLevel"
                    value={formData.toxicityLevel}
                    onChange={handleInputChange}
                    className="bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-250"
                  >
                    <option value="None">None (안전 - 무해 생물군)</option>
                    <option value="Level 1">Level 1 (미 약독성)</option>
                    <option value="Level 2">Level 2 (일반 촉수 자독)</option>
                    <option value="Level 4 (경계)">Level 4 (경계 - 치명적 섭식 주의)</option>
                  </select>
                </div>

                {/* Sighting description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-display text-slate-300">생태 복사 설명 기술</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="식별 생물군의 외견 색채 특징 및 관 관된 유속, 거 리 등을 한글로 자유롭게 기술하세요."
                    className="bg-slate-950/60 border border-white/10 rounded-lg p-3.5 text-xs text-slate-100 font-sans leading-relaxed text-slate-200"
                  />
                  {formErrors.description && <span className="text-[9px] text-error-coral">{formErrors.description}</span>}
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3 text-right">
                  <button 
                    type="button"
                    onClick={() => setIsNewLogOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-display ml-auto"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#00f5d4] hover:bg-primary-fixed text-slate-950 rounded-lg text-xs font-display font-bold transition-all hover:shadow-lg hover:shadow-primary-container/10 cursor-pointer"
                  >
                    생물 등재 허가
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Species Detail popup Drawer modal */}
      <AnimatePresence>
        {selectedSpecies && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpecies(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-outline-variant/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              {/* Feature Banner */}
              <div className="relative h-44 bg-slate-950 border-b border-white/5">
                <img 
                  alt={selectedSpecies.name}
                  className="w-full h-full object-cover"
                  src={selectedSpecies.image}
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedSpecies(null)}
                  className="absolute top-3 right-3 p-1.5 bg-slate-950/80 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-slate-950 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span>{selectedSpecies.categoryKorean} • {selectedSpecies.sector}</span>
                    <span className="text-primary-container">{selectedSpecies.lastSighting}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-100">{selectedSpecies.name}</h3>
                  <p className="text-slate-450 italic text-[11px] font-mono mt-0.5 text-primary-fixed-dim">{selectedSpecies.scientificName}</p>
                  
                  {/* Encoded Web References links */}
                  <div className="flex flex-wrap gap-2.5 items-center mt-2 select-none">
                    <a 
                      href={`https://ko.wikipedia.org/wiki/${encodeURIComponent(selectedSpecies.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-display font-semibold text-primary-container hover:text-primary-fixed hover:underline"
                    >
                      <span>백과사전 상세 정보</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                    <span className="text-slate-700 text-xs">|</span>
                    <a 
                      href={`https://scholar.google.com/scholar?q=${encodeURIComponent(selectedSpecies.scientificName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-display font-semibold text-primary-fixed-dim hover:text-[#00f5d4] hover:underline"
                    >
                      <span>학술 자료 검색</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <p className="text-slate-300 text-xs font-sans mt-3.5 leading-relaxed">{selectedSpecies.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                  <div className="bg-slate-950/40 p-2.5 rounded border border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">상세 서식 영역</span>
                    <span className="text-slate-300 font-sans text-xs font-semibold">{selectedSpecies.habitat}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded border border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">상태 독성 등급</span>
                    <span className={`text-xs font-display font-semibold ${
                      selectedSpecies.toxicityLevel.includes('Level') ? 'text-orange-400' : 'text-[#00f5d4]'
                    }`}>{selectedSpecies.toxicityLevel}</span>
                  </div>
                </div>

                {/* Sighting deep-link generator */}
                <div className="flex gap-2 items-center mt-1">
                  <button 
                    onClick={() => {
                      try {
                        const params = new URLSearchParams();
                        params.set('tab', 'log');
                        params.set('species', selectedSpecies.id);
                        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
                        navigator.clipboard.writeText(shareUrl);
                        
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        
                        if (onShowNotification) {
                          onShowNotification(`AQUAGUARD: '${selectedSpecies.name}' 관측 상세 공유 링크가 복사되었습니다!`, 'success');
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full py-2 bg-slate-950/70 border border-white/10 hover:border-primary-container/40 hover:bg-slate-950 hover:text-primary-container text-xs font-display font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-slate-300 pointer-events-auto"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? '공유 링크 복사 완료!' : '관측 정보 공유 링크 복사'}</span>
                  </button>
                </div>

                <div className="flex gap-2.5 items-center bg-primary-container/5 border border-primary-container/10 p-3 rounded-lg text-[10px] text-slate-400 mt-1 font-mono">
                  <Heart className="w-4 h-4 shrink-0 text-primary-container animate-pulse" />
                  <span>이 카탈로그 정보는 AQUAGUARD 자율 해양 보호 기구 지침을 따릅니다.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
