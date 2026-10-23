export interface MapPOI {
  id: string;
  name: string;
  category: 'POLICE' | 'MEDICAL' | 'AMBULANCE' | 'TEMPLE' | 'GHAT' | 'PARKING' | 'TOILET' | 'WATER' | 'EMERGENCY_POINT';
  coordinates: [number, number];
  description: string;
  status?: string;
  contact?: string;
}

export const NASHIK_CENTER: [number, number] = [19.9984, 73.7915]; // Ramkund, Nashik

export const MAP_POIS: MapPOI[] = [
  // Temples & Sacred Ghats
  {
    id: 'ghat-1',
    name: 'Ramkund Sacred Ghat',
    category: 'GHAT',
    coordinates: [19.9984, 73.7915],
    description: 'Central Kumbh Mela holy bathing kund on sacred Godavari river.',
    status: 'ACTIVE_SNAN',
  },
  {
    id: 'ghat-2',
    name: 'Lakshman Kund Ghat',
    category: 'GHAT',
    coordinates: [19.9968, 73.7925],
    description: 'Secondary ceremonial holy pond on Godavari southern bank.',
    status: 'OPERATIONAL',
  },
  {
    id: 'temple-1',
    name: 'Shree Kalaram Mandir',
    category: 'TEMPLE',
    coordinates: [20.0055, 73.7968],
    description: 'Historic Black Stone Rama temple with continuous darshan queue.',
    status: 'OPEN_DARSHAN',
  },
  {
    id: 'temple-2',
    name: 'Kapaleshwar Mahadev Mandir',
    category: 'TEMPLE',
    coordinates: [19.9992, 73.7922],
    description: 'Ancient Shiva temple overlooking Ramkund steps.',
    status: 'OPEN_DARSHAN',
  },
  {
    id: 'temple-3',
    name: 'Sita Gufa & Panchavati Vriksha',
    category: 'TEMPLE',
    coordinates: [20.0068, 73.7981],
    description: 'Sacred grove and historic pilgrimage landmark.',
    status: 'REGULATED_ENTRY',
  },

  // Police & Security Stations
  {
    id: 'police-1',
    name: 'Central Kumbh Police Command Post',
    category: 'POLICE',
    coordinates: [19.9978, 73.7905],
    description: 'Command center for sector safety and crowd regulation officers.',
    status: '24x7_ACTIVE',
    contact: '0253-2222100',
  },
  {
    id: 'police-2',
    name: 'Panchavati Police Station Station Post',
    category: 'POLICE',
    coordinates: [20.0040, 73.7940],
    description: 'Zonal police patrol and rapid deployment squad.',
    status: '24x7_ACTIVE',
    contact: '0253-2222102',
  },
  {
    id: 'police-3',
    name: 'Tapovan Quick Action Police Outpost',
    category: 'POLICE',
    coordinates: [19.9935, 73.8040],
    description: 'Rapid response team for Sadhu Gram and Tapovan sector.',
    status: '24x7_ACTIVE',
    contact: '0253-2222103',
  },

  // Medical Centers & Hospitals
  {
    id: 'med-1',
    name: 'Civil Hospital Emergency Field Unit (Ramkund)',
    category: 'MEDICAL',
    coordinates: [19.9990, 73.7895],
    description: '100-bed makeshift trauma & emergency triage medical station.',
    status: 'EMERGENCY_READY',
    contact: '108',
  },
  {
    id: 'med-2',
    name: 'Tapovan Red Cross First Aid Camp',
    category: 'MEDICAL',
    coordinates: [19.9920, 73.8060],
    description: '24-hour heat exhaustion, hydration, and minor trauma care.',
    status: 'ACTIVE',
    contact: '0253-2222115',
  },

  // Ambulances (Live Egress Points)
  {
    id: 'amb-1',
    name: 'Rapid Life Support Ambulance 01',
    category: 'AMBULANCE',
    coordinates: [19.9972, 73.7880],
    description: 'Advanced Cardiac Life Support unit stationed at Victoria Bridge ramp.',
    status: 'ON_STANDBY',
    contact: '108',
  },
  {
    id: 'amb-2',
    name: 'Emergency Response Ambulance 04',
    category: 'AMBULANCE',
    coordinates: [19.9940, 73.8080],
    description: 'Dedicated ambulance corridor on Tapovan Link Road.',
    status: 'ON_STANDBY',
    contact: '108',
  },

  // Emergency Points
  {
    id: 'em-1',
    name: 'Disaster Relief Staging Post A',
    category: 'EMERGENCY_POINT',
    coordinates: [19.9960, 73.7950],
    description: 'NDRF boat rescue team & life-jacket distribution cache.',
    status: 'DEPLOYED',
  },

  // Parking Plazas
  {
    id: 'park-1',
    name: 'Kailas Nagar Pilgrim Parking Hub (North)',
    category: 'PARKING',
    coordinates: [20.0090, 73.7910],
    description: 'Holding capacity: 4,000 buses and light motor vehicles.',
    status: '45%_FULL',
  },
  {
    id: 'park-2',
    name: 'Nilkantheshwar Ground Mega Parking (South)',
    category: 'PARKING',
    coordinates: [19.9890, 73.7820],
    description: 'Holding capacity: 6,500 private cars and two-wheelers.',
    status: '68%_FULL',
  },

  // Water & ORS Kiosks
  {
    id: 'water-1',
    name: 'Free RO Drinking Water & ORS Station 1',
    category: 'WATER',
    coordinates: [19.9980, 73.7920],
    description: 'Municipal continuous cold drinking water facility.',
    status: 'OPERATIONAL',
  },
  {
    id: 'water-2',
    name: 'Goda Ghat Water Kiosk 4',
    category: 'WATER',
    coordinates: [20.0020, 73.7935],
    description: '20,000L refill tank with 12 taps.',
    status: 'OPERATIONAL',
  },

  // Public Sanitary Facilities
  {
    id: 'toilet-1',
    name: 'Mobile Bio-Toilet Complex A (Men & Women)',
    category: 'TOILET',
    coordinates: [19.9970, 73.7900],
    description: '30 automated cleaning cubicles with disabled access.',
    status: 'CLEANED_RECENTLY',
  },
  {
    id: 'toilet-2',
    name: 'Tapovan Sanitation Block 2',
    category: 'TOILET',
    coordinates: [19.9915, 73.8035],
    description: 'High capacity sanitation block with regular sanitization.',
    status: 'CLEANED_RECENTLY',
  },
];
