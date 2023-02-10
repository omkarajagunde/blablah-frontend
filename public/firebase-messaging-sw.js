// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
	messagingSenderId: "40911931240"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function (payload) {
	console.log("[firebase-messaging-sw.js] Received background message ", payload);
	// Customize notification here
	const notificationTitle = "Background Message Title";
	const notificationOptions = {
		body: "Background Message body."
	};

	//return self.registration.showNotification(notificationTitle, notificationOptions);

	return self.registration.hideNotification();
});

self.addEventListener("push", function (event) {
	console.info("Event: Push", event.data.json());
	let data = event.data.json().data;
	let notification = event.data.json().notification;
	var title = notification.title,
		body = {
			//tag: "notification-1",
			icon: "./favicon.ico",
			vibrate: [200, 100, 200, 100, 200, 100, 200],
			notification: {
				sound: "default"
			},
			data: data,
			body: notification.body
		};

	event.waitUntil(self.registration.showNotification(title, body));
});

self.addEventListener("notificationclick", function (event) {
	var url = event.data?.click_link || "https://blablah.app/live";

	//---close the notification---
	event.notification.close();

	//---open the app and navigate to breaking.html
	// after clicking the notification---
	event.waitUntil(clients.openWindow(url));
});
// [END background_handler]
