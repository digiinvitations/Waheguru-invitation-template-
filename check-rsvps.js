import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfG-dTlC3EBkk9p2TJBy3X92-HO4PZOWU",
  authDomain: "english-wedding-template.firebaseapp.com",
  projectId: "english-wedding-template",
  storageBucket: "english-wedding-template.firebasestorage.app",
  messagingSenderId: "467267427353",
  appId: "1:467267427353:web:0c968d348d43d3784b9e88"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const collectionsToCheck = [
    "rsvps",
    "rsvps_production",
    "rsvps_rl2cohqvo2tuixw5mclqfx-14313311583",
    "rsvps_NEW TEMPLATE FOR 7"
  ];
  for (const c of collectionsToCheck) {
    try {
      const snap = await getDocs(collection(db, c));
      console.log(`Collection "${c}": ${snap.size} documents`);
      snap.forEach(d => console.log(`  [${d.id}]:`, d.data()));
    } catch (e) {
      console.log(`Error checking ${c}:`, e.message);
    }
  }
  process.exit(0);
}
run();
