import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from 'next/router'
import _ from "lodash";
import Compressor from "compressorjs";
import TextareaAutosize from "react-textarea-autosize";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import socketIOClient from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import IdentityTab from "../../components/IdentityTab";
import useUpdateEffect from "../../components/_helpers/useUpdateEffect";
import AudioRecording from "../../components/AudioRecording";
import MicRecorder from "mic-recorder-to-mp3";

// Images
import SiteLogoWhite from "../../Resources/SiteLogoWhite.svg";
import SendIcon from "../../Resources/SendIcon.svg";
import ImageIcon from "../../Resources/ImageIcon.svg";
import MicIcon from "../../Resources/MicIcon.svg";
import MicCancel from "../../Resources/MicCancel.svg";

// Actions
import { ClearLiveChatLogs, IsServerOperational, GetTrends } from "../../actions/liveChatActions";

// Styles
import styles from "../../styles/live.module.scss";
import Loader from "../../components/_helpers/Loader";

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
	bitRate: 256,
});

function Index() {
	const dispatch = useDispatch();
	const router = useRouter()
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

		// Audio related state vars
		isMicPressed: false,
		isMicRecording: false,
		isMicBlocked: false,
	});
	const socketRef = useRef();
	const userFoundRef = useRef();

	useUpdateEffect(() => {
		console.log("My ID :: ", state.mySocketId);
		setState((prevState) => ({
			...prevState,
			isNewSessionStatus: "New",
			userFoundFlag: "",
			userSearchTryingCount: 0,
			isChatEnded: false,
			pairedUserData: null,
			chatMessagesArray: [],
			isChatEndedWithError: null,
		}));
		document.getElementById("inputText").blur();
	}, [state.mySocketId]);

	useUpdateEffect(() => {
		if (state.pairedUserData) console.log("user found with socketId  :: ", state.pairedUserData?.mySocketId);
	}, [state.userFoundFlag]);

	useUpdateEffect(() => {
		if ( LiveChatSelector.identityObj.fullname !== null) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, username:  LiveChatSelector.identityObj.fullname }));
		}

		if ( LiveChatSelector.identityObj.gender !== "any") {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, isMyGenderSpecified: true}));
		}
	}, [LiveChatSelector]);

	const handleSocketEvent = (eve, data) => {
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
				},
			});
		}

		if (eve === PEER_STARTED_TYPING) {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer")
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
					peerSocketId: state.pairedUserData?.mySocketId,
				},
			});
		}

		if (eve === PEER_STOPPED_TYPING) {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer")
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
					peerSocketId: state.pairedUserData?.mySocketId,
				},
			});
		}

		if (eve === SEND_MESSAGE) {
			socketRef.current.emit(SEND_MESSAGE, {
				socketId: socketRef.current.id,
				action: SEND_MESSAGE,
				data: {
					chatData: data,
					peerSocketId: state.pairedUserData?.mySocketId,
				},
			});
		}

		if (eve === NEGATIVE_KEYWORD_EXCHANGE) {
			socketRef.current.emit(NEGATIVE_KEYWORD_EXCHANGE, {
				socketId: socketRef.current.id,
				action: NEGATIVE_KEYWORD_EXCHANGE,
				data: {
					username: state.username,
					keywordsArray: state.restrictedModeKeywordsArray,
					peerSocketId: state.pairedUserData?.mySocketId,
				},
			});
		}

		if (eve === END_CURRENT_SESSION) {
			document.getElementById("inputText").blur();
			socketRef.current.emit(END_CURRENT_SESSION, {
				socketId: socketRef.current.id,
				action: END_CURRENT_SESSION,
				data: {
					peerSocketId: state.pairedUserData?.mySocketId,
				},
			});
		}
	};

	const handleInitSocketEvents = () => {
		socketRef.current = socketIOClient(process.env.NEXT_PUBLIC_SERVER_URL, {
			path: "/live",
			query: { token: window.tkn },
			transports: ["websocket", "polling", "flashsocket"],
		});

		socketRef.current.on("connect", () => {
			setState((prevState) => ({ ...prevState, mySocketId: socketRef.current.id, isChatEnded: false, isChatEndedWithError: null }));
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
				isChatEndedWithError: err + " Please check your network connection and try again ",
			}));
		});

		socketRef.current.on(CLIENT_INTRODUCTION, (data) => {
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
				retracted: false,
			};

			let chatMessagesArray = [...state.chatMessagesArray, intersectedInterestsMessage];
			setState((prevState) => ({ ...prevState, userFoundFlag: true, pairedUserData: data, isNewSessionStatus: "Skip", chatMessagesArray }));
		});

		socketRef.current.on(CLIENT_INTRODUCTION_PAIR_NOT_FOUND, (data) => {
			console.log(CLIENT_INTRODUCTION_PAIR_NOT_FOUND);
			setState((prevState) => ({ ...prevState, userFoundFlag: false, pairedUserData: null }));
		});

		socketRef.current.on(NEGATIVE_KEYWORD_EXCHANGE, (data) => {
			setState((prevState) => ({ ...prevState, peerNegativeKeywordsArray: data.data.data.keywordsArray }));
		});

		socketRef.current.on(SEND_MESSAGE, (data) => {
			setState((prevState) => ({ ...prevState, chatMessagesArray: [...prevState.chatMessagesArray, data.chatData] }));
		});

		socketRef.current.on(PEER_STARTED_TYPING, (data) => {
			let elemsArray = document.querySelectorAll("#chatMessage");
			let typingContainer = document.querySelector("#typingContainer")
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
			let typingContainer = document.querySelector("#typingContainer")
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
			}));
		});
	}

	useUpdateEffect(() => {

		if (LiveChatSelector.isServerOperationalStatus === 200) {
			dispatch(ClearLiveChatLogs());
			// Get trending trends
			dispatch(GetTrends())
			handleInitSocketEvents()
			setState((prevState) => ({ ...prevState, myInfo: LiveChatSelector.isServerOperationalData }));
		}

		if (LiveChatSelector.isServerOperationalStatus === 600) {
			dispatch(ClearLiveChatLogs());
			if (confirm("Please check your internet connection, Click OK to refresh"))
				window.location.reload()
		}

		if (LiveChatSelector.detectedGenderStatus === 600) {
			dispatch(ClearLiveChatLogs());
			if (confirm("Please check your internet connection, Click OK to refresh"))
				window.location.reload()
		}

		if (LiveChatSelector.trendsStatus === 200){
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, smartRepliesArray: LiveChatSelector.trendsData.data }));
		}

	}, [LiveChatSelector]);

	// Run only first time when component loads
	useEffect(() => {
		// set initial level
		setState((prevState) => ({ ...prevState, username: LiveChatSelector.identityObj.fullname, age: LiveChatSelector.identityObj.age, gender: LiveChatSelector.identityObj.gender }));
		
		userFoundRef.current = false;
		if (window.innerWidth <= 768) setState((prevState) => ({ ...prevState, isMobileView: true }));
		else setState((prevState) => ({ ...prevState, isMobileView: false }));

		window.addEventListener("resize", () => {
			if (window.innerWidth < 768) setIsMobileViewDebouncer(true);
			else setIsMobileViewDebouncer(false);
		});

		// Get my ip location from server
		dispatch(IsServerOperational());
		
		return () => {
			handleSocketEvent(END_CURRENT_SESSION, null);
			socketRef.current.disconnect();
		};
	}, []);

	useUpdateEffect(() => {
		handleInitSocketEvents()
	}, [state.myInfo]);

	// see chatMessageArray updates
	useUpdateEffect(() => {
		let elemsArray = document.querySelectorAll("#chatMessage");
		let elemChatContainer = document.getElementById("chatContainer");
		elemsArray = Array.from(elemsArray);
		let scrollElem = elemsArray[elemsArray.length - 1];

		//console.log(state.chatMessagesArray);

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
		if (!state.isMicPressed ) {
			console.log(navigator.mediaDevices.getUserMedia);
			
			// Start recording. Browser will request permission to use your microphone.
			navigator.getUserMedia({ audio: true },
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
		if (e) e.preventDefault()
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
					lastModified: Date.now(),
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
						newlyAdded: true,
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
						isMicPressed: false,
					}));
				};
			
			})
			.catch((e) => {
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
					retracted: helperDoesNegativeWordExists(elem.value),
				};

				// Send message
				handleSocketEvent(SEND_MESSAGE, sendMsgObject);
				elem.value = "";
				setState((prevState) => ({ ...prevState, chatMessagesArray: [...chatArray, sendMsgObject] }));
			}
		}
	};

	const handleSmartReplyClick = (reply) => {
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
			newlyAdded: true,
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
			restrictedModeKeywordsArray: localNewKeywordsArray.filter((val, keyIndex) => keyIndex !== index),
		}));
	};

	const handleAddNewKeywordToRestrictedMode = (index) => {
		const localNewKeywordsArray = [...state.restrictedModeNewKeywordsArray];
		setState((prevState) => ({
			...prevState,
			restrictedModeKeywordsArray: [...state.restrictedModeKeywordsArray, localNewKeywordsArray[index]],
			restrictedModeNewKeywordsArray: localNewKeywordsArray.filter((val, keyIndex) => keyIndex !== index),
		}));
	};

	const handleAddNewKeyword = () => {
		let elem = document.getElementById("keywordInput");
		let value = elem.value;
		if (value.trim().length > 0) {
			setState((prevState) => ({
				...prevState,
				restrictedModeKeywordsArray: [...state.restrictedModeKeywordsArray, value.trim().toLowerCase()],
			}));
			elem.value = "";
		}
	};

	const handleChangeSessionStatus = () => {
		if (state.isNewSessionStatus === "New") {
			handleSocketEvent(CLIENT_INTRODUCTION);
		}
		if (state.isNewSessionStatus === "Skip") setState((prevState) => ({ ...prevState, isNewSessionStatus: "Really" }));
		if (state.isNewSessionStatus === "Really") {
			setState((prevState) => ({ ...prevState, userFoundFlag: "" }));
			handleSocketEvent(END_CURRENT_SESSION, null);
		}
	};

	const handleTabChange = (index) => {
		setState((prevState) => ({ ...prevState, tabIndex: index }));
	};

	const handleSettingsTabChange = (index) => {
		let myGender = LiveChatSelector.identityObj?.gender;
		console.log(myGender);
		if (myGender !== "any") setState((prevState) => ({ ...prevState, settingsTabIndex: index, isMyGenderSpecified: true }));
		else setState((prevState) => ({ ...prevState, isMyGenderSpecified: false }));
	};

	const handleAddInterest = (e) => {
		let value = e.target.value;
		if (e.key === "Enter" && value.trim().length > 0) {
			setState((prevState) => ({
				...prevState,
				commonInterestsArray: [...state.commonInterestsArray, value.trim().toLowerCase()],
			}));
			document.getElementById("interestInput").value = "";
		}
	};

	const handleFileUpload = (e) => {
		let chatArray = [...state.chatMessagesArray];
		chatArray.map((msg, index) => {
			msg.newlyAdded = false;
		});

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
						//msg: URL.createObjectURL(e.target.files[0]),
						msg: e.target.result,
						senderName: state.username || null,
						senderAge: state.age || null,
						timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
						newlyAdded: true,
					};
					// Send message
					handleSocketEvent(SEND_MESSAGE, sendMsgObject);
					setState((prevState) => ({ ...prevState, chatMessagesArray: [...chatArray, sendMsgObject] }));
				};
			},
			error(err) {
				console.log(err.message);
			},
		});
	};

	const handleRemoveInterest = (interestIndex) => {
		setState((prevState) => ({
			...prevState,
			commonInterestsArray: state.commonInterestsArray.filter((val, index) => interestIndex !== index),
		}));
	};

	const handleAdCampaignClick = () => {
		window.open("/ads", "_blank");
	}

	const renderChatMessages = () => {
		return state.chatMessagesArray.map((msg, index) => {
			if (msg.isImage) {
				return (
					<div className={styles.chatContainer__msgContainer} id="chatMessage" key={`${msg.msg}-${index}`} style={{ justifyContent: msg.type === "received" ? "flex-start" : "flex-end" }}>
						<div
							style={{ animation: msg.newlyAdded ? "newMessage 500ms ease-in-out" : null }}
							className={msg.type === "received" ? styles.chatContainer__receivedMsgContainer : styles.chatContainer__sentMsgContainer}
						>
							<div className={styles.chatContainer__receivedMsg}>
								<div className={styles.chatContainer__receivedMsg}>
									<img src={msg.msg} id={`ss-${index}`} />
								</div>
							</div>
							<div className={styles.chatContainer__receivedMsgName}>
								<b>{msg.senderName}</b> <br/> {msg.timeStamp}
							</div>
						</div>
					</div>
				);
			}

			if (msg.isAudio) {
				return (
					<div className={styles.chatContainer__msgContainer} id="chatMessage" key={`${msg.msg}-${index}`} style={{ justifyContent: msg.type === "received" ? "flex-start" : "flex-end" }}>
						<div
							style={{ animation: msg.newlyAdded ? "newMessage 500ms ease-in-out" : null }}
							className={msg.type === "received" ? styles.chatContainer__receivedMsgContainer : styles.chatContainer__sentMsgContainer}
						>
							<div className={styles.chatContainer__receivedMsg}>
								<audio controls controlsList="nodownload novolume nofullscreen noremoteplayback noplaybackrate" src={msg.msg}></audio>
							</div>
							<div className={styles.chatContainer__receivedMsgName}>
								<b>{msg.senderName}</b> <br/>  {msg.timeStamp}
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
				<div className={styles.chatContainer__msgContainer} id="chatMessage" key={`${msg.msg}-${index}`} style={{ justifyContent: msg.type === "received" ? "flex-start" : "flex-end" }}>
					<div
						style={{ animation: msg.newlyAdded ? "newMessage 500ms ease-in-out" : null }}
						className={msg.type === "received" ? styles.chatContainer__receivedMsgContainer : styles.chatContainer__sentMsgContainer}
					>
						<div className={styles.chatContainer__receivedMsg}>{!msg.retracted ? msg.msg : "Oops some keyword in message is not allowed, hence message was retracted"}</div>
						<div className={styles.chatContainer__receivedMsgName}>
							{!msg.retracted && (
								<>
									<b>{msg.senderName}</b> <br/>  {msg.timeStamp}
								</>
							)}
						</div>
					</div>
				</div>
			);
		});
	};

	// rendering desktop view
	const renderDesktopView = () => {
		return <div>{renderMobileView()}</div>;
	};

	const renderCorrectTab = () => {
		if (state.tabIndex === 0) {
			return (
				<div className={styles.chatContainer__settings}>
					<div className={styles.chatContainer__settingsTitle}>Connect With</div>
					<div className={styles.chatContainer__settingsSubTitle} >
						{state.isMyGenderSpecified ? "Select the gender you want to chat with" : <>To use this confirm your gender by <b onClick={() => handleTabChange(1)}>clicking here</b></> }
					</div>
					
					<div style={{ opacity: !state.isMyGenderSpecified ? "0.4": "1" }} className={styles.chatContainer__settingsTabView}>
						{state.settingsTabViewOptions.map((tab, index) => (
							<div
								style={{ backgroundColor: state.settingsTabIndex === index ? "#e56b9f" : null, color: state.settingsTabIndex === index ? "white" : null }}
								onClick={() => handleSettingsTabChange(index)}
								key={tab}
							>
								{tab}
							</div>
						))}
					</div>

					<div className={styles.chatContainer__settingsTitle}>Add Common Interests</div>
					<div className={styles.chatContainer__settingsSubTitle}>Add and press Enter e.g. Fitness, workout, science</div>
					<div className={styles.chatContainer__commonInterestsContainer}>
						{state.commonInterestsArray.map((interest, index) => (
							<div key={`${interest}-${index}`}>
								{interest} <b onClick={() => handleRemoveInterest(index)}>X</b>
							</div>
						))}
						<input id="interestInput" placeholder="Add here" onKeyPress={handleAddInterest} />
					</div>

					<div className={styles.chatContainer__startSession}>
						<div>Want to advertise on blabla? - <span style={{fontWeight: "500", textDecoration:"underline"}} onClick={handleAdCampaignClick}>Read here</span> </div>
						<button onClick={handleChangeSessionStatus} disabled={state.userSearchTryingCount !== 0}>
							Start session
						</button>
						{state.userFoundFlag !== "" && !state.userFoundFlag ? <div style={{ marginTop: "10px", fontSize: "0.9em" }} className={styles.chatContainer__settingsSubTitle}>Searching... new user to chat!</div> : ""}
					</div>

					{state.isChatEnded && <div style={{ marginTop: "10px" }} className={styles.chatContainer__settingsSubTitle}>{state.isChatEndedWithError ? state.isChatEndedWithError : `Chat ended with ${state?.isChatEndedWith}` } </div>}
					
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
						<div className={styles.chatContainer__rulesUpArrow} style={{ marginLeft: isMobileView? "66%" : "71%" }}></div>
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
					{state.isNewSessionStatus === "New" && (
						<div className={styles.chatContainer__newSessionScreen} onClick={handleChangeSessionStatus}>
							<div className={styles.chatContainer__rulesUpArrow} style={{ marginLeft: isMobileView? "85%" : "94%", marginTop: isMobileView? "70px": "90px" }}></div>
							<div className={styles.chatContainer__newSessionOptions} style={{ marginTop:"unset" }} onClick={(e) => e.stopPropagation()}>
								<div className={styles.chatContainer__newAd} onClick={handleAdCampaignClick}>Your banner ad can be here - check out</div>
								<div className={styles.chatContainer__newTabs}>
									{state.newTabs.map((tab, index) => (
										<div
											style={{ backgroundColor: index === state.tabIndex ? "#474663" : null, color: index === state.tabIndex ? "white" : null }}
											onClick={() => handleTabChange(index)}
											key={tab}
										>
											{tab}
										</div>
									))}
								</div>
								{socketRef.current && state.mySocketId && renderCorrectTab()}
								{!socketRef.curent && !state.mySocketId && <div className={styles.chatContainer__initLoader}><Loader width={40} height={20} style={{marginRight: "40px"}} color={"#474663"} /></div>}
							</div>
						</div>
					)}
					<div className={styles.chatContainer__chatAd}>
						Place your text Ads here  -
						<div className={styles.chatContainer__adAction} onClick={handleAdCampaignClick}>
							Know more
						</div>
					</div>
					<div className={styles.chatContainer__smartReply}>
						{state.smartRepliesArray.map((reply, index) => (
							<div
								style={{ pointerEvents: state.isNewSessionStatus === "New" ? "none" : null }}
								onClick={() => handleSmartReplyClick(reply.text)}
								className={styles.chatContainer__smartReplyItem}
								key={`${index}-${reply.text}`}
							>
								{reply.text}
							</div>
						))}
					</div>
					<div className={styles.chatContainer__input} style={{ pointerEvents: state.isNewSessionStatus === "New" ? "none" : null }}>
						<div className={styles.chatContainer__inputImageSelector}>
							<input type="file" onChange={(e) => handleFileUpload(e)} accept="image/*" />
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
									placeholder="your message here"
									className={styles.chatContainer__textarea}
									onKeyPress={(e) => e.key === "Enter"? handleSendClick(e): ""}
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
			<Head>
				<meta name="theme-color" content="#474663" />
			</Head>
			{isMobileView ? renderMobileView() : renderDesktopView()}
		</div>
	);
}

export default Index;
