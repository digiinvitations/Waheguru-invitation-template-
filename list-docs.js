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
  const querySnapshot = await getDocs(collection(db, "weddingConfig"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => `, Object.keys(doc.data()));
    // Let's print the groom and bride names to see which one is which
    console.log(`  Groom: ${doc.data().groom?.name}, Bride: ${doc.data().bride?.name}`);
  });
  process.exit(0);
}

run();
