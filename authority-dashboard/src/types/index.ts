export type DensityLevel = 'LOW' | 'MEDIUM' | 'MODERATE' | 'HIGH';

export interface AuthorityUser {
  id: number;
  name: string;
  email: string;
  role: string;
  designation?: string;
  department?: string;
  authorityId?: string;
  assignedZone?: string;
}

export interface AuthState {
  user: AuthorityUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ZoneCrowdData {
  id: string;
  name: string;
  gateCode: string;
  peopleCount: number;
  density: DensityLevel;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  isLive: boolean; // TRUE only for real camera/YOLO feed (Gate 1 / Gate-A)
  dataSource: 'LIVE_YOLO_CAMERA' | 'HISTORICAL_ESTIMATE' | 'TELEMETRY_FEED' | 'DEMO_DATA';
  lastUpdated: string;
  capacityLimit: number;
  coordinates: [number, number]; // lat, lng
  cameraOnline: boolean;
  notes?: string;
}

export interface AlertItem {
  id: number;
  type: 'CROWD' | 'SAFETY' | 'EMERGENCY' | 'FAMILY' | 'INFO';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string | null;
  zone?: string | null;
  is_system: boolean;
  is_read?: boolean;
  created_at: string;
}

export interface FamilySosItem {
  id: number;
  family_id: number;
  family_name?: string;
  user_id: number;
  user_name: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  status: 'ACTIVE' | 'RESOLVED';
  created_at: string;
  assigned_team?: string;
}

export interface EmergencyIncident {
  id: string;
  type: 'MEDICAL' | 'CROWD_SURGE' | 'LOST_CHILD' | 'FIRE_HAZARD' | 'STRUCTURAL' | 'SOS' | 'EMERGENCY' | 'POLICE' | string;
  location: string;
  zone: string;
  coordinates?: [number, number];
  reportedAt: string;
  status: 'REQUIRED' | 'RESPONDING' | 'RESOLVED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  assignedTeam?: string;
  callerContact?: string;
  notes?: string;
  senderName?: string;
}

export interface CameraFeedItem {
  id: string;
  name: string;
  zone: string;
  status: 'ONLINE' | 'OFFLINE' | 'STANDBY';
  isLiveStream: boolean; // only true for real camera
  peopleCount: number;
  density: DensityLevel;
  lastUpdated: string;
  streamUrl?: string;
  resolution: string;
  fps: number;
  locationDetails: string;
}

export interface SystemHealthData {
  status: 'operational' | 'degraded' | 'offline';
  subsystems: {
    backend_api: { status: string; version?: string };
    mysql_database: { status: string; host?: string; database?: string };
    yolo_crowd_detection: { status: string; model?: string; active_stream?: string };
    camera_network: { status: string; online: number; total: number };
    alerts_service: { status: string };
  };
  server_time?: string;
}

export interface KpiStatsData {
  total_zones: number;
  crowd_status: 'NORMAL' | 'MODERATE' | 'CRITICAL';
  active_alerts: number;
  emergency_requests: number;
  cameras_online: number;
  total_cameras: number;
  people_monitored: number;
  timestamp?: string;
}

export interface LostFoundReport {
  id: string;
  type: 'MISSING_PERSON' | 'FOUND_PERSON' | 'LOST_ITEM' | 'FOUND_ITEM';
  nameOrItem: string;
  ageOrDescription: string;
  lastKnownLocation: string;
  reportedTime: string;
  contactNumber: string;
  status: 'PENDING' | 'SEARCHING' | 'MATCHED' | 'RESOLVED';
  assignedTeam: string;
  photoUrl?: string;
}
