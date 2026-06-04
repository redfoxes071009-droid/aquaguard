/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MapStation, MAP_STATIONS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Thermometer, Droplets, Wind, ShieldAlert, CheckCircle, Navigation, MonitorDot } from 'lucide-react';

interface InteractiveMapProps {
  onSelectStation?: (station: MapStation) => void;
  highlightedSector?: string;
  onClose?: () => void;
}

export default function InteractiveMap({ onSelectStation, highlightedSector, onClose }: InteractiveMapProps) {
  const [selectedStation, setSelectedStation] = useState<MapStation | null>(
    MAP_STATIONS.find(s => s.id === highlightedSector) || MAP_STATIONS[0]
  );

  const handleStationClick = (st: MapStation) => {
    setSelectedStation(st);
    if (onSelectStation) {
      onSelectStation(st);
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6">
      {/* Map visual graphic */}
      <div className="flex-1 relative aspect-video xl:aspect-auto xl:h-[450px] bg-slate-950/80 rounded-xl border border-outline-variant/30 overflow-hidden">
        {/* Underlay Grid & Lines */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #00f5d4 1.5px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        
        {/* Animated radar rings backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-primary-container/5 rounded-full animate-pulse opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] border border-primary-fixed-dim/5 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '6s' }} />

        {/* Topographic map image */}
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaCo-gymRPYgHW3bwXHcEj1Jl-JYou7oq1KLq6cczHWhNQSqaCUmhHurH9S0EZdfvUEnC0C2mBQmZO7OzcSIhkMZ9XY4bEQoRngkMjyLhlofbYhWH98cVHJbw6eNoL4yZvcM8KMM8GkEOgkb1hKuWQcglfdkhfFiWSwUe7DnuQsCKyC-7cBtvbPrGpoGFQOhZ4NypaNkFUhPxoExYzCN6nz40zJd69fFxQrrgc8azcEPzHWN5NKUwjSIGqSg1cJLBi3JFC2AWR" 
          alt="Topographic Ocean Map"
          className="absolute inset-0 w-full h-full object-cover mix-blend-lighten opacity-30 pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Station Markers */}
        {MAP_STATIONS.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const isHighlighted = highlightedSector && station.name.includes(highlightedSector);
          
          return (
            <button
              key={station.id}
              onClick={() => handleStationClick(station)}
              style={{ left: `${station.x}%`, top: `${station.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
            >
              {/* Radar ring indicator */}
              <span className={`absolute -inset-4 rounded-full transition-all duration-300 ${
                isSelected || isHighlighted 
                  ? 'bg-primary-container/20 border border-primary-container/50 scale-125 animate-pulse' 
                  : 'group-hover:bg-white/5 border border-white/10 group-hover:scale-110'
              }`} />

              {/* Central dot indicator */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center relative duration-300 ${
                station.status === 'warning' 
                  ? 'bg-error-coral animate-pulse' 
                  : 'bg-primary-container'
              }`}>
                <div className={`w-2 h-2 rounded-full bg-slate-950 ${isSelected ? 'scale-0' : 'scale-100'}`} />
              </div>

              {/* Floating label */}
              <div className={`absolute left-6 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-slate-950/95 border border-outline-variant/50 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-[11px] flex items-center gap-1.5 ${
                isSelected ? 'border-primary-container opacity-100 translate-x-1 scale-105' : ''
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  station.status === 'warning' ? 'bg-error-coral' : 'bg-primary-container'
                }`} />
                <span className="font-display font-medium text-slate-200">{station.name.split(' ').pop()}</span>
              </div>
            </button>
          );
        })}

        {/* Grid HUD Details */}
        <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col gap-1 bg-slate-950/70 border border-white/5 px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-[10px] text-primary-container/80 font-mono tracking-widest uppercase">PACIFIC COORDINATES SYSTEM</div>
          <div className="text-[11px] text-slate-400 font-mono">GRID: 34.09N / 121.84W (SECTOR A-1 ACTIVE)</div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-mono select-none">
            <Compass className="w-3.5 h-3.5 text-primary-fixed-dim animate-spin-slow" />
            <span>BEARING 182° N</span>
          </div>
        </div>
      </div>

      {/* Side Info details pane for the selected station */}
      <div className="w-full xl:w-80 flex flex-col bg-slate-900/60 xl:h-[450px] rounded-xl border border-outline-variant/30 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedStation ? (
            <motion.div
              key={selectedStation.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-5"
            >
              {/* Header */}
              <div className="border-b border-outline-variant/20 pb-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/60 border border-white/5 text-[10px] uppercase font-mono tracking-widest text-[#00f5d4] mb-2">
                  <MonitorDot className="w-3 h-3 text-primary-fixed" />
                  STATION FEED
                </span>
                <h4 className="font-display font-semibold text-base text-slate-100">{selectedStation.name}</h4>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>동기화 상태:</span>
                  <div className="flex items-center gap-1 bg-primary-container/10 border border-primary-container/20 text-[#00f5d4] px-2 py-0.5 rounded text-[10px]">
                    <CheckCircle className="w-3 h-3" />
                    <span>99.9% ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Water Metric telemetry */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded bg-slate-950/30 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Navigation className="w-4 h-4 text-primary-fixed-dim rotate-180" />
                    <span className="text-xs text-slate-400">현재 수심 (Depth)</span>
                  </div>
                  <span className="font-display font-medium text-sm text-slate-200">{selectedStation.depth}m</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-slate-950/30 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Thermometer className="w-4 h-4 text-primary-fixed-dim" />
                    <span className="text-xs text-slate-400">센서 수온 (Temperature)</span>
                  </div>
                  <span className="font-display font-medium text-sm text-slate-200">{selectedStation.temperature}°C</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-slate-950/30 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Droplets className="w-4 h-4 text-primary-fixed-dim" />
                    <span className="text-xs text-slate-400">염도 지수 (Salinity)</span>
                  </div>
                  <span className="font-display font-medium text-sm text-slate-200">{selectedStation.salinity} PSU</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-slate-950/30 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Wind className="w-4 h-4 text-primary-fixed-dim" />
                    <span className="text-xs text-slate-400">산소 포화 (Oxygen)</span>
                  </div>
                  <span className={`font-display font-medium text-sm ${
                    selectedStation.oxygen < 93 ? 'text-error-coral animate-pulse' : 'text-slate-200'
                  }`}>{selectedStation.oxygen}%</span>
                </div>
              </div>

              {/* Danger/Stable notice */}
              <div className="mt-4 pt-4 border-t border-outline-variant/20">
                {selectedStation.status === 'warning' ? (
                  <div className="flex gap-2.5 p-3 rounded bg-red-950/20 border border-red-900/30 text-rose-300 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                    <div>
                      <p className="font-semibold text-red-400">염도 센서 오작동 감지</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">정밀 보정 보정기(Calibration)를 가동하여 긴급 복구 진행이 필요합니다.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2.5 p-3 rounded bg-primary-container/5 border border-primary-container/10 text-slate-300 text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0 text-[#00f5d4]" />
                    <div>
                      <p className="font-semibold text-primary-container">생태계 생동 수치 안정</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">센서 피드 정상 수신 중. 해저 조경물 복원에 우수한 환경입니다.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Compass className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
              <p className="text-sm">지도에서 구역을 클릭하여 데이터 피드를 수신하세요.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
