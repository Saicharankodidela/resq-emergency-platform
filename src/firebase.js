import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyATkOvg446a37zvMUA0iHMZrJDkR7rBL5k",
  authDomain: "resq-67c30.firebaseapp.com",
  projectId: "resq-67c30",
  storageBucket: "resq-67c30.firebasestorage.app",
  messagingSenderId: "236858907242",
  appId: "1:236858907242:web:e52a2d436b54e0fe854813",
  measurementId: "G-B1PQR0E05D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// Firebase Cloud Messaging token retrieval
export const getFCMToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BGzghndVIHsni5rEEsB1t6a9_DRalhLZX4SDG-EYT2-Os8Ro6NSQiK9KS2MR20DD6MsBgcHYIa_eS3A1Yb8u_DM' // You need to generate this in Firebase Console
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });