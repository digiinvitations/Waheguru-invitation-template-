import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

export const OFFICIAL_DOC_ID = "NEW TEMPLATE FOR 7";
export const OFFICIAL_HASH = "rl2cohqvo2tuixw5mclqfx-14313311583";

// Generate a unique ID based on the environment to prevent remixes from overwriting each other's data.
export function getEnvironmentDocId(): string {
  if (typeof window === 'undefined') return OFFICIAL_DOC_ID;

  // Check if user set a custom slot override in localStorage
  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim()) {
      return customSlot.trim();
    }
  } catch (e) {
    // localStorage might be unavailable in some sandboxes
  }

  const hostname = window.location.hostname;
  
  // Match AI Studio preview URLs: ais-dev-HASH... or ais-pre-HASH...
  const match = hostname.match(/ais-(?:dev|pre)-([^.]+)/);
  if (match) {
    // Exact official website hash
    if (match[1] === OFFICIAL_HASH) {
      return OFFICIAL_DOC_ID;
    }
    // Any remix in AI Studio gets its own unique, isolated slot based on its hash
    return `wedding_data_${match[1]}`;
  }

  // If running locally (localhost)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "wedding_data_local";
  }

  // Deployed to Vercel/Netlify or custom domain: isolate by domain name
  const cleanDomain = hostname.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `wedding_data_${cleanDomain}`;
}

export function isOfficialInstance(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  const match = hostname.match(/ais-(?:dev|pre)-([^.]+)/);
  return !!(match && match[1] === OFFICIAL_HASH);
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
  if (typeof window === 'undefined') return "rsvps";

  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim()) {
      return `rsvps_${customSlot.trim()}`;
    }
  } catch (e) {}

  const hostname = window.location.hostname;
  const match = hostname.match(/ais-(?:dev|pre)-([^.]+)/);
  if (match) {
    if (match[1] === OFFICIAL_HASH) {
      return `rsvps_${OFFICIAL_HASH}`;
    }
    return `rsvps_${match[1]}`;
  }
  const cleanDomain = hostname.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `rsvps_${cleanDomain}`;
}

export async function getWeddingData(): Promise<WeddingData> {
  try {
    const slotId = getEnvironmentDocId();
    const docRef = doc(db, "weddingConfig", slotId);
    const docSnap = await getDoc(docRef);

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
      // Initialize new slot:
      // If this is a remix, clone the official template so all uploaded media/videos/details are inherited,
      // but saved to this new isolated slot so the official website is never touched!
      let initialData: WeddingData = defaultData;
      if (slotId !== OFFICIAL_DOC_ID) {
        try {
          const masterDocRef = doc(db, "weddingConfig", OFFICIAL_DOC_ID);
          const masterSnap = await getDoc(masterDocRef);
          if (masterSnap.exists()) {
            initialData = masterSnap.data() as WeddingData;
          }
        } catch (err) {
          console.warn("Could not copy initial data from official master, using defaultData", err);
        }
      }

      await setDoc(docRef, initialData);
      return initialData;
    }
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData;
  }
}

export async function saveWeddingData(data: WeddingData): Promise<void> {
  const slotId = getEnvironmentDocId();
  const docRef = doc(db, "weddingConfig", slotId);
  await setDoc(docRef, data);
}

export async function submitRSVP(rsvpData: any): Promise<void> {
  const collectionName = getRsvpCollectionName();
  const rsvpCollection = collection(db, collectionName);
  await addDoc(rsvpCollection, {
    ...rsvpData,
    submittedAt: new Date().toISOString()
  });
}

export async function getRSVPs(): Promise<any[]> {
  try {
    const collectionName = getRsvpCollectionName();
    const rsvpCollection = collection(db, collectionName);
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
