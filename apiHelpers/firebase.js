// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, isSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDN_oYWR-PGvV4LqUu1ymY607MmpDqIe1g",
	authDomain: "blablah-7dcab.firebaseapp.com",
	projectId: "blablah-7dcab",
	storageBucket: "blablah-7dcab.appspot.com",
	messagingSenderId: "1077605575017",
	appId: "1:1077605575017:web:55637bb2c982d5e36b35f8",
	measurementId: "G-97F16HF9GJ"
};

var app, messaging;
// Initialize Firebase
(async () => {
	if (!app) {
		app = initializeApp(firebaseConfig);
	}
	if (!messaging && app && (await isSupported())) {
		messaging = getMessaging(app);
	}
})();

export { app as firebase, messaging };
