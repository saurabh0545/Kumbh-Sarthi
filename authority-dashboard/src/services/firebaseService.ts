import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import db, { isFirebaseConfigured } from '../config/firebase';
import { AlertItem, EmergencyIncident, FamilySosItem, LostFoundReport } from '../types';

export interface FirebaseBroadcastPayload {
  title: string;
  message: string;
  type: 'CROWD' | 'SAFETY' | 'EMERGENCY' | 'INFO';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string;
  zone?: string;
}

export const firebaseDashboardService = {
  isConfigured(): boolean {
    return isFirebaseConfigured();
  },

  // ─── ALERTS SYSTEM ─────────────────────────────────────────────────────────

  /**
   * Broadcasts an official alert to Firestore.
   * Mobile app pilgrims receive this instantly through real-time listeners.
   */
  async broadcastAlert(payload: FirebaseBroadcastPayload): Promise<string | null> {
    if (!isFirebaseConfigured()) return null;
    try {
      const col = collection(db, 'alerts');
      const docRef = await addDoc(col, {
        title: payload.title,
        message: payload.message,
        type: payload.type,
        severity: payload.severity,
        location: payload.location || 'All Zones',
        zone: payload.zone || 'Gate-A',
        isSystem: true,
        isRead: false,
        createdAt: serverTimestamp(),
        source: 'AUTHORITY_DASHBOARD',
      });
      console.log('[Firebase Dashboard] Broadcasted alert with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('[Firebase Dashboard] Failed to broadcast alert:', err);
      return null;
    }
  },

  /**
   * Resolves or deletes an alert from Firestore in real-time.
   */
  async resolveAlert(alertId: string | number): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;
    try {
      if (typeof alertId === 'string' && alertId.length > 3) {
        await deleteDoc(doc(db, 'alerts', alertId));
        console.log('[Firebase Dashboard] Alert resolved & removed from Firestore:', alertId);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Firebase Dashboard] Error removing alert doc:', err);
      return false;
    }
  },

  /**
   * Subscribes to real-time alerts collection.
   */
  subscribeToAlerts(callback: (alerts: AlertItem[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const col = collection(db, 'alerts');
      return onSnapshot(
        col,
        (snap) => {
          const alerts: AlertItem[] = snap.docs.map((d) => {
            const data = d.data();
            let dateStr = new Date().toISOString();
            if (data.createdAt?.toDate) {
              dateStr = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
              dateStr = data.createdAt;
            }
            return {
              id: d.id as any,
              title: data.title || 'Official Kumbh Alert',
              message: data.message || '',
              type: data.type || 'INFO',
              severity: data.severity || 'INFO',
              location: data.location,
              zone: data.zone,
              is_system: data.isSystem ?? true,
              is_read: data.isRead ?? false,
              created_at: dateStr,
            };
          });
          alerts.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          callback(alerts);
        },
        (err) => console.warn('[Firebase] Alerts listener error:', err)
      );
    } catch (e) {
      console.warn('[Firebase] Alert subscription setup error:', e);
      return null;
    }
  },

  // ─── EMERGENCY SOS DISPATCH ────────────────────────────────────────────────

  /**
   * Subscribes to real-time SOS incidents emitted from mobile app users.
   */
  subscribeToLiveSos(callback: (incidents: EmergencyIncident[], familySos: FamilySosItem[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const col = collection(db, 'sos_incidents');
      return onSnapshot(
        col,
        (snap) => {
          const emergencyList: EmergencyIncident[] = [];
          const familySosList: FamilySosItem[] = [];

          snap.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const timeStr = data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Just now';

            // Map to EmergencyIncident
            emergencyList.push({
              id: id,
              type: data.type || 'MEDICAL',
              location: data.locationName || 'Kumbh Sacred Grounds',
              zone: data.zone || 'Gate-A',
              coordinates: [data.latitude || 19.9975, data.longitude || 73.791],
              reportedAt: timeStr,
              status: (data.status === 'ACTIVE' ? 'REQUIRED' : data.status) || 'REQUIRED',
              severity: data.severity || 'CRITICAL',
              assignedTeam: data.assignedTeam || 'Unassigned',
              callerContact: data.userPhone || '+91 98230 XXXXX',
              senderName: data.userName || 'Pilgrim',
              notes: data.notes || `Pilgrim SOS triggered by ${data.userName || 'Pilgrim'}`,
            });

            // Map to FamilySosItem
            familySosList.push({
              id: id as any,
              family_id: Number(data.userId) || 1,
              family_name: data.familyName || 'Pilgrim Group',
              user_id: Number(data.userId) || 1,
              user_name: data.userName || 'Pilgrim',
              latitude: data.latitude,
              longitude: data.longitude,
              location_name: data.locationName || 'Near Sacred Ghats',
              status: (data.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE') as any,
              created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              assigned_team: data.assignedTeam || 'Unassigned',
            });
          });

          callback(emergencyList, familySosList);
        },
        (err) => console.warn('[Firebase] SOS listener error:', err)
      );
    } catch (e) {
      console.warn('[Firebase] SOS subscription error:', e);
      return null;
    }
  },

  /**
   * Updates status of an SOS incident (e.g. REQUIRED -> RESPONDING -> RESOLVED)
   */
  async updateSosStatus(id: string, status: string, assignedTeam?: string): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;
    try {
      const docRef = doc(db, 'sos_incidents', id);
      const updateData: any = { status };
      if (assignedTeam) updateData.assignedTeam = assignedTeam;
      if (status === 'RESOLVED') updateData.resolvedAt = serverTimestamp();
      await updateDoc(docRef, updateData);
      return true;
    } catch (e) {
      console.warn('[Firebase] Error updating SOS status:', e);
      return false;
    }
  },

  // ─── LOST & FOUND TWO-WAY SYNC ─────────────────────────────────────────────

  /**
   * Subscribes to real-time Lost & Found reports.
   */
  subscribeToLostFound(callback: (reports: LostFoundReport[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const q = query(collection(db, 'lost_found'), orderBy('reportedAt', 'desc'), limit(50));
      return onSnapshot(
        q,
        (snap) => {
          const items: LostFoundReport[] = snap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              type: data.type || 'MISSING_PERSON',
              nameOrItem: data.nameOrItem || data.name || 'Unknown',
              ageOrDescription: data.ageOrDescription || data.description || 'No description',
              lastKnownLocation: data.lastKnownLocation || data.lastSeenLocation || 'Sangam Ghat',
              reportedTime: data.reportedAt?.toDate
                ? data.reportedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recently',
              contactNumber: data.contactNumber || data.contactPhone || '+91 94211 XXXXX',
              status: data.status || 'SEARCHING',
              assignedTeam: data.assignedTeam || 'Zonal Patrol Team 1',
              photoUrl: data.photoUrl,
            };
          });
          callback(items);
        },
        (err) => console.warn('[Firebase] LostFound listener error:', err)
      );
    } catch (e) {
      console.warn('[Firebase] LostFound subscription error:', e);
      return null;
    }
  },

  /**
   * Adds a new Lost & Found record directly to Firestore.
   */
  async addLostFound(report: Partial<LostFoundReport>): Promise<string | null> {
    if (!isFirebaseConfigured()) return null;
    try {
      const col = collection(db, 'lost_found');
      const docRef = await addDoc(col, {
        ...report,
        reportedAt: serverTimestamp(),
        source: 'AUTHORITY_DASHBOARD',
      });
      return docRef.id;
    } catch (e) {
      console.error('[Firebase] Error adding Lost & Found:', e);
      return null;
    }
  },

  /**
   * Resolves or updates a Lost & Found case.
   */
  async updateLostFoundStatus(id: string, status: string): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;
    try {
      const docRef = doc(db, 'lost_found', id);
      await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
      return true;
    } catch (e) {
      console.warn('[Firebase] Error updating Lost & Found status:', e);
      return false;
    }
  },

  // ─── REAL-TIME CROWD & YOLO TRACKING ───────────────────────────────────────

  /**
   * Subscribes to real-time crowd updates emitted from camera detectors into Firestore.
   * Enables the deployed dashboard to receive instant live people counts globally
   * without relying on local network tunnels.
   */
  subscribeToCrowdZones(callback: (zonesData: Record<string, { people: number; density: string }>) => void): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const col = collection(db, 'crowd_zones');
      return onSnapshot(
        col,
        (snap) => {
          const map: Record<string, { people: number; density: string }> = {};
          snap.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const zoneCode = data.zone || docSnap.id;
            const p = typeof data.people === 'number' ? data.people : parseInt(String(data.people ?? '0'), 10);
            const entry = {
              people: isNaN(p) ? 0 : p,
              density: String(data.density || 'LOW').toUpperCase(),
            };
            map[zoneCode] = entry;
            map[docSnap.id] = entry;
          });
          callback(map);
        },
        (err) => console.warn('[Firebase] Crowd zones listener error:', err)
      );
    } catch (e) {
      console.warn('[Firebase] Crowd zones subscription error:', e);
      return null;
    }
  },
};

export default firebaseDashboardService;
