// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDl33bgMslmX-RV5Qq4ocg9yH65pw1kaUU",
	authDomain: "opnr-d53f1.firebaseapp.com",
	databaseURL: "https://opnr-d53f1-default-rtdb.firebaseio.com",
	projectId: "opnr-d53f1",
	storageBucket: "opnr-d53f1.appspot.com",
	messagingSenderId: "311227355424",
	appId: "1:311227355424:web:a25a1496d14ccc0a668745",
	measurementId: "G-S38ED17LJP"
};

var app;
// Initialize Firebase
if (!app) {
	app = initializeApp(firebaseConfig);
}

export { app as firebase };
