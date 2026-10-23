/**
 * Live Traffic corridors, bottlenecks, and speed tracking data for Kumbh Mela Prayagraj/Nashik network.
 */

export interface TrafficSegment {
  id: string;
  name: string;
  status: 'CLEAR' | 'MODERATE' | 'HEAVY' | 'CONGESTED';
  speedKmh: number;
  freeFlowSpeedKmh: number;
  delayMin: number;
  coordinates: [number, number][];
  description: string;
  incident?: string;
}

export const LIVE_TRAFFIC_CORRIDORS: TrafficSegment[] = [
  {
    id: 'tr-nh60-nashik-rd',
    name: 'Nashik-Pune Highway (NH 60 - Station Approach)',
    status: 'CLEAR',
    speedKmh: 48,
    freeFlowSpeedKmh: 50,
    delayMin: 0,
    description: 'Main arterial corridor connecting Nashik Road Railway Station to Dwarka Interchange.',
    coordinates: [
      [19.9535, 73.8402],
      [19.9620, 73.8315],
      [19.9710, 73.8210],
      [19.9805, 73.8115],
      [19.9880, 73.8010],
    ],
  },
  {
    id: 'tr-dwarka-circle',
    name: 'Dwarka Circle Hub to Old CBS',
    status: 'MODERATE',
    speedKmh: 24,
    freeFlowSpeedKmh: 40,
    delayMin: 4,
    description: 'Heavy vehicular merging zone with pilgrimage bus shuttles.',
    incident: 'Bus queue regulated by traffic police unit #4',
    coordinates: [
      [19.9880, 73.8010],
      [19.9915, 73.7955],
      [19.9940, 73.7915],
      [19.9960, 73.7885],
    ],
  },
  {
    id: 'tr-panchavati-approach',
    name: 'Panchavati & Ramkund North Ghat Approach',
    status: 'CONGESTED',
    speedKmh: 7,
    freeFlowSpeedKmh: 25,
    delayMin: 14,
    description: 'Pedestrian surge corridor leading to Gate 3 & Kalaram Mandir.',
    incident: 'High pedestrian density (YOLO Gate 3: 142 people/min). Pedestrian spillover.',
    coordinates: [
      [20.0055, 73.7968],
      [20.0020, 73.7945],
      [19.9995, 73.7930],
      [19.9984, 73.7915],
    ],
  },
  {
    id: 'tr-godavari-south-bypass',
    name: 'Godavari South Riverfront Bypass (Talkuteshwar)',
    status: 'CLEAR',
    speedKmh: 36,
    freeFlowSpeedKmh: 38,
    delayMin: 0,
    description: 'Designated low-congestion vehicular bypass avoiding North Ghat pedestrian crowd.',
    coordinates: [
      [19.9880, 73.8010],
      [19.9910, 73.8040],
      [19.9950, 73.7980],
      [19.9972, 73.7935],
      [19.9984, 73.7915],
    ],
  },
  {
    id: 'tr-tapovan-ring',
    name: 'Tapovan & Sadhu Gram Ring Road',
    status: 'CLEAR',
    speedKmh: 42,
    freeFlowSpeedKmh: 45,
    delayMin: 0,
    description: 'Wide ring road servicing Sadhu Gram akharas and large holding grounds.',
    coordinates: [
      [19.9935, 73.8040],
      [19.9910, 73.8110],
      [19.9860, 73.8160],
      [19.9790, 73.8190],
    ],
  },
  {
    id: 'tr-gangapur-rd',
    name: 'Gangapur Road to CBS Central Corridor',
    status: 'MODERATE',
    speedKmh: 28,
    freeFlowSpeedKmh: 45,
    delayMin: 3,
    description: 'West-bound corridor connecting residential hubs to Mela staging areas.',
    coordinates: [
      [20.0120, 73.7650],
      [20.0080, 73.7740],
      [20.0020, 73.7820],
      [19.9970, 73.7880],
    ],
  },
  {
    id: 'tr-trimbak-link',
    name: 'Trimbakeshwar Link Road',
    status: 'CLEAR',
    speedKmh: 45,
    freeFlowSpeedKmh: 50,
    delayMin: 0,
    description: 'Direct transit route linking Trimbak Akhara convoys.',
    coordinates: [
      [19.9750, 73.7550],
      [19.9820, 73.7680],
      [19.9910, 73.7800],
      [19.9960, 73.7885],
    ],
  },
];

export function getTrafficStatusColor(status: TrafficSegment['status']): string {
  switch (status) {
    case 'CLEAR':
      return '#16A34A'; // Green (Fast free flow)
    case 'MODERATE':
      return '#F59E0B'; // Amber / Orange
    case 'HEAVY':
      return '#DC2626'; // Red
    case 'CONGESTED':
      return '#991B1B'; // Deep Crimson (Severe bottleneck)
    default:
      return '#3B82F6';
  }
}
