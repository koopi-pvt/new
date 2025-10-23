import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDcBmNXdT_cdiBEDQhAfsOKhNH17EpfIWQ",
  authDomain: "guru-ee9f7.firebaseapp.com",
  projectId: "guru-ee9f7",
  storageBucket: "guru-ee9f7.firebasestorage.app",
  messagingSenderId: "455506336446",
  appId: "1:455506336446:web:cfa2b805aa97065a491cef",
  measurementId: "G-2R2BYPZRBL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };