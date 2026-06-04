/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MissionStatus = 'ongoing' | 'survey' | 'maintenance';
export type SpeciesCategory = 'corals' | 'fish' | 'crustaceans' | 'rare';

export interface Mission {
  id: string;
  name: string;
  status: MissionStatus;
  statusKorean: string;
  sector: string;
  description: string;
  progress: number;
  featuredImage?: string;
  icon?: string;
  lastUpdated: string;
}

export interface SpeciesLog {
  id: string;
  name: string;
  scientificName: string;
  category: SpeciesCategory;
  categoryKorean: string;
  description: string;
  habitat: string;
  toxicityLevel: string; // "Level 1", "Level 2", "None", etc.
  sizeOrCount: string;   // e.g., "12cm", "45 마리"
  image: string;
  lastSighting: string;  // e.g. "2시간 전"
  sector: string;        // e.g. "Sector B-3"
  isFeatured?: boolean;
}

export interface WaterMetrics {
  depth: number;
  salinity: number;
  oxygen: number;
  temperature: number;
  oxygenStatus: 'stable' | 'warning' | 'critical';
}
