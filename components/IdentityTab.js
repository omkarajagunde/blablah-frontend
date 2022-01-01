import React, { useState, useEffect, useRef, useCallback } from "react";
import _ from "lodash";
import Compressor from "compressorjs";
import socketIOClient from "socket.io-client";
import useUpdateEffect from "./_helpers/useUpdateEffect";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Loader from "../components/_helpers/Loader";

// Icons
import RefreshIcon from "../Resources/Refresh.svg";

// Styles
import styles from "../styles/live.module.scss";

// Actions
import { ClearLiveChatLogs, DetectGender } from "../actions/liveChatActions";

function IdentityTab() {
	const dispatch = useDispatch();
	const LiveChatSelector = useSelector((state) => state.liveChat, _.isEqual);
	const [state, setState] = useState({
		isMyGenderSpecified: false,
		isUserImageCaptured: false,
		detectedGenderData: null,
		saveOrEditFlag: localStorage.getItem("username") ? true : false,
		username: "",
	});

	useEffect(() => {
		if (LiveChatSelector.detectedGenderData !== null) {
			localStorage.setItem("gender", LiveChatSelector.detectedGenderData.gender);
			setState((prevState) => ({ ...prevState, detectedGenderData: LiveChatSelector.detectedGenderData, isUserImageCaptured: false, username: localStorage.getItem("username") }));
		}
	}, []);

	useUpdateEffect(() => {
		if (LiveChatSelector.detectedGenderStatus === 200) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, detectedGenderData: LiveChatSelector.detectedGenderData, isUserImageCaptured: false }));
			localStorage.setItem("gender", LiveChatSelector.detectedGenderData.gender);
		}

		if (LiveChatSelector.detectedGenderStatus === 500) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, detectedGenderData: "Wrong image provided!", isUserImageCaptured: false }));
		}
	}, [LiveChatSelector.detectedGenderStatus]);

	const handleVerifyIndetity = (eve) => {
		setState((prevState) => ({ ...prevState, isUserImageCaptured: true }));
		new Compressor(eve.target.files[0], {
			quality: 0.4,

			// The compression process is asynchronous,
			// which means you have to access the `result` in the `success` hook function.]

			success(result) {
				console.log("compressed file result :: ", result);
				var reader = new FileReader();
				reader.readAsDataURL(result);
				reader.onload = (e) => {
					dispatch(DetectGender({ imageURL: e.target.result }));
				};
			},
			error(err) {
				console.log(err.message);
			},
		});
	};

	const handleResetImageCapture = () => {
		setState((prevState) => ({ ...prevState, isUserImageCaptured: false, detectedGenderData: null }));
	};

	const handleAddUsername = () => {
		let elem = document.getElementById("NameInput");
		if (elem.value.trim().length > 0 && !state.saveOrEditFlag) {
			setState((prevState) => ({ ...prevState, username: elem.value, saveOrEditFlag: true }));
			localStorage.setItem("username", elem.value.trim());
		} else setState((prevState) => ({ ...prevState, saveOrEditFlag: false }));
	};

	const handleUsernameChange = (eve) => {
		setState((prevState) => ({ ...prevState, username: eve.target.value }));
	};

	return (
		<div className={styles.chatContainer__myFriends}>
			<div className={styles.chatContainer__settingsTitle}>Cofirm you gender!</div>
			<div className={styles.chatContainer__settingsSubTitle}> Click a selfie of yourself from below, and we will detect your gender, We never save your photos </div>
			<div className={styles.chatContainer__identityBox} style={{ background: state.detectedGenderData && state.detectedGenderData.gender ? "#58b12e" : null }}>
				{!state.isUserImageCaptured && !state.detectedGenderData && (
					<React.Fragment>
						<input type="file" accept="image/*" capture="user" onChange={(eve) => handleVerifyIndetity(eve)} />
						<div>Click to capture image</div>
					</React.Fragment>
				)}

				{state.isUserImageCaptured && <Loader width={40} height={20} top={10} right={50} color={"white"} />}

				{state.detectedGenderData && (
					<div className={styles.chatContainer__detectedGender}>
						<div>{state.detectedGenderData.gender ? `Your gender is ${state.detectedGenderData.gender}` : state.detectedGenderData} </div>
						<div onClick={handleResetImageCapture}>
							<Image src={RefreshIcon.src} alt="refresh" width={120} height={120} />
						</div>{" "}
					</div>
				)}
			</div>

			<div className={styles.chatContainer__settingsTitle}>Your name?</div>
			<div className={styles.chatContainer__keywordInput} style={{ marginTop: "10px" }}>
				<input value={state.username} onChange={handleUsernameChange} placeholder="Enter your name here" id="NameInput" readOnly={state.saveOrEditFlag} />
				<div onClick={handleAddUsername}>{!state.saveOrEditFlag ? "Save" : "Edit"}</div>
			</div>
		</div>
	);
}

export default IdentityTab;
