import { boot } from "quasar/wrappers";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

//set vars for process.env
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  //measurementId: process.env.MENSURAMENT_ID,
};

// Use this to initialize the firebase App
const firebase = initializeApp(firebaseConfig);
const firebaseAuth = getAuth();

export default boot(({ app, router, store }) => {
  app.config.globalProperties.$firebase = firebase;
  app.config.globalProperties.$firebaseAuth = firebaseAuth;
  app.provide("firebase", app.config.globalProperties.$firebase);
});

export { firebase };
