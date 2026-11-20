import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxf-JlSAhN-xoKsnAe867qzxGMxp1v7Mc",
  authDomain: "sistema-celulares-6ef6c.firebaseapp.com",
  databaseURL: "https://sistema-celulares-6ef6c-default-rtdb.firebaseio.com",
  projectId: "sistema-celulares-6ef6c",
  storageBucket: "sistema-celulares-6ef6c.appspot.com",
  messagingSenderId: "212311315454",
  appId: "1:212311315454:web:bc559765a084ffa0f4a6af",
  measurementId: "G-LNSRL590D6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;

