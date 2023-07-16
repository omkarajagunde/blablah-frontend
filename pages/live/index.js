import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getToken } from "firebase/messaging";
import _ from "lodash";
import Compressor from "compressorjs";
import TextareaAutosize from "react-textarea-autosize";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import socketIOClient from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import IdentityTab from "../../components/IdentityTab";
import useUpdateEffect from "../../components/_helpers/useUpdateEffect";
import AudioRecording from "../../components/AudioRecording";
import DisapperingImage from "../../components/DisapperingImage";
import PrivacyText from "../../components/PrivacyText";
import MicRecorder from "mic-recorder-to-mp3";

// Images
import SiteLogoWhite from "../../Resources/SiteLogoWhite.svg";
import SendIcon from "../../Resources/SendIcon.svg";
import ImageIcon from "../../Resources/ImageIcon.svg";
import MicIcon from "../../Resources/MicIcon.svg";
import MicCancel from "../../Resources/MicCancel.svg";
import ExpandCollapse from "../../Resources/expandCollapse.svg";

// Actions
import { ClearLiveChatLogs, IsServerOperational, GetTrends, AddNotifyToken } from "../../actions/liveChatActions";

// Styles
import styles from "../../styles/live.module.scss";
import Loader from "../../components/_helpers/Loader";
import { SEO } from "../../Resources/json-res";
import { messaging } from "../../apiHelpers/firebase";
import Script from "next/script";
// Socket event strings
const CLIENT_INTRODUCTION = "CLIENT_INTRODUCTION";
const PEER_STARTED_TYPING = "PEER_STARTED_TYPING";
const PEER_STOPPED_TYPING = "PEER_STOPPED_TYPING";
const SEND_MESSAGE = "SEND_MESSAGE";
const NEGATIVE_KEYWORD_EXCHANGE = "NEGATIVE_KEYWORD_EXCHANGE";
const END_CURRENT_SESSION = "END_CURRENT_SESSION";
const CLIENT_INTRODUCTION_PAIR_NOT_FOUND = "CLIENT_INTRODUCTION_PAIR_NOT_FOUND";

// New instance
const recorder = new MicRecorder({
	bitRate: 256
});

const debounce = (func, timeout = 300) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
};

function Index() {
	const dispatch = useDispatch();
	const router = useRouter();
	const LiveChatSelector = useSelector((state) => state.liveChat, _.isEqual);
	const [state, setState] = useState({
		isMobileView: false,
		isSenderTyping: false,
		isRulesViewOpen: false,
		isMyGenderSpecified: LiveChatSelector.identityObj.gender !== "any",
		isChatEnded: false,
		isUserImageCaptured: false,
		detectedGenderData: null,
		userFoundFlag: "",
		userSearchTryingCount: 0,
		isNewSessionStatus: "New",
		mySocketId: "",
		newTabs: ["Chat settings", "Identity"],
		settingsTabViewOptions: ["male", "female", "Any"],
		settingsTabIndex: 2,
		tabIndex: 0,
		commonInterestsArray: [],
		smartRepliesArray: ["", "", "", ""],
		restrictedModeKeywordsArray: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("restrictedModeNewKeywordsArray")) || [] : [],
		restrictedModeNewKeywordsArray: [],
		peerNegativeKeywordsArray: [],
		chatMessagesArray: [],
		pairedUserData: null,
		username: LiveChatSelector.identityObj.fullname,
		age: LiveChatSelector.identityObj.age,
		myInfo: null,
		expandSmartReply: false,
		showImageDisapperModal: false,
		showPrivacyModal: true,
		connectWithAnyone: true,

		// Audio related state vars
		isMicPressed: false,
		isMicRecording: false,
		isMicBlocked: false
	});
	const socketRef = useRef();
	const userFoundRef = useRef();

	useUpdateEffect(() => {
		console.log("My ID :: ", state.mySocketId);
		setState((prevState) => ({
			...prevState,
			isNewSessionStatus: "New",
			expandSmartReply: false,
			isRulesViewOpen: false,
			userFoundFlag: "",
			userSearchTryingCount: 0,
			isChatEnded: false,
			pairedUserData: null,
			chatMessagesArray: [],
			isChatEndedWithError: null,
			showImageDisapperModal: false
		}));
		// const urlParams = new URLSearchParams(window.location.search);
		// let autoSearchStart = urlParams.get("autoStart");
		// if (autoSearchStart === "true" && state.mySocketId) {
		// 	handleChangeSessionStatus();
		// }
		document.getElementById("inputText").blur();
	}, [state.mySocketId]);

	useUpdateEffect(() => {
		if (state.pairedUserData) console.log("user found with socketId  :: ", state.pairedUserData?.mySocketId);
	}, [state.userFoundFlag]);

	useUpdateEffect(() => {
		if (LiveChatSelector.identityObj.fullname !== null) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, username: LiveChatSelector.identityObj.fullname }));
		}

		if (LiveChatSelector.identityObj.gender !== "any") {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, isMyGenderSpecified: true }));
		}
	}, [LiveChatSelector]);

	// Firebase web push notification permisson
	const requestPermission = () => {
		console.log("Requesting permission...");
		if (window.Notification && window.Notification.permission !== "granted") {
			window.Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					console.log("Notification permission granted.", messaging);
					getToken(messaging, {
						vapidKey: "BOGtzGsCB9AZbF5KFovswgc_cH2kvYiLXwgBN0YmgWTa1gfRmfi9xjjrygFAXiFR2idswZIFEVICVnppuS1YuqU"
					}).then((currentToken) => {
						console.log("tkn -- ", currentToken);
						if (currentToken) {
							dispatch(
								AddNotifyToken({
									token: currentToken,
									userAgent: navigator.userAgent
								})
							);
						} else {
							console.log("Can not get token");
						}
					});
				} else {
					console.log("Do not have permission!");
					alert("Please clear site data and accept notifications so that we can notify you once people are online to chat");
				}
			});
		}
	};

	const handleSocketEvent = (eve, data) => {
		setState((prevState) => ({ ...prevState, expandSmartReply: false }));
		if (eve === CLIENT_INTRODUCTION) {
			socketRef.current.emit(CLIENT_INTRODUCTION, {
				mySocketId: socketRef.current.id,
				action: CLIENT_INTRODUCTION,
				data: {
					interests: state.commonInterestsArray,
					genderInterest: state.settingsTabViewOptions[state.settingsTabIndex],
					peerFound: false,
					searchingPeer: true,
					peerSocketId: "",
					intersectedInterests: [],
					genderInterestFound: false,
					myGender: LiveChatSelector.identityObj?.gender,
					myAge: LiveChatSelector.identityObj?.age,
					myName: LiveChatSelector.identityObj?.fullname,
					connectWithAnyone: state.commonInterestsArray.length !== 0 ? state.connectWithAnyone : true
				}
			});
		}

		if (eve === PEER_STARTED_TYPING) {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer");
			let scrollElem = elemsArray[elemsArray.length - 1];
			// On mobile scroll to fix scrollIntoView we call it in setTimeOut when default keyboard is closed
			setTimeout(() => {
				if (scrollElem) scrollElem.scrollIntoView();
			}, 200);

			setTimeout(() => {
				if (typingContainer) typingContainer.scrollIntoView();
			}, 800);

			socketRef.current.emit(PEER_STARTED_TYPING, {
				socketId: socketRef.current.id,
				action: PEER_STARTED_TYPING,
				data: {
					typing: true,
					peerSocketId: state.pairedUserData?.mySocketId
				}
			});
		}

		if (eve === PEER_STOPPED_TYPING) {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer");
			let scrollElem = elemsArray[elemsArray.length - 1];
			// On mobile scroll to fix scrollIntoView we call it in setTimeOut when default keyboard is closed
			setTimeout(() => {
				if (scrollElem) scrollElem.scrollIntoView();
			}, 200);

			setTimeout(() => {
				if (typingContainer) typingContainer.scrollIntoView();
			}, 800);

			socketRef.current.emit(PEER_STOPPED_TYPING, {
				socketId: socketRef.current.id,
				action: PEER_STOPPED_TYPING,
				data: {
					typing: false,
					peerSocketId: state.pairedUserData?.mySocketId
				}
			});
		}

		if (eve === SEND_MESSAGE) {
			// TODO TRACKING EVENT : INFO Message Sent
			socketRef.current.emit(SEND_MESSAGE, {
				socketId: socketRef.current.id,
				action: SEND_MESSAGE,
				data: {
					chatData: data,
					peerSocketId: state.pairedUserData?.mySocketId
				}
			});
		}

		if (eve === NEGATIVE_KEYWORD_EXCHANGE) {
			socketRef.current.emit(NEGATIVE_KEYWORD_EXCHANGE, {
				socketId: socketRef.current.id,
				action: NEGATIVE_KEYWORD_EXCHANGE,
				data: {
					username: state.username,
					keywordsArray: state.restrictedModeKeywordsArray,
					peerSocketId: state.pairedUserData?.mySocketId
				}
			});
		}

		if (eve === END_CURRENT_SESSION) {
			document.getElementById("inputText").blur();
			socketRef.current.emit(END_CURRENT_SESSION, {
				socketId: socketRef.current.id,
				action: END_CURRENT_SESSION,
				data: {
					peerSocketId: state.pairedUserData?.mySocketId
				}
			});
		}
	};

	const handleInitSocketEvents = () => {
		socketRef.current = socketIOClient(process.env.NEXT_PUBLIC_SERVER_URL, {
			path: "/live",
			query: { token: window.tkn },
			transports: ["websocket", "polling", "flashsocket"],
			closeOnBeforeunload: false
		});

		socketRef.current.on("connect", () => {
			setState((prevState) => ({
				...prevState,
				mySocketId: socketRef.current.id,
				isChatEnded: false,
				isChatEndedWithError: null
			}));
		});

		socketRef.current.on("connect_error", (err) => {
			console.log(err);
			setState((prevState) => ({
				...prevState,
				isNewSessionStatus: "New",
				userFoundFlag: "",
				userSearchTryingCount: 0,
				isChatEnded: true,
				pairedUserData: null,
				chatMessagesArray: [],
				isChatEndedWithError: err + " Please check your network connection and try again "
			}));
		});

		socketRef.current.on(CLIENT_INTRODUCTION, (data) => {
			// TODO TRACKING EVENT : INFO Sessions Started
			console.log(data);

			let time = new Date();

			let mainMsg = "";
			let subMsg = "";

			if (data.data.intersectedInterests.length > 0) mainMsg = `Your interests \n` + `${data.data.intersectedInterests.map((interest) => `${interest}`)}\n`;

			if (data.data.genderInterestFound && data.data.myName) subMsg = ` connected with ${data.data.myName}, ${data.data.myGender}`;
			else if (data.data.genderInterestFound) subMsg = ` connected with ${data.data.myGender}`;
			else if (data.data.myName) subMsg = ` connected with ${data.data.myName}`;

			if (data.data.myAge) subMsg = subMsg + `, ${data.data.myAge}`;

			let intersectedInterestsMessage = {
				type: "received",
				isImage: false,
				isAudio: false,
				isAd: false,
				isMetadata: true,
				msg: `${mainMsg} ${subMsg}`,
				senderName: "",
				timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
				newlyAdded: true,
				retracted: false
			};

			let chatMessagesArray = [...state.chatMessagesArray, intersectedInterestsMessage];
			setState((prevState) => ({
				...prevState,
				userFoundFlag: true,
				pairedUserData: data,
				isNewSessionStatus: "Skip",
				chatMessagesArray
			}));
		});

		socketRef.current.on(CLIENT_INTRODUCTION_PAIR_NOT_FOUND, (data) => {
			console.log(CLIENT_INTRODUCTION_PAIR_NOT_FOUND);
			setState((prevState) => ({ ...prevState, userFoundFlag: false, pairedUserData: null }));
		});

		socketRef.current.on(NEGATIVE_KEYWORD_EXCHANGE, (data) => {
			setState((prevState) => ({ ...prevState, peerNegativeKeywordsArray: data.data.data.keywordsArray }));
		});

		socketRef.current.on(SEND_MESSAGE, (data) => {
			// TODO TRACKING EVENT : INFO Message Received
			if (window.navigator) window.navigator.vibrate(400);
			setState((prevState) => ({ ...prevState, chatMessagesArray: [...prevState.chatMessagesArray, data.chatData] }));
		});

		socketRef.current.on(PEER_STARTED_TYPING, (data) => {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer");
			let scrollElem = elemsArray[elemsArray.length - 1];
			// On mobile scroll to fix scrollIntoView we call it in setTimeOut when default keyboard is closed
			setTimeout(() => {
				if (scrollElem) scrollElem.scrollIntoView();
			}, 200);

			setTimeout(() => {
				if (typingContainer) typingContainer.scrollIntoView();
			}, 800);
			setState((prevState) => ({ ...prevState, isSenderTyping: data.typing }));
		});

		socketRef.current.on(PEER_STOPPED_TYPING, (data) => {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer");
			let scrollElem = elemsArray[elemsArray.length - 1];
			// On mobile scroll to fix scrollIntoView we call it in setTimeOut when default keyboard is closed
			setTimeout(() => {
				if (scrollElem) scrollElem.scrollIntoView();
			}, 200);

			setTimeout(() => {
				if (typingContainer) typingContainer.scrollIntoView();
			}, 800);
			setState((prevState) => ({ ...prevState, isSenderTyping: data.typing }));
		});

		socketRef.current.on(END_CURRENT_SESSION, (data) => {
			document.getElementById("inputText").blur();
			console.log("END_CURRENT_SESSION :: ", data);
			setState((prevState) => ({
				...prevState,
				isNewSessionStatus: "New",
				userFoundFlag: "",
				userSearchTryingCount: 0,
				isChatEnded: true,
				pairedUserData: null,
				chatMessagesArray: [],
				isChatEndedWith: data.data.data.myName || data.data.data.mySocketId || "Stranger",
				showImageDisapperModal: false,
				showPrivacyModal: false
			}));
		});
	};

	useUpdateEffect(() => {
		if (LiveChatSelector.isServerOperationalStatus === 200) {
			dispatch(ClearLiveChatLogs());
			// Get trending trends
			dispatch(GetTrends());
			handleInitSocketEvents();
			setState((prevState) => ({ ...prevState, myInfo: LiveChatSelector.isServerOperationalData }));
		}

		if (LiveChatSelector.isServerOperationalStatus === 600) {
			dispatch(ClearLiveChatLogs());
			if (confirm("Please check your internet connection, Click OK to refresh")) window.location.reload();
		}

		if (LiveChatSelector.detectedGenderStatus === 600) {
			dispatch(ClearLiveChatLogs());
			if (confirm("Please check your internet connection, Click OK to refresh")) window.location.reload();
		}

		if (LiveChatSelector.trendsStatus === 200) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, smartRepliesArray: LiveChatSelector.trendsData.data }));
		}

		if (LiveChatSelector.notifyTokenStatus === 200) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, notifyTokenData: LiveChatSelector.notifyTokenData.data }));
		}
	}, [LiveChatSelector]);

	// Run only first time when component loads
	useEffect(() => {
		// set initial level
		setState((prevState) => ({
			...prevState,
			username: LiveChatSelector.identityObj.fullname,
			age: LiveChatSelector.identityObj.age,
			gender: LiveChatSelector.identityObj.gender
		}));

		userFoundRef.current = false;
		if (window.innerWidth <= 768) setState((prevState) => ({ ...prevState, isMobileView: true }));
		else setState((prevState) => ({ ...prevState, isMobileView: false }));

		window.addEventListener("resize", () => {
			if (window.innerWidth < 768) setIsMobileViewDebouncer(true);
			else setIsMobileViewDebouncer(false);
		});

		const urlParams = new URLSearchParams(window.location.search);
		let interests = urlParams.get("interests");
		if (interests) {
			interests = interests.split(",");
			let interestCopy = [];
			interests.forEach((interest) => {
				if (interest.length > 0) interestCopy.push(interest.toLowerCase());
			});
			setState((prevState) => ({ ...prevState, commonInterestsArray: interestCopy }));
		}

		window.onbeforeunload = function (e) {
			// Cancel the event
			e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
			// Chrome requires returnValue to be set
			e.returnValue = "Your chat partner will be disconnected, Are you Sure?";
		};

		// Get my ip location from server
		dispatch(IsServerOperational());

		return () => {
			handleSocketEvent(END_CURRENT_SESSION, null);
			socketRef.current.disconnect();
		};
	}, []);

	useUpdateEffect(() => {
		handleInitSocketEvents();
	}, [state.myInfo]);

	// see chatMessageArray updates
	useUpdateEffect(() => {
		let elemsArray = document.querySelectorAll("#chatMessage");
		let elemChatContainer = document.getElementById("chatContainer");
		elemsArray = Array.from(elemsArray);
		let scrollElem = elemsArray[elemsArray.length - 1];

		// On mobile scroll to fix scrollIntoView we call it in setTimeOut when default keyboard is closed
		setTimeout(() => {
			if (scrollElem) scrollElem.scrollIntoView();
		}, 200);

		// Update height flag to remove position: absolute on chatContainer

		return () => {
			//
		};
	}, [state.chatMessagesArray]);

	// Send my restrictedModeKeywordsArray to other user
	useUpdateEffect(() => {
		handleSocketEvent(NEGATIVE_KEYWORD_EXCHANGE);
		localStorage.setItem("restrictedModeNewKeywordsArray", JSON.stringify(state.restrictedModeKeywordsArray));
		return () => {
			//
		};
	}, [state.restrictedModeKeywordsArray]);

	// Send my restrictedModeKeywordsArray to other user
	useUpdateEffect(() => {
		console.log("peerNegativeKeywordsArray", state);
	}, [state.peerNegativeKeywordsArray]);

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		setState((prevState) => ({ ...prevState, isMobileView: flag }));
		console.log("resize event triggered, updating local component state");
	}, 500);

	const helperDoesNegativeWordExists = (enteredText) => {
		let negativeKeywordPresnt = false;
		for (let index = 0; index < state.peerNegativeKeywordsArray.length; index++) {
			if (enteredText.toLowerCase().replaceAll(/ /g, "").includes(state.peerNegativeKeywordsArray[index])) {
				negativeKeywordPresnt = true;
				break;
			} else negativeKeywordPresnt = false;
		}
		return negativeKeywordPresnt;
	};

	const handleMicClick = () => {
		if (!state.isMicPressed) {
			console.log(navigator.mediaDevices.getUserMedia);

			// Start recording. Browser will request permission to use your microphone.
			navigator.getUserMedia(
				{ audio: true },
				() => {
					recorder
						.start()
						.then(() => {
							setState((prevState) => ({ ...prevState, isMicRecording: true, isMicBlocked: false }));
						})
						.catch((e) => {
							console.error(e);
							setState((prevState) => ({ ...prevState, isMicRecording: false, isMicBlocked: false }));
						});
				},
				(err) => {
					console.log(err);
					alert("You have blocked your mic access, please unblock audio from site settings");
					setState((prevState) => ({ ...prevState, isMicBlocked: true, isMicRecording: false, isMicPressed: false }));
				}
			);
		} else recorder.stop();
		setState((prevState) => ({ ...prevState, isMicPressed: !prevState.isMicPressed }));
	};

	const handleSendClick = (e) => {
		if (e) e.preventDefault();
		let chatArray = [...state.chatMessagesArray];
		chatArray.map((msg, index) => {
			msg.newlyAdded = false;
		});

		if (state.isMicPressed && state.isMicRecording && !state.isMicBlocked) {
			// Once you are done singing your best song, stop and get the mp3.
			recorder
				.stop()
				.getMp3()
				.then(([buffer, blob]) => {
					let time = new Date();
					const file = new File(buffer, "audio-message.mp3", {
						type: blob.type,
						lastModified: Date.now()
					});
					var reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = (e) => {
						let sendMsgObject = {
							type: "sent",
							isImage: false,
							isAudio: true,
							msg: e.target.result,
							senderName: state.username || null,
							senderAge: state.age || null,
							timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
							newlyAdded: true
						};

						console.log("Audio message size in mb : ", Buffer.byteLength(JSON.stringify(sendMsgObject)) / 1e6);
						if (Buffer.byteLength(JSON.stringify(sendMsgObject)) / 1e6 >= 6) alert("Max Audio length can be 2 mins, Try with audio message less than 2 mins");
						else {
							// Send Audio message
							handleSocketEvent(SEND_MESSAGE, sendMsgObject);
						}

						setState((prevState) => ({
							...prevState,
							chatMessagesArray: [...chatArray, sendMsgObject],
							isMicBlocked: false,
							isMicRecording: false,
							isMicPressed: false
						}));
					};
				})
				.catch((e) => {
					// Click event
					// TODO TRACKING EVENT : Failed to send message
					alert("We could not send your message");
					console.log(e);
					setState((prevState) => ({ ...prevState, isMicBlocked: false, isMicRecording: false, isMicPressed: false }));
				});
		} else {
			// Send Text Message
			let elem = document.getElementById("inputText");

			if (elem && elem.value && elem.value.trim().length > 0) {
				let time = new Date();
				let sendMsgObject = {
					type: "sent",
					isImage: false,
					isAudio: false,
					msg: elem.value,
					senderName: state.username || null,
					senderAge: state.age || null,
					timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
					newlyAdded: true,
					retracted: helperDoesNegativeWordExists(elem.value)
				};

				// Send message
				handleSocketEvent(SEND_MESSAGE, sendMsgObject);
				elem.value = "";
				setState((prevState) => ({ ...prevState, chatMessagesArray: [...chatArray, sendMsgObject] }));
			}
		}
	};

	const handleSmartReplyClick = (reply) => {
		// Click event
		// TODO TRACKING EVENT : Smart Reply Click
		setState((prevState) => ({ ...prevState, expandSmartReply: false }));
		let chatArray = [...state.chatMessagesArray];
		chatArray.map((msg, index) => {
			msg.newlyAdded = false;
		});
		let time = new Date();
		let sendMsgObject = {
			type: "sent",
			isImage: false,
			isAudio: false,
			msg: reply,
			senderName: state.username || null,
			senderAge: state.age || null,
			timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
			newlyAdded: true
		};
		// Send message
		handleSocketEvent(SEND_MESSAGE, sendMsgObject);
		setState((prevState) => ({ ...prevState, chatMessagesArray: [...chatArray, sendMsgObject] }));
	};

	const handleToggleRules = () => {
		setState((prevState) => ({ ...prevState, isRulesViewOpen: !prevState.isRulesViewOpen }));
	};

	const handleStopRulesScreenPropagation = (e) => {
		e.stopPropagation();
	};

	const handleAddNewKeywordBackToRestrictedMode = (index) => {
		const localNewKeywordsArray = [...state.restrictedModeKeywordsArray];
		setState((prevState) => ({
			...prevState,
			restrictedModeNewKeywordsArray: [localNewKeywordsArray[index], ...state.restrictedModeNewKeywordsArray],
			restrictedModeKeywordsArray: localNewKeywordsArray.filter((val, keyIndex) => keyIndex !== index)
		}));
	};

	const handleAddNewKeywordToRestrictedMode = (index) => {
		const localNewKeywordsArray = [...state.restrictedModeNewKeywordsArray];
		setState((prevState) => ({
			...prevState,
			restrictedModeKeywordsArray: [...state.restrictedModeKeywordsArray, localNewKeywordsArray[index]],
			restrictedModeNewKeywordsArray: localNewKeywordsArray.filter((val, keyIndex) => keyIndex !== index)
		}));
	};

	const handleAddNewKeyword = () => {
		let elem = document.getElementById("keywordInput");
		let value = elem.value;
		if (value.trim().length > 0) {
			setState((prevState) => ({
				...prevState,
				restrictedModeKeywordsArray: [...state.restrictedModeKeywordsArray, value.trim().toLowerCase()]
			}));
			elem.value = "";
		}
	};

	const handleChangeSessionStatus = () => {
		if (state.isNewSessionStatus === "New") {
			handleSocketEvent(CLIENT_INTRODUCTION);
			// Get permissiong to notify users
			// if (window.Notification.permission !== "granted" && confirm("Please allow us to send notifications to you whenever more people are online to chat with!")) {
			// 	requestPermission();
			// }
			// Click event
			// TODO TRACKING EVENT : Start new session Click
		}
		if (state.isNewSessionStatus === "Skip") setState((prevState) => ({ ...prevState, isNewSessionStatus: "Really" }));
		if (state.isNewSessionStatus === "Really") {
			setState((prevState) => ({ ...prevState, userFoundFlag: "" }));
			handleSocketEvent(END_CURRENT_SESSION, null);
		}
	};

	const handleTabChange = (index) => {
		// Click event
		// TODO TRACKING EVENT : Tab Change Event
		setState((prevState) => ({ ...prevState, tabIndex: index }));
	};

	const handleSettingsTabChange = (index) => {
		let myGender = LiveChatSelector.identityObj?.gender;
		console.log(myGender);
		if (myGender !== "any") setState((prevState) => ({ ...prevState, settingsTabIndex: index, isMyGenderSpecified: true }));
		else setState((prevState) => ({ ...prevState, isMyGenderSpecified: false }));
	};

	const setURLSearchParam = (key, value) => {
		const url = new URL(window.location.href);
		url.searchParams.set(key, value);
		window.history.pushState({ path: url.href }, "", url.href);
	};

	const handleAddInterest = (e) => {
		let value = e.target.value;
		if (e.key === "Enter" && value.trim().length > 0) {
			let commonInterestsArray = [...state.commonInterestsArray, value.trim().toLowerCase()];
			setURLSearchParam("interests", commonInterestsArray);
			setState((prevState) => ({
				...prevState,
				commonInterestsArray
			}));
			setTimeout(() => {
				document.getElementById("interestInput").value = "";
			}, 100);
		}
	};

	const handleConfirmImage = (e) => {
		// Click event
		// TODO TRACKING EVENT : Image Share Event
		setState((prevState) => ({ ...prevState, imageFile: e, showImageDisapperModal: true }));
	};

	const handleFileUpload = (disappearImageSecs, flag) => {
		let chatArray = [...state.chatMessagesArray];
		chatArray.map((msg, index) => {
			msg.newlyAdded = false;
		});
		let e = state.imageFile;
		new Compressor(e.target.files[0], {
			quality: 0.4,

			// The compression process is asynchronous,
			// which means you have to access the `result` in the `success` hook function.
			success(result) {
				let time = new Date();
				var reader = new FileReader();
				reader.readAsDataURL(result);
				reader.onload = (e) => {
					let sendMsgObject = {
						type: "sent",
						isImage: true,
						isAudio: false,
						shouldDisappear: flag,
						disappearSecs: disappearImageSecs,
						//msg: URL.createObjectURL(e.target.files[0]),
						msg: e.target.result,
						senderName: state.username || null,
						senderAge: state.age || null,
						timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
						newlyAdded: true
					};
					// Send message
					handleSocketEvent(SEND_MESSAGE, sendMsgObject);
					setState((prevState) => ({
						...prevState,
						showImageDisapperModal: false,
						chatMessagesArray: [...chatArray, sendMsgObject]
					}));
				};
			},
			error(err) {
				console.log(err.message);
			}
		});
	};

	const handleRemoveInterest = (interestIndex) => {
		let commonInterestsArray = state.commonInterestsArray.filter((val, index) => interestIndex !== index);
		setURLSearchParam("interests", commonInterestsArray);
		setState((prevState) => ({
			...prevState,
			commonInterestsArray
		}));
	};

	const handleAdCampaignClick = () => {
		// Click event
		// TODO TRACKING EVENT : Contextual Ad Click
		window.open("/ads", "_blank");
	};

	const renderChatMessages = () => {
		return state.chatMessagesArray.map((msg, index) => {
			if (msg.isImage) {
				return (
					<div
						className={styles.chatContainer__msgContainer}
						id="chatMessage"
						key={`${msg.msg}-${index}`}
						style={{ justifyContent: msg.type === "received" ? "flex-start" : "flex-end" }}
					>
						<DisapperingImage msg={msg} index={index} state={state} />
					</div>
				);
			}

			if (msg.isAudio) {
				return (
					<div
						className={styles.chatContainer__msgContainer}
						id="chatMessage"
						key={`${msg.msg}-${index}`}
						style={{ justifyContent: msg.type === "received" ? "flex-start" : "flex-end" }}
					>
						<div
							style={{ animation: msg.newlyAdded ? "newMessage 500ms ease-in-out" : null }}
							className={msg.type === "received" ? styles.chatContainer__receivedMsgContainer : styles.chatContainer__sentMsgContainer}
						>
							<div className={styles.chatContainer__receivedMsg}>
								<audio controls controlsList="nodownload novolume nofullscreen noremoteplayback noplaybackrate" src={msg.msg}></audio>
							</div>
							<div className={styles.chatContainer__receivedMsgName}>
								<b>{msg.senderName}</b> <br /> {msg.timeStamp}
							</div>
						</div>
					</div>
				);
			}

			if (msg.isMetadata) {
				return (
					<div className={styles.chatContainer__msgContainer} id="chatMessage" key={`${msg.msg}-${index}`}>
						<div style={{ animation: msg.newlyAdded ? "newMessage 500ms ease-in-out" : null }} className={styles.chatContainer__metadata}>
							{msg.msg}
						</div>
					</div>
				);
			}

			return (
				<div
					className={styles.chatContainer__msgContainer}
					id="chatMessage"
					key={`${msg.msg}-${index}`}
					style={{ justifyContent: msg.type === "received" ? "flex-start" : "flex-end" }}
				>
					<div
						style={{ animation: msg.newlyAdded ? "newMessage 500ms ease-in-out" : null }}
						className={msg.type === "received" ? styles.chatContainer__receivedMsgContainer : styles.chatContainer__sentMsgContainer}
					>
						<div className={styles.chatContainer__receivedMsg}>{!msg.retracted ? msg.msg : "Oops some keyword in message is not allowed, hence message was retracted"}</div>
						<div className={styles.chatContainer__receivedMsgName}>
							{!msg.retracted && (
								<>
									<b>{msg.senderName}</b> <br /> {msg.timeStamp}
								</>
							)}
						</div>
					</div>
				</div>
			);
		});
	};

	const handleSmartReplyExpander = () => {
		setState((prevState) => ({ ...prevState, expandSmartReply: !prevState.expandSmartReply }));
	};

	// rendering desktop view
	const renderDesktopView = () => {
		return <div>{renderMobileView()}</div>;
	};

	const handleToggleConnectToStrangers = () => {
		setState((prevState) => ({ ...prevState, connectWithAnyone: !prevState.connectWithAnyone }));
	};

	const renderCorrectTab = () => {
		if (state.tabIndex === 0) {
			return (
				<div className={styles.chatContainer__settings}>
					<div className={styles.chatContainer__settingsTitle}>Connect With</div>
					<div className={styles.chatContainer__settingsSubTitle}>
						{state.isMyGenderSpecified ? (
							"Select the gender you want to chat with"
						) : (
							<>
								To use this confirm your gender by <b onClick={() => handleTabChange(1)}>clicking here</b>
							</>
						)}
					</div>

					<div style={{ opacity: !state.isMyGenderSpecified ? "0.4" : "1" }} className={styles.chatContainer__settingsTabView}>
						{state.settingsTabViewOptions.map((tab, index) => (
							<div
								style={{
									backgroundColor: state.settingsTabIndex === index ? "#e56b9f" : null,
									color: state.settingsTabIndex === index ? "white" : null
								}}
								onClick={() => handleSettingsTabChange(index)}
								key={tab}
							>
								{tab}
							</div>
						))}
					</div>

					<div className={styles.chatContainer__settingsTitle}>Connect with anyone?</div>
					<div className={styles.chatContainer__settingsSubTitle}>Connect with anyone if interests not avialable?</div>
					<div style={{ display: "flex", marginTop: "10px" }}>
						<div className={styles.chatContainer__radioToggle}>
							<input onClick={handleToggleConnectToStrangers} type="radio" checked={state.connectWithAnyone} /> Yes{" "}
						</div>
						<div className={styles.chatContainer__radioToggle}>
							<input onClick={handleToggleConnectToStrangers} type="radio" checked={!state.connectWithAnyone} /> No{" "}
						</div>
					</div>

					<div className={styles.chatContainer__settingsTitle}>Add Common Interests</div>
					<div className={styles.chatContainer__settingsSubTitle}>Add and press Enter e.g. Fitness, workout, science</div>
					<div className={styles.chatContainer__commonInterestsContainer}>
						{state.commonInterestsArray.map((interest, index) => (
							<div key={`${interest}-${index}`}>
								{interest} <b onClick={() => handleRemoveInterest(index)}>X</b>
							</div>
						))}
						<textarea id="interestInput" type="text" placeholder="Add here" onKeyDown={handleAddInterest} />
					</div>

					<div className={styles.chatContainer__startSession}>
						<div>
							Want to advertise on blabla? -{" "}
							<span style={{ fontWeight: "500", textDecoration: "underline" }} onClick={handleAdCampaignClick}>
								Read here
							</span>{" "}
						</div>
						<button onClick={handleChangeSessionStatus} disabled={state.userSearchTryingCount !== 0}>
							Start session
						</button>
						{state.userFoundFlag !== "" && !state.userFoundFlag ? (
							<div style={{ marginTop: "10px", fontSize: "12px" }} className={styles.chatContainer__settingsSubTitle}>
								Searching... new user to chat!
							</div>
						) : (
							""
						)}
					</div>

					{state.isChatEnded && (
						<div style={{ marginTop: "10px" }} className={styles.chatContainer__settingsSubTitle}>
							{state.isChatEndedWithError ? state.isChatEndedWithError : `Chat ended with ${state?.isChatEndedWith}`}{" "}
						</div>
					)}
				</div>
			);
		}

		if (state.tabIndex === 1) {
			return <IdentityTab />;
		}
	};

	// rendering the mobile view
	const renderMobileView = () => {
		return (
			<div className={styles.chatContainer} id="chatContainer" style={{ overflowY: state.isRulesViewOpen ? "hidden" : null }}>
				{state.isRulesViewOpen && (
					<div className={styles.chatContainer__rulesView} onClick={handleToggleRules}>
						<div className={styles.chatContainer__rulesUpArrow} style={{ marginLeft: isMobileView ? "66%" : "71%" }}></div>
						<div className={styles.chatContainer__rulesScreen} onClick={handleStopRulesScreenPropagation}>
							<div className={styles.chatContainer__rulesTitle}>
								This is a <b>restricted mode</b> where the following words can’t be used while chatting (click to remove)
							</div>
							<div className={styles.chatContainer__keywordContainer}>
								{state.restrictedModeKeywordsArray.map((keyword, index) => (
									<div key={`${keyword}-${index}`} onClick={() => handleAddNewKeywordBackToRestrictedMode(index)} className={styles.chatContainer__keyword}>
										{keyword}
									</div>
								))}
							</div>
							<div className={styles.chatContainer__rulesTitle} style={{ marginTop: "20px" }}>
								You can add more <b>keywords</b> to restricted mode from below (click to add)
							</div>
							<div className={styles.chatContainer__keywordContainer} style={{ overflowX: "scroll", flexWrap: "nowrap" }}>
								{state.restrictedModeNewKeywordsArray.map((keyword, index) => (
									<div
										key={`${keyword}-${index}`}
										className={styles.chatContainer__keyword}
										onClick={() => handleAddNewKeywordToRestrictedMode(index)}
										style={{ background: "#e56b9f", padding: "10px 15px 10px 15px" }}
									>
										{keyword}
									</div>
								))}
							</div>

							<div className={styles.chatContainer__keywordInput}>
								<input placeholder="Enter your keyword here" id="keywordInput" />
								<div onClick={handleAddNewKeyword}>save</div>
							</div>
						</div>
					</div>
				)}
				<div className={styles.chatContainer__topbar}>
					<div className={styles.chatContainer__siteLogo}>
						<Image src={SiteLogoWhite.src} alt="blabla-siteLogo.png" width={state.isMobileView ? 140 : 200} height={state.isMobileView ? 40 : 80} />
					</div>
					<div className={styles.chatContainer__chatOptions}>
						<button onClick={handleToggleRules}>Rules</button>
						<button onClick={handleChangeSessionStatus}>{state.isNewSessionStatus}?</button>
					</div>
				</div>

				{renderChatMessages()}
				{state.isSenderTyping && (
					<div id="typingContainer" className={styles.chatContainer__typingContainer}>
						<div></div>
						<div></div>
						<div></div>
					</div>
				)}

				<div className={styles.chatContainer__controls}>
					{state.expandSmartReply && (
						<div className={styles.chatContainer__smartReplyMenu} id="smartReplyMenu">
							{state.smartRepliesArray.map((reply, index) => {
								let renderIdx = state.isMobileView ? 2 : 6;
								if (index >= renderIdx) {
									return (
										<div
											style={{
												pointerEvents: state.isNewSessionStatus === "New" ? "none" : null,
												color: "#474663",
												margin: "5px",
												border: "1px solid #405068"
											}}
											onClick={() => handleSmartReplyClick(reply.text)}
											className={styles.chatContainer__smartReplyItem}
											key={`${index}-${reply.text}`}
										>
											{reply.text}
										</div>
									);
								}
								return "";
							})}
						</div>
					)}
					{state.showImageDisapperModal && (
						<div className={styles.chatContainer__smartReplyMenu} id="smartReplyMenu">
							<div className={styles.chatContainer__settingsTitle} style={{ marginTop: "unset", padding: "12px" }}>
								In how much time should this Image disapper?
							</div>
							<div style={{ display: "flex", flexWrap: "wrap" }}>
								<div
									style={{ color: "#474663", margin: "5px", border: "1px solid #405068" }}
									onClick={() => handleFileUpload(30, true)}
									className={styles.chatContainer__smartReplyItem}
								>
									30 secs
								</div>
								<div
									style={{ color: "#474663", margin: "5px", border: "1px solid #405068" }}
									onClick={() => handleFileUpload(60, true)}
									className={styles.chatContainer__smartReplyItem}
								>
									1 min
								</div>
								<div
									style={{ color: "#474663", margin: "5px", border: "1px solid #405068" }}
									onClick={() => handleFileUpload(120, true)}
									className={styles.chatContainer__smartReplyItem}
								>
									2 min
								</div>
								<div
									style={{ color: "#474663", margin: "5px", border: "1px solid #405068" }}
									onClick={() => handleFileUpload(300, true)}
									className={styles.chatContainer__smartReplyItem}
								>
									5 min
								</div>
								<div
									style={{ color: "#474663", margin: "5px", border: "1px solid #405068" }}
									onClick={() => handleFileUpload(NaN, false)}
									className={styles.chatContainer__smartReplyItem}
								>
									Never
								</div>
							</div>
							<div
								style={{ margin: "5px" }}
								onClick={() => setState((prevState) => ({ ...prevState, showImageDisapperModal: false, imageFile: null }))}
								className={styles.chatContainer__startSession}
							>
								<button>Cancel</button>
							</div>
						</div>
					)}
					{state.showPrivacyModal && state.isNewSessionStatus !== "New" && (
						<div className={styles.chatContainer__smartReplyMenu} id="smartReplyMenu" style={{ height: "60vh" }}>
							<div className={styles.chatContainer__settingsTitle} style={{ marginTop: "unset" }}>
								Guidelines for usage (Scroll till end to close this dialog)
							</div>
							<PrivacyText />
							<div style={{ margin: "5px" }} onClick={() => setState((prevState) => ({ ...prevState, showPrivacyModal: false }))} className={styles.chatContainer__startSession}>
								<button>Cancel</button>
							</div>
						</div>
					)}
					{state.isNewSessionStatus === "New" && (
						<div className={styles.chatContainer__newSessionScreen} onClick={handleChangeSessionStatus}>
							<div className={styles.chatContainer__rulesUpArrow} style={{ marginLeft: isMobileView ? "85%" : "94%", marginTop: isMobileView ? "62px" : "90px" }}></div>
							<div className={styles.chatContainer__newSessionOptions} style={{ marginTop: "unset" }} onClick={(e) => e.stopPropagation()}>
								<div className={styles.chatContainer__newAd} onClick={handleAdCampaignClick}>
									Your banner ad can be here - check out
								</div>
								<div className={styles.chatContainer__newTabs}>
									{state.newTabs.map((tab, index) => (
										<div
											style={{
												backgroundColor: index === state.tabIndex ? "#474663" : null,
												color: index === state.tabIndex ? "white" : null
											}}
											onClick={() => handleTabChange(index)}
											key={tab}
										>
											{tab}
										</div>
									))}
								</div>
								{socketRef.current && state.mySocketId && renderCorrectTab()}
								{!socketRef.curent && !state.mySocketId && (
									<div className={styles.chatContainer__initLoader}>
										<Loader width={40} height={20} style={{ marginRight: "40px" }} color={"#474663"} />
									</div>
								)}
							</div>
						</div>
					)}
					<div className={styles.chatContainer__chatAd}>
						Place your text Ads here -
						<div className={styles.chatContainer__adAction} onClick={handleAdCampaignClick}>
							Know more
						</div>
					</div>
					<div className={styles.chatContainer__smartReply}>
						<div>
							<div>
								<input type="checkbox" id="switch" />
								<label for="switch">Toggle</label>
							</div>
							<div>video off</div>
						</div>
						{state.smartRepliesArray.map((reply, index) => {
							let renderIdx = state.isMobileView ? 2 : 6;
							if (index < renderIdx) {
								return (
									<div
										style={{ pointerEvents: state.isNewSessionStatus === "New" ? "none" : null }}
										onClick={() => handleSmartReplyClick(reply.text)}
										className={styles.chatContainer__smartReplyItem}
										key={`${index}-${reply.text}`}
									>
										{reply.text}
									</div>
								);
							}
							return "";
						})}
						<div
							className={styles.chatContainer__smartReplyExpandCollapse}
							onClick={handleSmartReplyExpander}
							style={{ transform: state.expandSmartReply ? "rotate(180deg)" : "rotate(0deg)" }}
						>
							<Image src={ExpandCollapse.src} alt="image-icon" width={25} height={25} />
						</div>
					</div>
					<div className={styles.chatContainer__input} style={{ pointerEvents: state.isNewSessionStatus === "New" ? "none" : null }}>
						<div className={styles.chatContainer__inputImageSelector}>
							<input type="file" onChange={(e) => handleConfirmImage(e, true)} accept="image/*" />
							<Image src={ImageIcon.src} alt="image-icon" width={25} height={25} />
						</div>

						<div>
							<Image onClick={handleMicClick} src={state.isMicPressed ? MicCancel.src : MicIcon.src} alt="mic-icon" width={25} height={25} />
						</div>

						<div>
							{!state.isMicPressed && (
								<TextareaAutosize
									onFocus={() => handleSocketEvent(PEER_STARTED_TYPING)}
									onBlur={() => handleSocketEvent(PEER_STOPPED_TYPING)}
									id="inputText"
									maxLength={400}
									placeholder="your message here"
									className={styles.chatContainer__textarea}
									onKeyPress={(e) => (e.key === "Enter" ? handleSendClick(e) : "")}
								/>
							)}

							{state.isMicPressed && (
								<div className={styles.chatContainer__recordAudio}>
									<AudioRecording />
								</div>
							)}
						</div>

						<div>
							<Image onClick={handleSendClick} src={SendIcon.src} alt="send-icon" width={30} height={30} />
						</div>
					</div>
				</div>
			</div>
		);
	};

	const { isMobileView } = state;
	return (
		<div style={{ height: "100%" }}>
			<Script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" defer />
			<Script id="google-analytics" strategy="afterInteractive">
				{`
                     window.OneSignal = window.OneSignal || [];
                    OneSignal.push(function() {
                        OneSignal.init({
                        appId: "2d1bdbfa-fcee-4db9-a3ae-3c3836bbb8da",
                        });
                    });
                `}
			</Script>
			<Script src="https://www.googletagmanager.com/gtag/js?id=AW-579008007" strategy="afterInteractive" />
			<Script id="google-analytics" strategy="afterInteractive">
				{`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'AW-579008007');
                `}
			</Script>
			<Script>
				{`function gtag_report_conversion(url) {
                    var callback = function () {
                        if (typeof(url) != 'undefined') {
                        window.location = url;
                        }
                    };
                    gtag('event', 'conversion', {
                        'send_to': 'AW-579008007/JxVuCN_Ouq8DEIfsi5QC',
                        'event_callback': callback
                    });
                    return false;
                }`}
			</Script>

			<Head>
				<meta name="theme-color" content="#474663" />
				<title> {SEO.live.pageTitle} </title>
				<meta name="title" content={SEO.live.metaTitle} />
				<meta name="description" content={SEO.live.description} />
				<meta name="keywords" content={SEO.live.keywords} />
				<meta name="robots" content="index, follow" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="language" content="English" />
				<meta name="revisit-after" content="7 days" />
			</Head>
			{isMobileView ? renderMobileView() : renderDesktopView()}
		</div>
	);
}

export default Index;
