// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbJ-XmKOAG5H_UGfe837FugGeOkxJsHd4",
  authDomain: "artistlist-ef142.firebaseapp.com",
  projectId: "artistlist-ef142",
  storageBucket: "artistlist-ef142.firebasestorage.app",
  messagingSenderId: "88675009321",
  appId: "1:88675009321:web:9101a114f3ed681b212d38",
  measurementId: "G-D3ZXTW1JWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const storage = getStorage(app);

export { storage, analytics };