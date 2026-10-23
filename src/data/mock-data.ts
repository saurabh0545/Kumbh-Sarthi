/**
 * Mock & baseline data for Kumbh Sarthi UI.
 * Structure is ready for future FastAPI integration.
 * Verified real geographic coordinates around Godavari River, Nashik for Kumbh.
 */

export type CrowdStatus = 'LOW' | 'MODERATE' | 'HIGH';
export type DataSource = 'LIVE_CAMERA' | 'DEMO';

export interface GateData {
  id: string;
  name: string;
  source: DataSource;
  peopleCount?: number;
  status: CrowdStatus;
  updatedAt: string;
}

export const MOCK_GATES: GateData[] = [
  {
    id: 'gate-1',
    name: 'Gate 1 (Ramkund West)',
    source: 'LIVE_CAMERA',
    peopleCount: 34,
    status: 'LOW',
    updatedAt: 'Updated just now',
  },
  {
    id: 'gate-2',
    name: 'Gate 2 (Tapovan North)',
    source: 'DEMO',
    status: 'MODERATE',
    updatedAt: 'Demo data',
  },
  {
    id: 'gate-3',
    name: 'Gate 3 (Panchavati East)',
    source: 'DEMO',
    status: 'LOW',
    updatedAt: 'Demo data',
  },
  {
    id: 'gate-4',
    name: 'Gate 4 (Godavari South)',
    source: 'DEMO',
    status: 'HIGH',
    updatedAt: 'Demo data',
  },
];

export const MOCK_USER = {
  name: 'Pilgrim',
  email: 'pilgrim@kumbh.in',
  location: 'Nashik Kumbh Mela',
};

export const SAFETY_TIP = {
  text: 'Stay hydrated, keep your family group connected, and follow volunteer guidelines at the ghats.',
};

export const OVERALL_STATUS = {
  isManageable: true,
  message: 'Crowd conditions are manageable',
  description: 'Check crowd conditions before moving to another area.',
};

// ─── Family Connect Data (Local Demo State) ──────────────────────────────────

export interface FamilyMemberItem {
  id: string;
  name: string;
  relation: string;
  status: 'SAFE' | 'LAST_SEEN' | 'SOS';
  lastSeenLocation?: string;
  lastUpdated: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  isLocationShared?: boolean;
}

export interface FamilyGroupData {
  groupName: string;
  groupCode: string;
  members: FamilyMemberItem[];
}

export const INITIAL_MOCK_FAMILY: FamilyGroupData = {
  groupName: 'Patil Family',
  groupCode: 'KSA-4821',
  members: [
    {
      id: 'fm-1',
      name: 'Father (Ramesh)',
      relation: 'Father',
      status: 'SAFE',
      lastSeenLocation: 'Gate 1 Ramkund',
      lastUpdated: 'Active 2m ago',
      phone: '+91 98230 11221',
      latitude: 19.9968,
      longitude: 73.7900,
    },
    {
      id: 'fm-2',
      name: 'Mother (Sunita)',
      relation: 'Mother',
      status: 'SAFE',
      lastSeenLocation: 'Gate 1 Ramkund',
      lastUpdated: 'Active 2m ago',
      phone: '+91 98230 11222',
      latitude: 19.9969,
      longitude: 73.7902,
    },
    {
      id: 'fm-3',
      name: 'Rahul (You)',
      relation: 'Self',
      status: 'SAFE',
      lastSeenLocation: 'Gate 1 Ramkund',
      lastUpdated: 'Active now',
      phone: '+91 98230 11223',
      latitude: 19.9970,
      longitude: 73.7905,
    },
    {
      id: 'fm-4',
      name: 'Grandmother (Kalyani)',
      relation: 'Grandmother',
      status: 'LAST_SEEN',
      lastSeenLocation: 'Gate 2 Tapovan Camp',
      lastUpdated: 'Last seen 8 min ago',
      phone: '+91 98230 11224',
      latitude: 20.0035,
      longitude: 73.8040,
    },
  ],
};

// ─── Map Data with Real Nashik Geographic Coordinates ────────────────────────

export type MapLocationCategory =
  | 'safe'
  | 'moderate'
  | 'high'
  | 'medical'
  | 'police'
  | 'emergency'
  | 'toilets'
  | 'water'
  | 'important'
  | 'family';

export interface MapLocationItem {
  id: string;
  name: string;
  category: MapLocationCategory;
  categoryLabel: string;
  icon: string;
  latitude: number;
  longitude: number;
  statusBadge: string;
  badgeType: 'safe' | 'caution' | 'alert' | 'info';
  peopleCount?: number;
  source: 'LIVE_CAMERA' | 'DEMO' | 'OFFICIAL';
  description: string;
  isDemo?: boolean;
}

export const MOCK_MAP_LOCATIONS: MapLocationItem[] = [
  {
    id: 'loc-gate-1',
    name: 'Gate 1 (Ramkund West)',
    category: 'safe',
    categoryLabel: 'Gate / Entry',
    icon: '📹',
    latitude: 19.9968,
    longitude: 73.7900,
    statusBadge: 'LOW CROWD',
    badgeType: 'safe',
    peopleCount: 34,
    source: 'LIVE_CAMERA',
    description: 'Direct entry to holy Ramkund Snan area. Monitored continuously via YOLO camera system.',
    isDemo: false,
  },
  {
    id: 'loc-gate-2',
    name: 'Gate 2 (Tapovan North)',
    category: 'moderate',
    categoryLabel: 'Gate / Entry',
    icon: '🚪',
    latitude: 20.0040,
    longitude: 73.8035,
    statusBadge: 'MODERATE',
    badgeType: 'caution',
    source: 'DEMO',
    description: 'North transit gate connecting Tapovan camps to holy river corridor.',
    isDemo: true,
  },
  {
    id: 'loc-gate-3',
    name: 'Gate 3 (Panchavati East)',
    category: 'safe',
    categoryLabel: 'Gate / Entry',
    icon: '🚪',
    latitude: 19.9990,
    longitude: 73.7950,
    statusBadge: 'LOW CROWD',
    badgeType: 'safe',
    source: 'DEMO',
    description: 'Panchavati entry corridor. Steady pedestrian flow with minimal waiting.',
    isDemo: true,
  },
  {
    id: 'loc-gate-4',
    name: 'Gate 4 (Godavari South)',
    category: 'high',
    categoryLabel: 'Gate / Entry',
    icon: '🚪',
    latitude: 19.9950,
    longitude: 73.7930,
    statusBadge: 'HIGH CROWD',
    badgeType: 'alert',
    source: 'DEMO',
    description: 'South parking arrival point. Inflow currently regulated by police volunteers.',
    isDemo: true,
  },
  {
    id: 'loc-ramkund',
    name: 'Ramkund Sacred Ghat',
    category: 'important',
    categoryLabel: 'Sacred Site',
    icon: '🛕',
    latitude: 19.9975,
    longitude: 73.7910,
    statusBadge: 'High Density',
    badgeType: 'caution',
    source: 'OFFICIAL',
    description: 'Central Kumbh holy bathing kund. Follow batch turn announcements.',
    isDemo: false,
  },
  {
    id: 'loc-tapovan',
    name: 'Tapovan Pilgrim Camp',
    category: 'important',
    categoryLabel: 'Pilgrim Camp',
    icon: '⛺',
    latitude: 20.0030,
    longitude: 73.8050,
    statusBadge: 'Spacious',
    badgeType: 'safe',
    source: 'OFFICIAL',
    description: 'Spacious rest sheds, community kitchen (langar), and mobile charging.',
    isDemo: false,
  },
  {
    id: 'loc-kalaram',
    name: 'Shree Kalaram Mandir',
    category: 'important',
    categoryLabel: 'Historic Temple',
    icon: '🏛️',
    latitude: 19.9985,
    longitude: 73.7925,
    statusBadge: 'Open Darshan',
    badgeType: 'safe',
    source: 'OFFICIAL',
    description: 'Historic Panchavati temple with dedicated senior citizen queue.',
    isDemo: false,
  },
  {
    id: 'loc-trimbakeshwar',
    name: 'Trimbakeshwar Temple',
    category: 'important',
    categoryLabel: 'Temple',
    icon: '🛕',
    latitude: 19.9325,
    longitude: 73.5307,
    statusBadge: 'Open Darshan',
    badgeType: 'safe',
    source: 'OFFICIAL',
    description: 'One of the 12 Jyotirlingas of Lord Shiva. A sacred place for millions of devotees.',
    isDemo: false,
  },
  {
    id: 'loc-med-1',
    name: 'Sector 1 Medical Aid Post',
    category: 'medical',
    categoryLabel: 'Medical',
    icon: '🏥',
    latitude: 19.9970,
    longitude: 73.7895,
    statusBadge: 'Open 24/7',
    badgeType: 'info',
    source: 'OFFICIAL',
    description: 'Equipped with emergency oxygen, doctors, triage beds, and first aid.',
    isDemo: false,
  },
  {
    id: 'loc-med-2',
    name: 'Tapovan Field Hospital',
    category: 'medical',
    categoryLabel: 'Hospital',
    icon: '🚑',
    latitude: 20.0035,
    longitude: 73.8060,
    statusBadge: 'Open 24/7',
    badgeType: 'info',
    source: 'OFFICIAL',
    description: 'Full-facility Red Cross emergency field hospital with ambulance bay.',
    isDemo: false,
  },
  {
    id: 'loc-pol-1',
    name: 'Central Police Control Room',
    category: 'police',
    categoryLabel: 'Police',
    icon: '👮',
    latitude: 19.9988,
    longitude: 73.7885,
    statusBadge: 'Active Help',
    badgeType: 'info',
    source: 'OFFICIAL',
    description: 'Nashik Police emergency coordination center and RAF command post.',
    isDemo: false,
  },
  {
    id: 'loc-water-1',
    name: 'Chhatrapati Shivaji Chowk Water Station',
    category: 'water',
    categoryLabel: 'Drinking Water',
    icon: '💧',
    latitude: 19.9960,
    longitude: 73.7920,
    statusBadge: 'Free Service',
    badgeType: 'safe',
    source: 'OFFICIAL',
    description: 'Municipal purified drinking water and ORS sachet distribution.',
    isDemo: false,
  },
  {
    id: 'loc-toilet-1',
    name: 'Sector 2 Sanitation & Rest Block',
    category: 'toilets',
    categoryLabel: 'Sanitation',
    icon: '🚻',
    latitude: 19.9972,
    longitude: 73.7935,
    statusBadge: 'Maintained',
    badgeType: 'safe',
    source: 'OFFICIAL',
    description: 'Clean bio-toilets with separate senior & disabled accessibility.',
    isDemo: false,
  },
];

// ─── Alerts Baseline Data ───────────────────────────────────────────────────

export interface AlertNotificationItem {
  id: string;
  type: 'crowd' | 'safety' | 'emergency' | 'info' | 'family';
  title: string;
  message: string;
  location?: string;
  time: string;
  isRead: boolean;
  actionText?: string;
  isDemo?: boolean;
}

export const INITIAL_MOCK_ALERTS: AlertNotificationItem[] = [
  {
    id: 'alert-1',
    type: 'info',
    title: 'Information',
    message: 'Gate 3 currently has low crowd density.',
    location: 'Gate 3',
    time: '2 min ago',
    isRead: false,
    isDemo: false,
  },
  {
    id: 'alert-2',
    type: 'safety',
    title: 'Warning',
    message: 'Gate 2 is becoming crowded. Consider another route.',
    location: 'Gate 2',
    time: '12 min ago',
    isRead: false,
    isDemo: false,
  },
  {
    id: 'alert-3',
    type: 'crowd',
    title: 'Critical',
    message: 'Gate 1 is currently highly congested. Avoid entering this area.',
    location: 'Gate 1',
    time: '18 min ago',
    isRead: false,
    isDemo: false,
  },
  {
    id: 'alert-4',
    type: 'family',
    title: 'Family',
    message: 'Aarav has checked in at Kumbh Mela.',
    location: 'Family',
    time: '32 min ago',
    isRead: true,
    isDemo: false,
  },
  {
    id: 'alert-5',
    type: 'info',
    title: 'General',
    message: 'Welcome to Nashik Kumbh Mela!',
    location: 'Nashik',
    time: '1 hour ago',
    isRead: true,
    isDemo: false,
  },
];

