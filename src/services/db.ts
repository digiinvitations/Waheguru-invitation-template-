import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

// Unified Canonical Document ID for this wedding
export const OFFICIAL_DOC_ID = "wedding_data_jaspreet_weds_jasmeet";
export const CANONICAL_DOC_ID = "wedding_data_jaspreet_weds_jasmeet";

// Known fallback/legacy slots to keep synchronized across Vercel hosting, AI Studio, and local testing
export const SYNC_TARGET_DOC_IDS = [
  "wedding_data_jaspreet_weds_jasmeet",
  "wedding_data_draft-invitation-for-jaspreet-weds_vercel_app",
  "wedding_data_wjhktkcue5d2mszgfuvmql-14313311583",
  "wedding_data_local",
  "NEW TEMPLATE FOR 7"
];

// Generate or retrieve the active database slot ID
export function getEnvironmentDocId(): string {
  if (typeof window === 'undefined') return CANONICAL_DOC_ID;

  // 1. Check if user specified an explicit custom slot override in localStorage
  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim() && customSlot.trim() !== "auto") {
      return customSlot.trim();
    }
  } catch (e) {
    // localStorage might be unavailable in some sandboxes
  }

  // 2. Check for explicit environment variable override if provided
  const envSlot = (import.meta as any).env?.VITE_WEDDING_DOC_ID;
  if (envSlot && typeof envSlot === "string" && envSlot.trim()) {
    return envSlot.trim();
  }

  // 3. Default: Both Vercel hosting and AI Studio development connect to the unified canonical document
  return CANONICAL_DOC_ID;
}

export function isOfficialInstance(): boolean {
  return true;
}

export function setCustomSlotId(slotId: string) {
  if (typeof window === 'undefined') return;
  try {
    if (slotId && slotId.trim()) {
      localStorage.setItem("wedding_custom_slot_id", slotId.trim());
    } else {
      localStorage.removeItem("wedding_custom_slot_id");
    }
  } catch (e) {}
}

export function getRsvpCollectionName(): string {
  return "rsvps";
}

export async function getWeddingData(): Promise<WeddingData> {
  try {
    const slotId = getEnvironmentDocId();
    const docRef = doc(db, "weddingConfig", slotId);
    let docSnap = await getDoc(docRef);

    // If active slot is empty or missing, search fallback target slots
    if (!docSnap.exists()) {
      for (const fallbackId of SYNC_TARGET_DOC_IDS) {
        if (fallbackId === slotId) continue;
        try {
          const fallbackRef = doc(db, "weddingConfig", fallbackId);
          const fallbackSnap = await getDoc(fallbackRef);
          if (fallbackSnap.exists()) {
            docSnap = fallbackSnap;
            // Seed the current slot with the found data
            try {
              await setDoc(docRef, fallbackSnap.data());
            } catch (e) {}
            break;
          }
        } catch (err) {
          // ignore lookup errors on individual fallbacks
        }
      }
    }

    if (docSnap.exists()) {
      const remoteData = docSnap.data() as WeddingData;
      if (remoteData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
        remoteData.heroLogoUrl = "/ikonkar-gold.svg";
      }
      return {
        ...defaultData,
        ...remoteData,
        invitedBy: remoteData.invitedBy || defaultData.invitedBy,
        familyRegards: remoteData.familyRegards || defaultData.familyRegards,
        rsvpAddress: remoteData.rsvpAddress || defaultData.rsvpAddress,
        rsvpPhones: remoteData.rsvpPhones && remoteData.rsvpPhones.length > 0 ? remoteData.rsvpPhones : defaultData.rsvpPhones,
      };
    } else {
      // Initialize with defaultData
      await setDoc(docRef, defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData;
  }
}

export async function saveWeddingData(data: WeddingData): Promise<void> {
  const cleanData = { ...data };
  if (cleanData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
    cleanData.heroLogoUrl = "/ikonkar-gold.svg";
  }

  const slotId = getEnvironmentDocId();
  const docRef = doc(db, "weddingConfig", slotId);
  await setDoc(docRef, cleanData);

  // Synchronize across all known legacy and Vercel slots so every hosting link stays updated
  const syncTargets = Array.from(new Set([
    ...SYNC_TARGET_DOC_IDS,
    slotId
  ]));

  const syncPromises = syncTargets.map(id => 
    setDoc(doc(db, "weddingConfig", id), cleanData).catch(e => {
      console.warn(`Sync warning for ${id}:`, e);
    })
  );

  await Promise.allSettled(syncPromises);
}

export async function submitRSVP(rsvpData: any): Promise<void> {
  const slotId = getEnvironmentDocId();
  const rsvpCollection = collection(db, "weddingConfig", slotId, "rsvps");
  await addDoc(rsvpCollection, {
    ...rsvpData,
    submittedAt: new Date().toISOString()
  });
}

export async function getRSVPs(): Promise<any[]> {
  try {
    const slotId = getEnvironmentDocId();
    const rsvpCollection = collection(db, "weddingConfig", slotId, "rsvps");
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
