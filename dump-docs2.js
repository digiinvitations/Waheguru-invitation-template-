import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
  const docSnap = await getDoc(doc(db, "weddingConfig", "NEW TEMPLATE FOR 7"));
  console.log("=== NEW TEMPLATE FOR 7 ===");
  console.log(JSON.stringify(docSnap.data(), null, 2));

  process.exit(0);
}

run();
