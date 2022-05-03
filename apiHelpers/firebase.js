// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVjZOtAYXNE6Hvqya-0v0NRo4QdzNWRDc",
  authDomain: "blablah-27700.firebaseapp.com",
  projectId: "blablah-27700",
  storageBucket: "blablah-27700.appspot.com",
  messagingSenderId: "954222258538",
  appId: "1:954222258538:web:54c72115cecee0afdfdd13",
  measurementId: "G-Y56FZ0BQNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }