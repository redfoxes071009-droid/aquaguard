/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mission, SpeciesLog } from './types';

// Images hotlinked precisely as provided
export const IMAGES = {
  oceanBackdrop: 'https://lh3.googleusercontent.com/aida/AP1WRLvC-EC5CgEYsrGGEZV8219HTmhm6btwqsg7jwya-xZpEEdKhv9QStRyH5KwBvER1RvZZywQ5NagHbONLyduqi5Fz-AZUkdtovlEmPiDU4XPDHPpXRrYt2zfszSul2lQkHicSTX_vKNFs3gSXyblIocwT_n2KbLhrkJUYwG2YdWkkEUiy5zYmL4p_gEKpqDaRlOZ7mcrkX55ThhQtD6PXRsX9bIYollf2PkunfhATo6V9zr54UV4pgOv',
  
  underwaterDrone: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfa8PToiTeRzWSo120KcchH_geZLQ9Vzzhl3y0yFAR9EGSuX6H8NLYxmO8y8w_ROqlv13Zg2OUbJblB3Vvz6iDPWN8_6Bj39rdsVQkuitizcWTgyWan5xB8ydyc741t2z96R1elmg91gdwA92U1LGZ-zdtdi4chXserXyVFsRQmL-WY4P8is0qg88JcTvApxKfVxhGq0oZoKWR_c-H9SeNh6zQcUB-0GQM-i8pbl99O_W0pw5BuQ6qZ41hNkl636v9WZ_Pe_FD',
  
  officerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqQbSwiju0LQtf72JFnq3s5C3Gg72rS8COiXGM5Gq0BYDErUfcF4gzHqDqAISslS27QhK5tl4VPo30A0vwRb_EB7WRQgdmL41OAjmqDQvqfFBrk8udYrf5pboeLMQ5-NZ3zKCtnnfzx27bGld4_1tpDTRBehp0FNsabR75y0VrntFxfC4lDoLpS2lpODl02H2NvJAPRsc45xuN5z_EdCsSWdpbX1RrPpxSEML3LvejbawpQuwx5QKBVjE0gysTu6XSVE-o2TCg',
  
  commanderAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDtr2cgRllBL7ffqPtyi-Th8luxQZsXyQHHZpXXVDOpwbfmDUDOxBC6HACgbc2xRQmCGQzhg5EOkivJmtyZxeTqs8XeHaPerWysTLbhoOmNyVX361oKsvAkt3Nda_yDGfUY_f_dmKgztnZsnz7HanBgreV7vl-l6Ue4EGTTtTKvSHmGgtrSNrC4pUjbtjq7oWw3In6uDjI4hFzJS9Y8Ihp1c0xa6kYpCU68uztXpO-1O0HbhACiBCLxbQPAAnCakp_s528DeJO',
  
  coralRestoration: 'https://lh3.googleusercontent.com/aida/AP1WRLv5RGGVoH-wH2IydMUy-FJZtfKyrvuUtXwsHj9ZNpLIApM9nLExANHE5OHRmSTKaQ_8f2-Sa50cWIKZ7pTLTUpSOk_iCtIh7MVMU-qg80NRp77ZEKAzAj1zUiGXcjo1GiccmKLwFyx3-PG6kBSpJsY8ufVGDS5HAZfZpfalgn8Sdl_GhwJwZAUuj80mEB3GTwE11L4yl-GuReWaDlcA_08g0CA4oGrbZ3PSTfFo4G3Sb5V91czlzPKV',
  
  actiniaAnemone: 'https://lh3.googleusercontent.com/aida/AP1WRLtqNsKSHGTddiWdGH_OMYpTWy1zWPR-EQ-Emh-8rvujdbw8y7HgTiqFFU91K7w_8vbe2050IXNupf1Fx93FF4OzHvR1uE71rhekwpg-qVOKfwijQEwwitIKQb6rWgguKqHWbUEIaimsyoIduE0puXzdnHDX5P2vTFmZStdkbdtp0rnIZ-xVSWZRGzsA_pce48lL4BtIz8kTAp5X7dkK6Ac4wzY5VUfUyyr0hGaDiNXFEHDvBlDEU0iF',
  
  blueNudibranch: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADJzXI92CVD9NsxYVFW-kOMjuz__KMZ-Z_-NnrkopkgTZamKBI_VePFoZGkJZsiJNEKvDV-3M4VdcUNZ8xTMQg0pNg9G-7ZssHMozpWScBeXqrev31zMiVkTHXpYl7qHJBGMPvNfoAMLAAZM1NF_bCH8jwUNKfalp2vsuswaEokAMlFTca1cPGtNq2g12ewLxyyfp7aJ05Q7BSsCoaN8Am3C6CM_hIK79LWxd8uyrl0ZFUbxoYTDVqJY_CumeQq5r4R1rQQP_6',
  
  yellowTang: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0DHAZEOECr4LE6i8MLV_yrEmlJbteqpG1VkstmVki1rmP0EqATdRavwXKemk60KPAqv3Pdt02ZTkwxv3O_ZfqMO3y-EKZsnT1omj5qVXZsA94uH5xNQA2vPooYSJFsJ2io6N3EzKQEqPcoKkqRnwgEknEcYvvl8mf6D9uO31Y7G6StWR6WCiAAVMuY0T09W4JgEHldUEz8cWzHS0ai5EfGIT0-_9NG-h_JPjZMFuzL3h28CzHUeVt7kiRWKr7Ga9D8yAXgEIQ',
  
  topoOceanMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaCo-gymRPYgHW3bwXHcEj1Jl-JYou7oq1KLq6cczHWhNQSqaCUmhHurH9S0EZdfvUEnC0C2mBQmZO7OzcSIhkMZ9XY4bEQoRngkMjyLhlofbYhWH98cVHJbw6eNoL4yZvcM8KMM8GkEOgkb1hKuWQcglfdkhfFiWSwUe7DnuQsCKyC-7cBtvbPrGpoGFQOhZ4NypaNkFUhPxoExYzCN6nz40zJd69fFxQrrgc8azcEPzHWN5NKUwjSIGqSg1cJLBi3JFC2AWR',
  
  bioluminescentTips: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-y1zN_IXtWbmwl9gicqPb3KLficVe4-CRCxubg2gscNcY3a0TBfGMv-s0AEHMYHq5a1kQEXelPmgPZPO6Xl_8H2VAdrlpg7ZvhKKviZvfO7lxuCL4C0XiTYgB2vw8GHWiEGv_G2VyjWjtuRoZD5RBRkee3zc1UJXaGWhnzNihcQ1m1iMrRDM8m9JQVNCy_H-yBwMifoEJFK_DimlsCaoB3ZIFUvShReqmqy-POQrgtgXiXktf8ur-dRwVj7yxsDI2eNp8VkdA'
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    name: '산호초 복원 (Coral Reef Restoration)',
    status: 'ongoing',
    statusKorean: '진행중',
    sector: '태평양 산호군 - Sector A-3',
    description: '자율형 드론을 활용하여 심해 산호초의 백화 현상을 모니터링하고 인공 산호 구조물을 성공적으로 정착시키고 있습니다.',
    progress: 68,
    featuredImage: IMAGES.coralRestoration,
    lastUpdated: '실시간 업데이트 중'
  },
  {
    id: 'm2',
    name: '해양 생태계 조사',
    status: 'survey',
    statusKorean: '데이터 수집',
    sector: '태평양 구역 - Sector A-1',
    description: '해저 500m 지점의 미생물 분포와 산소 포화도 데이터를 정밀 분석 중이며, AI 생태 감지망을 정교화하고 있습니다.',
    progress: 85,
    lastUpdated: '24시간 내 수집 완료'
  },
  {
    id: 'm3',
    name: '센서 클러스터 유지보수',
    status: 'maintenance',
    statusKorean: '긴급 점검',
    sector: '자연 보호 구역 - Sector B-3',
    description: '구역 B-3의 염도 센서 오작동 리포트가 확인되었습니다. 수치 칼리브레이션 및 긴급 수동 보정이 필요합니다.',
    progress: 15,
    lastUpdated: '전문가 할당 대기'
  }
];

export const INITIAL_SPECIES_LOGS: SpeciesLog[] = [
  {
    id: 'sp1',
    name: '말미잘속',
    scientificName: 'Actinia',
    category: 'corals',
    categoryKorean: '산호류',
    description: '이 종은 주로 암석 해안의 조간대 구역에서 발견되며, 주변 환경에 따라 선명한 주황색과 청록색 텐타클을 뽐냅니다. 현재 수온 18.5°C 환경에서 매우 활동적인 상태입니다.',
    habitat: '암반 조간대 (수심 5-30m)',
    toxicityLevel: 'Level 2',
    sizeOrCount: '0.5km 거리 감지',
    image: IMAGES.actiniaAnemone,
    lastSighting: '실시간 감지됨',
    sector: 'Sector A-3',
    isFeatured: true
  },
  {
    id: 'sp2',
    name: '파란갯민숭달팽이',
    scientificName: 'Glaucilla marginata',
    category: 'rare',
    categoryKorean: '희귀종',
    description: '화려한 청색 줄무늬가 특징인 먼 바다 종으로, 맹독성 해파리를 섭취하여 자신의 방어 독소 에너지를 충전합니다.',
    habitat: '열대 표층수 (부유성 서식)',
    toxicityLevel: 'Level 4 (경계)',
    sizeOrCount: '12cm 개체',
    image: IMAGES.blueNudibranch,
    lastSighting: '최근 관측: 2시간 전',
    sector: 'Sector A-1'
  },
  {
    id: 'sp3',
    name: '노랑탱',
    scientificName: 'Zebrasoma flavescens',
    category: 'fish',
    categoryKorean: '어류',
    description: '밀도 높은 군집 생활을 하며 산호초 주변의 무성한 선태류 및 이끼류 맛을 보며 생태계 보존과 성장에 기여합니다.',
    habitat: '얕은 석호 및 산호초 사면 (수심 2-40m)',
    toxicityLevel: 'None',
    sizeOrCount: '45 마리 군집',
    image: IMAGES.yellowTang,
    lastSighting: '최근 관측: 5분 전',
    sector: 'Sector B-2'
  }
];

export interface MapStation {
  id: string;
  name: string;
  x: number; // custom SVG X %
  y: number; // custom SVG Y %
  status: 'online' | 'warning' | 'offline';
  temperature: number;
  salinity: number;
  oxygen: number;
  depth: number;
}

export const MAP_STATIONS: MapStation[] = [
  { id: 'st-a1', name: 'Pacific Outer Sector A-1', x: 25, y: 35, status: 'online', temperature: 24.1, salinity: 34.8, oxygen: 94.1, depth: 452.8 },
  { id: 'st-a3', name: 'Coral Sanctum Sector A-3', x: 45, y: 65, status: 'online', temperature: 24.8, salinity: 35.1, oxygen: 96.2, depth: 310.4 },
  { id: 'st-b2', name: 'Volcano Ridge Sector B-2', x: 75, y: 25, status: 'online', temperature: 26.2, salinity: 34.2, oxygen: 93.9, depth: 890.1 },
  { id: 'st-b3', name: 'Abyssal Ridge Sector B-3', x: 80, y: 75, status: 'warning', temperature: 18.5, salinity: 35.2, oxygen: 92.4, depth: 1020.2 }
];
