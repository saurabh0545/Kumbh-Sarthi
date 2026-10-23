import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamilyMemberItem, INITIAL_MOCK_FAMILY } from '@/data/mock-data';

export const STORAGE_KEY_SAVED_FAMILY = '@kumbh_saved_family_group';

export interface SavedFamilyData {
  groupName: string;
  groupCode: string;
  members: FamilyMemberItem[];
  isCustom: boolean;
  updatedAt?: string;
}

export async function getSavedFamily(): Promise<SavedFamilyData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SAVED_FAMILY);
    if (raw) {
      return JSON.parse(raw) as SavedFamilyData;
    }
  } catch (e) {
    console.warn('[familyStorage] Failed to load saved family:', e);
  }
  return null;
}

export async function saveFamily(data: SavedFamilyData): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY_SAVED_FAMILY,
      JSON.stringify({ ...data, updatedAt: new Date().toISOString() })
    );
  } catch (e) {
    console.warn('[familyStorage] Failed to save family:', e);
  }
}

export async function clearSavedFamily(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_SAVED_FAMILY);
  } catch (e) {
    console.warn('[familyStorage] Failed to clear saved family:', e);
  }
}
