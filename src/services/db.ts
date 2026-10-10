import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

// Dedicated Master Document ID for this official wedding website
// This isolated document ID ensures ZERO overlap with any past or future remix.
export const OFFICIAL_MASTER_DOC_ID = "wedding_official_master_jaspreet_weds_jasmeet";
export const OFFICIAL_DOC_ID = OFFICIAL_MASTER_DOC_ID;
export const CANONICAL_DOC_ID = OFFICIAL_MASTER_DOC_ID;

// Known host identifiers for the original official wedding
const OFFICIAL_HOST_SIGNATURES = [
  "493233c0", // AI Studio applet instance ID
  "wjhktkcue5d2mszgfuvmql", // AI Studio container hash of this original master applet
  "draft-invitation-for-jaspreet-weds", // Official Vercel production deployment
  "jaspreet-weds-jasmeet", // Canonical custom domain
];

// Determine if the current environment is the original master website
export function isOfficialInstance(): boolean {
  if (typeof window === "undefined") return true;

  const hostname = window.location.hostname.toLowerCase();
  
  // Local development is treated as the official development environment
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  return OFFICIAL_HOST_SIGNATURES.some((sig) => hostname.includes(sig));
}

// Generates or retrieves a persistent, isolated slot ID for a remix instance
function getRemixSlotId(): string {
  if (typeof window === "undefined") return "remix_isolated_template";

  try {
    const existing = localStorage.getItem("wedding_isolated_remix_slot_id");
    if (existing && existing.trim()) {
      return sanitizeSlotId(existing.trim());
    }
  } catch (e) {}

  const hostname = window.location.hostname.toLowerCase();
  let slotName = "";
  if (hostname && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
    slotName = `remix_${hostname.replace(/[^a-z0-9]/g, "_")}`;
  } else {
    slotName = `remix_${Math.random().toString(36).substring(2, 9)}`;
  }

  try {
    localStorage.setItem("wedding_isolated_remix_slot_id", slotName);
  } catch (e) {}

  return sanitizeSlotId(slotName);
}

// Generate or retrieve the active, isolated database slot ID
export function getEnvironmentDocId(): string {
  if (typeof window === "undefined") return OFFICIAL_MASTER_DOC_ID;

  // 1. If this is the official original website:
  if (isOfficialInstance()) {
    try {
      const customSlot = localStorage.getItem("wedding_custom_slot_id");
      if (customSlot && customSlot.trim() && customSlot.trim() !== "auto") {
        return sanitizeSlotId(customSlot.trim());
      }
    } catch (e) {}
    return OFFICIAL_MASTER_DOC_ID;
  }

  // 2. This is a REMIX instance!
  // Check if a custom slot was assigned, otherwise use an isolated remix slot
  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim() && customSlot.trim() !== "auto") {
      const sanitized = sanitizeSlotId(customSlot.trim());
      // Prevent any remix from accidentally hijacking the official master document
      if (sanitized !== OFFICIAL_MASTER_DOC_ID) {
        return sanitized;
      }
    }
  } catch (e) {}

  return getRemixSlotId();
}

// Sanitize slot ID for Firestore document path requirements
function sanitizeSlotId(raw: string): string {
  return raw.replace(/[\/\s#?\[\]]/g, "_");
}

export function setCustomSlotId(slotId: string) {
  if (typeof window === "undefined") return;
  try {
    if (slotId && slotId.trim()) {
      localStorage.setItem("wedding_custom_slot_id", sanitizeSlotId(slotId.trim()));
    } else {
      localStorage.removeItem("wedding_custom_slot_id");
    }
  } catch (e) {}
}

export function getRsvpCollectionName(): string {
  return "rsvps";
}

/**
 * Fetch wedding data for the current active slot.
 * - For the official master site, loads the official master document.
 * - For a remix, loads the isolated remix slot (or seeds it with default template without touching the official site).
 */
export async function getWeddingData(): Promise<WeddingData> {
  try {
    const slotId = getEnvironmentDocId();
    const docRef = doc(db, "weddingConfig", slotId);
    const docSnap = await getDoc(docRef);

    // If the slot document does not exist yet in Firestore, initialize it
    if (!docSnap.exists()) {
      try {
        await setDoc(docRef, defaultData);
      } catch (e) {
        console.warn("Failed to initialize slot in Firestore:", e);
      }
      return defaultData;
    }

    // Slot document exists: load it and merge with defaults
    const remoteData = docSnap.data() as WeddingData;
    if (remoteData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
      remoteData.heroLogoUrl = "/ikonkar-gold.svg";
    }

    return {
      ...defaultData,
      ...remoteData,
      invitedBy: remoteData.invitedBy !== undefined ? remoteData.invitedBy : defaultData.invitedBy,
      familyRegards: remoteData.familyRegards || defaultData.familyRegards,
      rsvpAddress: remoteData.rsvpAddress || defaultData.rsvpAddress,
      rsvpPhones: remoteData.rsvpPhones && remoteData.rsvpPhones.length > 0 ? remoteData.rsvpPhones : defaultData.rsvpPhones,
    };
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData;
  }
}

/**
 * Save wedding data with strict isolation:
 * - A remix writes ONLY to its own isolated slot.
 * - Non-official remix instances are blocked from writing to the official master document.
 * - This guarantees that remixes will NEVER overwrite or overlap with this website.
 */
export async function saveWeddingData(data: WeddingData): Promise<void> {
  const cleanData = { ...data };
  if (cleanData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
    cleanData.heroLogoUrl = "/ikonkar-gold.svg";
  }

  let slotId = getEnvironmentDocId();
  const isOfficial = isOfficialInstance();

  // Strict zero-overlap guarantee:
  // If not the official instance, NEVER allow writing to the official master document
  if (!isOfficial && slotId === OFFICIAL_MASTER_DOC_ID) {
    slotId = getRemixSlotId();
  }

  // Save directly to the current isolated slot
  const docRef = doc(db, "weddingConfig", slotId);
  await setDoc(docRef, cleanData);

  // If (and only if) this is the official original site on the canonical slot,
  // sync to the official production mirrors so they stay updated.
  if (isOfficial && slotId === OFFICIAL_MASTER_DOC_ID) {
    const officialSyncSlots = [
      "wedding_data_draft-invitation-for-jaspreet-weds_vercel_app",
      "wedding_data_wjhktkcue5d2mszgfuvmql-14313311583",
    ];

    const syncPromises = officialSyncSlots.map((targetId) =>
      setDoc(doc(db, "weddingConfig", targetId), cleanData).catch((e) => {
        console.warn(`Sync warning for official target ${targetId}:`, e);
      })
    );

    await Promise.allSettled(syncPromises);
  }
}

/**
 * Submit an RSVP to the isolated subcollection for this slot.
 */
export async function submitRSVP(rsvpData: any): Promise<void> {
  const slotId = getEnvironmentDocId();
  const rsvpCollection = collection(db, "weddingConfig", slotId, "rsvps");
  await addDoc(rsvpCollection, {
    ...rsvpData,
    submittedAt: new Date().toISOString(),
  });
}

/**
 * Retrieve RSVPs submitted specifically to this slot.
 */
export async function getRSVPs(): Promise<any[]> {
  try {
    const slotId = getEnvironmentDocId();
    const rsvpCollection = collection(db, "weddingConfig", slotId, "rsvps");
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
