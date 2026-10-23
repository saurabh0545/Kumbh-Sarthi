import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import db, { isFirebaseConfigured } from '@/config/firebase';

export interface FirebaseSosPayload {
  id?: string;
  userId: number | string;
  userName: string;
  userPhone?: string;
  locationName: string;
  latitude: number;
  longitude: number;
  zone?: string;
  status?: 'ACTIVE' | 'RESPONDING' | 'RESOLVED';
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  type?: 'MEDICAL' | 'POLICE' | 'CROWD_SURGE' | 'LOST_CHILD' | 'SOS';
  notes?: string;
  createdAt?: any;
}

export interface FirebaseAlertDoc {
  id?: string;
  title: string;
  message: string;
  type: 'CROWD' | 'SAFETY' | 'EMERGENCY' | 'FAMILY' | 'INFO';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string;
  zone?: string;
  isSystem?: boolean;
  createdAt?: any;
}

export interface FirebaseLostFoundDoc {
  id?: string;
  name: string;
  type: 'person' | 'child' | 'item';
  category?: string;
  description: string;
  lastSeenLocation: string;
  lastSeenZone?: string;
  contactPhone: string;
  status: 'missing' | 'found' | 'resolved';
  photoUrl?: string;
  reportedBy?: string;
  reportedAt?: any;
}

export const firebaseService = {
  /**
   * Returns true if valid Firebase configuration is detected
   */
  isConfigured(): boolean {
    return isFirebaseConfigured();
  },

  /**
   * Broadcasts a Pilgrim SOS directly into Firestore "sos_incidents"
   * The Authority Control Center website receives this instantly in real-time.
   */
  async triggerSos(payload: FirebaseSosPayload): Promise<string | null> {
    if (!isFirebaseConfigured()) {
      console.log('[Firebase SOS] Firebase not configured yet, skipping Firestore write.');
      return null;
    }
    try {
      const sosCol = collection(db, 'sos_incidents');
      const docRef = await addDoc(sosCol, {
        userId: payload.userId,
        userName: payload.userName || 'Pilgrim',
        userPhone: payload.userPhone || '+91 98230 XXXXX',
        locationName: payload.locationName || 'Kumbh Sacred Grounds',
        latitude: payload.latitude,
        longitude: payload.longitude,
        zone: payload.zone || 'Gate-A',
        status: payload.status || 'ACTIVE',
        severity: payload.severity || 'CRITICAL',
        type: payload.type || 'SOS',
        notes: payload.notes || 'Emergency SOS triggered from mobile application',
        createdAt: serverTimestamp(),
        source: 'MOBILE_APP',
      });
      console.log('[Firebase SOS] Created live SOS incident:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[Firebase SOS] Error writing to Firestore:', error);
      return null;
    }
  },

  /**
   * Subscribes to live public alerts broadcasted by authorities from the website.
   * Runs in real-time using Firestore onSnapshot.
   */
  subscribeToAlerts(callback: (alerts: FirebaseAlertDoc[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const col = collection(db, 'alerts');
      return onSnapshot(
        col,
        (snapshot) => {
          const alerts: FirebaseAlertDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            let dateStr = new Date().toISOString();
            if (data.createdAt?.toDate) {
              dateStr = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
              dateStr = data.createdAt;
            }
            return {
              id: docSnap.id,
              title: data.title || 'Official Kumbh Alert',
              message: data.message || '',
              type: data.type || 'INFO',
              severity: data.severity || 'INFO',
              location: data.location || data.zone || 'All Zones',
              zone: data.zone || 'Gate-A',
              isSystem: data.isSystem ?? true,
              createdAt: dateStr,
            };
          });
          // Sort in memory newest first
          alerts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          callback(alerts);
        },
        (error) => {
          console.warn('[Firebase] Alerts snapshot listener warning:', error);
        }
      );
    } catch (error) {
      console.warn('[Firebase] Failed to attach alert listener:', error);
      return null;
    }
  },

  /**
   * Subscribes to Lost & Found registry updates in real-time.
   */
  subscribeToLostFound(callback: (items: FirebaseLostFoundDoc[]) => void): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    try {
      const q = query(collection(db, 'lost_found'), orderBy('reportedAt', 'desc'), limit(40));
      return onSnapshot(
        q,
        (snapshot) => {
          const items: FirebaseLostFoundDoc[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name,
              type: data.type || 'person',
              category: data.category,
              description: data.description || '',
              lastSeenLocation: data.lastSeenLocation || '',
              lastSeenZone: data.lastSeenZone,
              contactPhone: data.contactPhone || '',
              status: data.status || 'missing',
              photoUrl: data.photoUrl,
              reportedBy: data.reportedBy,
              reportedAt: data.reportedAt?.toDate ? data.reportedAt.toDate().toISOString() : new Date().toISOString(),
            };
          });
          callback(items);
        },
        (err) => {
          console.warn('[Firebase] LostFound snapshot error:', err);
        }
      );
    } catch (e) {
      console.warn('[Firebase] Failed to attach lost/found listener:', e);
      return null;
    }
  },

  /**
   * Report a lost or found person/item from mobile app into Firestore.
   */
  async reportLostFound(item: FirebaseLostFoundDoc): Promise<string | null> {
    if (!isFirebaseConfigured()) return null;
    try {
      const colRef = collection(db, 'lost_found');
      const docRef = await addDoc(colRef, {
        ...item,
        reportedAt: serverTimestamp(),
        source: 'MOBILE_APP',
      });
      return docRef.id;
    } catch (e) {
      console.error('[Firebase] Failed to report lost/found:', e);
      return null;
    }
  },

  /**
   * Update real-time GPS location of a pilgrim in their family group.
   */
  async updateLiveLocation(userId: number | string, data: { latitude: number; longitude: number; locationName?: string }): Promise<void> {
    if (!isFirebaseConfigured()) return;
    try {
      const docRef = doc(db, 'pilgrim_locations', String(userId));
      await setDoc(
        docRef,
        {
          userId,
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: data.locationName || 'Nashik Kumbh Mela Grounds',
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Firebase] Location sync error:', e);
    }
  },

  /**
   * Syncs authenticated user profile to Firebase Firestore "users" collection.
   */
  async syncUserProfile(user: { id?: number | string; name: string; email: string; role?: string }): Promise<void> {
    if (!isFirebaseConfigured() || !user || !user.email) return;
    try {
      const docId = user.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const userRef = doc(db, 'users', docId);
      await setDoc(
        userRef,
        {
          id: user.id || 1,
          name: user.name,
          email: user.email.toLowerCase(),
          role: user.role || 'PILGRIM',
          lastActive: serverTimestamp(),
          source: 'MOBILE_APP',
        },
        { merge: true }
      );
      console.log('[Firebase] User profile synchronized to Firestore:', user.email);
    } catch (e) {
      console.warn('[Firebase] User sync notice:', e);
    }
  },

  // ─── REAL-TIME FAMILY CONNECT & LOCATION SHARING ──────────────────────────

  /**
   * Joins or registers a user inside a family group identified by code.
   * Stored in Firestore collection: "family_groups/{code}/members/{userId}"
   */
  async joinOrUpdateFamilyMember(
    groupCode: string,
    groupName: string,
    member: {
      userId: number | string;
      name: string;
      relation?: string;
      status?: 'SAFE' | 'SOS';
      isLocationShared?: boolean;
      latitude?: number;
      longitude?: number;
      lastSeenLocation?: string;
    }
  ): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;
    const sanitizedCode = groupCode.trim().toUpperCase();
    try {
      // 1. Ensure family group document exists
      const groupDocRef = doc(db, 'family_groups', sanitizedCode);
      await setDoc(
        groupDocRef,
        {
          code: sanitizedCode,
          name: groupName || `Family Group (${sanitizedCode})`,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2. Add or update member in subcollection
      const memberDocRef = doc(db, 'family_groups', sanitizedCode, 'members', String(member.userId));
      await setDoc(
        memberDocRef,
        {
          id: String(member.userId),
          userId: member.userId,
          name: member.name || `Member #${member.userId}`,
          relation: member.relation || 'Member',
          status: member.status || 'SAFE',
          isLocationShared: member.isLocationShared ?? true,
          latitude: member.latitude ?? 19.9984,
          longitude: member.longitude ?? 73.7915,
          lastSeenLocation: member.lastSeenLocation || 'Ramkund Sacred Grounds',
          lastUpdated: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`[Firebase] Member ${member.name} joined family group: ${sanitizedCode}`);
      return true;
    } catch (e) {
      console.warn('[Firebase] Error joining family group:', e);
      return false;
    }
  },

  /**
   * Real-time listener for all connected members in a family group.
   * Triggers instantaneously whenever any member connects, moves, or changes status.
   */
  subscribeToFamilyGroup(
    groupCode: string,
    callback: (data: { groupName: string; groupCode: string; members: any[] }) => void
  ): Unsubscribe | null {
    if (!isFirebaseConfigured()) return null;
    const sanitizedCode = groupCode.trim().toUpperCase();
    try {
      const membersCol = collection(db, 'family_groups', sanitizedCode, 'members');
      return onSnapshot(
        membersCol,
        (snapshot) => {
          const membersList = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId || d.id,
              name: data.name || 'Family Member',
              relation: data.relation || 'Member',
              status: data.status || 'SAFE',
              isLocationShared: data.isLocationShared ?? true,
              latitude: data.latitude,
              longitude: data.longitude,
              lastSeenLocation: data.lastSeenLocation || 'Kumbh Sacred Grounds',
              lastUpdated: data.lastUpdated || 'Active now',
            };
          });

          callback({
            groupCode: sanitizedCode,
            groupName: `Family Group (${sanitizedCode})`,
            members: membersList,
          });
        },
        (err) => console.warn('[Firebase] Family subscription warning:', err)
      );
    } catch (e) {
      console.warn('[Firebase] Failed to attach family listener:', e);
      return null;
    }
  },

  /**
   * Updates a member's real-time live GPS coordinates in the family group.
   */
  async updateFamilyMemberLocation(
    groupCode: string,
    userId: number | string,
    data: {
      latitude: number;
      longitude: number;
      locationName?: string;
      isLocationShared?: boolean;
    }
  ): Promise<void> {
    if (!isFirebaseConfigured()) return;
    const sanitizedCode = groupCode.trim().toUpperCase();
    try {
      const memberDocRef = doc(db, 'family_groups', sanitizedCode, 'members', String(userId));
      await setDoc(
        memberDocRef,
        {
          latitude: data.latitude,
          longitude: data.longitude,
          lastSeenLocation: data.locationName || 'Live GPS Location',
          isLocationShared: data.isLocationShared ?? true,
          lastUpdated: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Firebase] Error updating family location:', e);
    }
  },

  /**
   * Triggers an emergency SOS for a family member.
   * Instantly broadcasts to everyone connected to that family code.
   */
  async triggerFamilyMemberSos(
    groupCode: string,
    userId: number | string,
    data: {
      userName: string;
      latitude?: number;
      longitude?: number;
      locationName?: string;
    }
  ): Promise<void> {
    if (!isFirebaseConfigured()) return;
    const sanitizedCode = groupCode.trim().toUpperCase();
    try {
      const memberDocRef = doc(db, 'family_groups', sanitizedCode, 'members', String(userId));
      await setDoc(
        memberDocRef,
        {
          status: 'SOS',
          lastSeenLocation: data.locationName || 'Emergency at Sacred Grounds',
          lastUpdated: '🚨 SOS ALERT JUST NOW',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Also publish to global SOS incidents
      await this.triggerSos({
        userId,
        userName: data.userName,
        locationName: data.locationName || 'Kumbh Family SOS',
        latitude: data.latitude || 19.9984,
        longitude: data.longitude || 73.7915,
        type: 'SOS',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        notes: `Family group ${sanitizedCode} SOS triggered`,
      });
    } catch (e) {
      console.warn('[Firebase] Error triggering family SOS:', e);
    }
  },
};

export default firebaseService;
