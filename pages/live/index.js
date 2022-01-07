import React, { useState, useEffect, useRef, useCallback } from "react";
import _ from "lodash";
import Compressor from "compressorjs";
import DarkModeToggle from "react-dark-mode-toggle";
import TextareaAutosize from "react-textarea-autosize";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import socketIOClient from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import Loader from "../../components/_helpers/Loader";
import IdentityTab from "../../components/IdentityTab";
import useUpdateEffect from "../../components/_helpers/useUpdateEffect";

// Images
import SiteLogoWhite from "../../Resources/SiteLogoWhite.svg";
import SendIcon from "../../Resources/SendIcon.svg";
import ImageIcon from "../../Resources/ImageIcon.svg";

// Styles
import styles from "../../styles/live.module.scss";

// Socket event strings
const CLIENT_INTRODUCTION = "CLIENT_INTRODUCTION";
const CLIENT_PAIRED = "CLIENT_PAIRED";
const PEER_STARTED_TYPING = "PEER_STARTED_TYPING";
const PEER_STOPPED_TYPING = "PEER_STOPPED_TYPING";
const SEND_MESSAGE = "SEND_MESSAGE";
const WILLFUL_END_SESSION = "WILLFUL_END_SESSION";

function Index() {
	const dispatch = useDispatch();
	const LiveChatSelector = useSelector((state) => state.liveChat, _.isEqual);
	const [state, setState] = useState({
		isMobileView: false,
		isDarkMode: true,
		isSenderTyping: false,
		isRulesViewOpen: false,
		isMyGenderSpecified: false,
		isChatEnded: false,
		isUserImageCaptured: false,
		detectedGenderData: null,
		userFoundFlag: false,
		userSearchTryingCount: 0,
		isNewSessionStatus: "New",
		mySocketId: "",
		newTabs: ["Chat settings", "My Friends", "Identity"],
		settingsTabViewOptions: ["Male", "Female", "Any"],
		settingsTabIndex: 2,
		tabIndex: 0,
		commonInterestsArray: [],
		smartRepliesArray: ["Happy Diwali!", "Happy Christmas", "United we stand", " Boycott Bollywood"],
		restrictedModeKeywordsArray: [],
		restrictedModeNewKeywordsArray: ["office", "work"],
		chatMessagesArray: [],
	});
	const socketRef = useRef();
	const userFoundRef = useRef();

	useUpdateEffect(() => {
		console.log("My ID :: ", state.mySocketId);
	}, [state.mySocketId]);

	useUpdateEffect(() => {
		if (state.pairedUserData) console.log("user found with socketId  :: ", state.pairedUserData?.pairedPersonData.socketId);
	}, [state.userFoundFlag]);

	const handleSocketEvent = (eve, data) => {
		if (eve === CLIENT_INTRODUCTION) {
			socketRef.current.emit(CLIENT_INTRODUCTION, {
				socketId: socketRef.current.id,
				action: CLIENT_INTRODUCTION,
				actionData: {
					interests: state.commonInterestsArray,
					genderInterest: state.settingsTabViewOptions[state.settingsTabIndex],
					pairFound: false,
				},
			});
		}

		if (eve === PEER_STARTED_TYPING) {
			socketRef.current.emit(PEER_STARTED_TYPING, {
				socketId: socketRef.current.id,
				action: PEER_STARTED_TYPING,
				actionData: {
					typing: true,
					pairedPersonSocketId: state.pairedUserData.pairedPersonData.socketId,
				},
			});
		}

		if (eve === PEER_STOPPED_TYPING) {
			socketRef.current.emit(PEER_STOPPED_TYPING, {
				socketId: socketRef.current.id,
				action: PEER_STOPPED_TYPING,
				actionData: {
					typing: false,
					pairedPersonSocketId: state.pairedUserData.pairedPersonData.socketId,
				},
			});
		}

		if (eve === SEND_MESSAGE) {
			socketRef.current.emit(SEND_MESSAGE, {
				socketId: socketRef.current.id,
				action: SEND_MESSAGE,
				actionData: {
					chatData: data,
					pairedPersonSocketId: state.pairedUserData.pairedPersonData.socketId,
				},
			});
		}

		if (eve === WILLFUL_END_SESSION) {
			socketRef.current.emit(WILLFUL_END_SESSION, {
				socketId: socketRef.current.id,
				action: WILLFUL_END_SESSION,
				actionData: {
					username: state.username,
					pairedPersonSocketId: state.pairedUserData.pairedPersonData.socketId,
				},
			});
		}
	};

	// This useEffect is like a loop that trys to automatically reconnect if the pair was not found
	useEffect(() => {
		// If user was NOT found try again
		if (!userFoundRef.current && state.userSearchTryingCount !== 0) {
			setTimeout(() => {
				handleSocketEvent(CLIENT_INTRODUCTION);
				setState((prevState) => ({ ...prevState, userSearchTryingCount: prevState.userSearchTryingCount + 2 }));
			}, 2000);
		}

		// If user was found and connection was successful
		if (userFoundRef.current && state.userSearchTryingCount !== 0) {
			setState((prevState) => ({ ...prevState, isNewSessionStatus: "Skip", userSearchTryingCount: 0 }));
		}
	}, [state.userSearchTryingCount]);

	// Run only first time when component loads
	useEffect(() => {
		// set initial level

		let gender = localStorage.getItem("gender");
		if (gender) {
			setState((prevState) => ({ ...prevState, detectedGenderData: { gender } }));
		}

		userFoundRef.current = false;
		if (window.innerWidth <= 768) setState((prevState) => ({ ...prevState, isMobileView: true }));
		else setState((prevState) => ({ ...prevState, isMobileView: false }));

		window.addEventListener("resize", () => {
			if (window.innerWidth < 768) setIsMobileViewDebouncer(true);
			else setIsMobileViewDebouncer(false);
		});

		socketRef.current = socketIOClient(process.env.NEXT_PUBLIC_SERVER_URL, {
			path: "/live",
			query: { msg: "OmkarAjagunde" },
			transports: ["websocket"],
		});

		socketRef.current.on("connect", () => {
			//console.log("socket connected with id :: ", socketRef.current.id);
			setState((prevState) => ({ ...prevState, mySocketId: socketRef.current.id }));
		});

		socketRef.current.on(CLIENT_PAIRED, (data) => {
			setState((prevState) => ({ ...prevState, userFoundFlag: true, pairedUserData: data }));
			userFoundRef.current = true;
			//console.log("Search finished, user found for live chat :: ", data, socketRef);
		});

		socketRef.current.on(SEND_MESSAGE, (data) => {
			setState((prevState) => ({ ...prevState, chatMessagesArray: [...prevState.chatMessagesArray, data.chatData] }));
		});

		socketRef.current.on(PEER_STARTED_TYPING, (data) => {
			setState((prevState) => ({ ...prevState, isSenderTyping: data.typing }));
		});

		socketRef.current.on(PEER_STOPPED_TYPING, (data) => {
			setState((prevState) => ({ ...prevState, isSenderTyping: data.typing }));
		});

		socketRef.current.on(WILLFUL_END_SESSION, (data) => {
			setState((prevState) => ({ ...prevState, isNewSessionStatus: "New", isChatEnded: true, isChatEndedWith: data.username || data.socketId }));
		});

		socketRef.current.on("error", (data) => {
			console.log("SOCKET IO ERROR :: ", data);
		});

		return () => {
			socketRef.current.disconnect();
			window.removeEventListener("resize", () => {});
		};
	}, []);

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

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		setState((prevState) => ({ ...prevState, isMobileView: flag }));
		console.log("resize event triggered, updating local component state");
	}, 500);

	const handleToggleMode = (e) => {
		setState((prevState) => ({ ...prevState, isDarkMode: !state.isDarkMode }));
	};

	const handleSendClick = () => {
		let elem = document.getElementById("inputText");
		let chatArray = [...state.chatMessagesArray];
		chatArray.map((msg, index) => {
			msg.newlyAdded = false;
		});
		if (elem.value.trim().length > 0) {
			let time = new Date();
			let sendMsgObject = {
				type: "sent",
				isImage: false,
				isAudio: false,
				msg: elem.value,
				senderName: localStorage.getItem("username") || state.mySocketId,
				timeStamp: `${time.getHours()}:${time.getMinutes()}, ${time.toDateString()}`,
				newlyAdded: true,
			};

			// Send message
			handleSocketEvent(SEND_MESSAGE, sendMsgObject);
			elem.value = "";
			setState((prevState) => ({ ...prevState, chatMessagesArray: [...chatArray, sendMsgObject] }));
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
			senderName: localStorage.getItem("username") || state.mySocketId,
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
				restrictedModeKeywordsArray: [...state.restrictedModeKeywordsArray, value.trim()],
			}));
			elem.value = "";
		}
	};

	const handleChangeSessionStatus = () => {
		if (state.isNewSessionStatus === "New") {
			if (state.mySocketId) setState((prevState) => ({ ...prevState, userSearchTryingCount: prevState.userSearchTryingCount + 1 }));
		}
		if (state.isNewSessionStatus === "Skip") setState((prevState) => ({ ...prevState, isNewSessionStatus: "Really" }));
		if (state.isNewSessionStatus === "Really") {
			handleSocketEvent(WILLFUL_END_SESSION, null);
			setState((prevState) => ({ ...prevState, isNewSessionStatus: "New", userSearchTryingCount: 0, userFoundFlag: false, chatMessagesArray: [] }));
		}
	};

	const handleTabChange = (index) => {
		setState((prevState) => ({ ...prevState, tabIndex: index }));
	};

	const handleSettingsTabChange = (index) => {
		let myGender = localStorage.getItem("gender");
		if (myGender !== null) setState((prevState) => ({ ...prevState, settingsTabIndex: index, isMyGenderSpecified: true }));
		else setState((prevState) => ({ ...prevState, isMyGenderSpecified: false }));
	};

	const handleAddInterest = (e) => {
		let value = e.target.value;
		if (e.key === "Enter" && value.trim().length > 0) {
			setState((prevState) => ({
				...prevState,
				commonInterestsArray: [...state.commonInterestsArray, value.trim()],
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
						senderName: state.username || state.mySocketId,
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
								<img src={msg.msg} />
							</div>
							<div className={styles.chatContainer__receivedMsgName}>
								<b>{msg.senderName}</b>, <br /> {msg.timeStamp}
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
							<div className={styles.chatContainer__receivedMsg}>{msg.msg}</div>
							<div className={styles.chatContainer__receivedMsgName}>
								<b>{msg.senderName}</b>,<br /> {msg.timeStamp}
							</div>
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
						<div className={styles.chatContainer__receivedMsg}>{msg.msg}</div>
						<div className={styles.chatContainer__receivedMsgName}>
							<b>{msg.senderName}</b>, <br />
							{msg.timeStamp}
						</div>
					</div>
				</div>
			);
		});
	};

	// rendering desktop view
	const renderDesktopView = () => {
		return <div>Live Chat Page on desktop, coming soon with a boom</div>;
	};

	const renderCorrectTab = () => {
		if (state.tabIndex === 0) {
			return (
				<div className={styles.chatContainer__settings}>
					{state.isChatEnded && <div>Chat ended with {state?.pairedUserData?.pairedPersonData?.socketId}</div>}

					<div className={styles.chatContainer__settingsTitle}>Connect With</div>
					<div className={styles.chatContainer__settingsSubTitle} style={{ animation: !state.isMyGenderSpecified ? "alert 1s ease" : null }}>
						To use this confirm your gender by <b onClick={() => handleTabChange(2)}>clicking here</b>
					</div>
					<div className={styles.chatContainer__settingsTabView}>
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
						<div>Want to advertise on blabla? - Read here</div>
						<button onClick={handleChangeSessionStatus} disabled={state.userSearchTryingCount !== 0}>
							Start session
						</button>
						{!state.userFoundFlag && state.userSearchTryingCount !== 0 && <Loader width={40} height={20} top={10} right={50} color={"white"} />}
					</div>
					{!state.userFoundFlag && state.userSearchTryingCount !== 0 && (
						<div className={styles.chatContainer__tryingToFindText}> {`Trying to find user since ${state.userSearchTryingCount}s`} </div>
					)}
				</div>
			);
		}

		if (state.tabIndex === 1) {
			return <div className={styles.chatContainer__myFriends}>my friends</div>;
		}

		if (state.tabIndex === 2) {
			return <IdentityTab />;
		}
	};

	// rendering the mobile view
	const renderMobileView = () => {
		return (
			<div className={styles.chatContainer} id="chatContainer" style={{ overflowY: state.isRulesViewOpen ? "hidden" : null }}>
				{state.isRulesViewOpen && (
					<div className={styles.chatContainer__rulesView} onClick={handleToggleRules}>
						<div className={styles.chatContainer__rulesUpArrow}></div>
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

							<div className={styles.chatContainer__rulesTitle} style={{ marginTop: "20px" }}>
								1. BlaBla app respects and <b>encourages Freedom of speech</b>, but BlaBla will not tolerate practice of freedom of speech that will trouble/harm any other person that{" "}
								<b>includes discrimination on any basis</b> (e.g. Race, Place, religion etc) or pratices that are illegal as per the land of law
							</div>

							<div className={styles.chatContainer__rulesTitle} style={{ marginTop: "10px" }}>
								2. BlaBla app is a free to use service and does not give any garantee/warantee of software, <b>please you this service at your own risk</b>
							</div>

							<div className={styles.chatContainer__rulesTitle} style={{ marginTop: "10px" }}>
								3. BlaBla app does not in any way saves your chat logs
							</div>

							<div className={styles.chatContainer__rulesTitle} style={{ marginTop: "40px", marginBottom: "10px" }}>
								You can also enter custom keywords
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
						<DarkModeToggle size={100} onChange={handleToggleMode} checked={state.isDarkMode} />
					</div>
				</div>

				{renderChatMessages()}
				{state.isSenderTyping && (
					<div className={styles.chatContainer__typingContainer}>
						<div></div>
						<div></div>
						<div></div>
					</div>
				)}

				<div className={styles.chatContainer__controls}>
					{state.isNewSessionStatus === "New" && (
						<div className={styles.chatContainer__newSessionScreen} onClick={handleChangeSessionStatus}>
							<div className={styles.chatContainer__newSessionOptions} onClick={(e) => e.stopPropagation()}>
								<div className={styles.chatContainer__newAd}>Your banner ad can be here - check out</div>
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
								{renderCorrectTab()}
							</div>
							<div className={styles.chatContainer__arrowDown}></div>
						</div>
					)}
					<div className={styles.chatContainer__chatAd}>
						iPhone selling for 20k, only 10 days used -
						<div className={styles.chatContainer__adAction}>
							<Link
								href={{
									pathname: "/ads",
								}}
							>
								Visit now
							</Link>
						</div>
					</div>
					<div className={styles.chatContainer__smartReply}>
						<div className={styles.chatContainer__skipNewReally} onClick={handleChangeSessionStatus}>
							{state.isNewSessionStatus}?
						</div>
						{state.smartRepliesArray.map((reply, index) => (
							<div
								style={{ pointerEvents: state.isNewSessionStatus === "New" ? "none" : null }}
								onClick={() => handleSmartReplyClick(reply)}
								className={styles.chatContainer__smartReplyItem}
								key={`${index}-${reply}`}
							>
								{reply}
							</div>
						))}
					</div>
					<div className={styles.chatContainer__input} style={{ pointerEvents: state.isNewSessionStatus === "New" ? "none" : null }}>
						<TextareaAutosize
							onFocus={() => handleSocketEvent(PEER_STARTED_TYPING)}
							onBlur={() => handleSocketEvent(PEER_STOPPED_TYPING)}
							id="inputText"
							placeholder="your message here"
							className={styles.chatContainer__textarea}
						/>

						<div>
							<Image onClick={handleSendClick} src={SendIcon.src} alt="send-icon" width={30} height={30} />
						</div>

						<div className={styles.chatContainer__inputImageSelector}>
							<input type="file" onChange={(e) => handleFileUpload(e)} accept="image/*" />
							<Image src={ImageIcon.src} alt="image-icon" width={25} height={25} />
						</div>
					</div>
				</div>
			</div>
		);
	};

	const { isMobileView } = state;
	return <div style={{ height: "100%" }}>{isMobileView ? renderMobileView() : renderDesktopView()}</div>;
}

export default Index;
