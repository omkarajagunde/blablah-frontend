import React, { useState, useEffect, useRef, useCallback } from "react";
import _ from "lodash";
import Compressor from "compressorjs";
import useUpdateEffect from "./_helpers/useUpdateEffect";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Loader from "../components/_helpers/Loader";

// Icons
import RefreshIcon from "../Resources/Refresh.svg";

// Styles
import styles from "../styles/live.module.scss";

// Actions
import { ClearLiveChatLogs, DetectGender, HandleIdentityChange } from "../actions/liveChatActions";

function IdentityTab() {
	const dispatch = useDispatch();
	const LiveChatSelector = useSelector((state) => state.liveChat, _.isEqual);
	const [state, setState] = useState({
		isMyGenderSpecified: false,
		isUserImageCaptured: false,
		genderFlag: null,
		genderFlagMessage: false,
		saveOrEditFlagFullname: LiveChatSelector.identityObj.fullname !== "",
		identityObj: LiveChatSelector.identityObj,
	});

	useEffect(() => {
		console.log("GENDER :: ", LiveChatSelector.identityObj);
		if (LiveChatSelector.identityObj?.gender !== "any") {
			setState((prevState) => ({
				...prevState,
				genderFlag: LiveChatSelector.identityObj?.gender !== "any",
				isUserImageCaptured: false,
				genderFlagMessage: `Your gender is ${LiveChatSelector.identityObj?.gender}`,
			}));
		}
	}, []);

	useUpdateEffect(() => {
		if (LiveChatSelector.detectedGenderStatus === 200) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({
				...prevState,
				genderFlagMessage: `Your gender is ${LiveChatSelector.identityObj?.gender}`,
				identityObj: { ...state.identityObj, gender: LiveChatSelector.identityObj?.gender },
				isUserImageCaptured: false,
				genderFlag: true,
			}));
			localStorage.setItem("gender", LiveChatSelector.identityObj?.gender);
		}

		if (LiveChatSelector.detectedGenderStatus === 500) {
			dispatch(ClearLiveChatLogs());
			setState((prevState) => ({ ...prevState, genderFlag: false, genderFlagMessage: "Wrong Image Provided!", isUserImageCaptured: false }));
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
		setState((prevState) => ({ ...prevState, isUserImageCaptured: false, genderFlag: null, genderFlagMessage: null }));
	};

	const handleNameChange = (eve) => {
		let value = eve.target.value.trim();
		if (value.length > 0) {
			setState((prevState) => ({ ...prevState, identityObj: { ...state.identityObj, fullname: value } }));
		}
	};

	const handleAddName = (eve) => {
		let elem = document.getElementById("NameInput");
		if (elem.value.trim().length > 0) {
			dispatch(HandleIdentityChange(state.identityObj));
			setState((prevState) => ({ ...prevState, saveOrEditFlagFullname: !state.saveOrEditFlagFullname }));
		}
	};

	const handleAgeChange = (eve) => {
		let value = eve.target.value.trim();
		if (value.length > 0) {
			setState((prevState) => ({ ...prevState, identityObj: { ...state.identityObj, age: value } }));
		}
	};

	const handleAddAge = (eve) => {
		let elem = document.getElementById("NameInput");
		if (elem.value.trim().length > 0) {
			dispatch(HandleIdentityChange(state.identityObj));
			setState((prevState) => ({ ...prevState, saveOrEditFlagAge: !state.saveOrEditFlagAge }));
		}
	};

	return (
		<div className={styles.chatContainer__myFriends}>
			<div className={styles.chatContainer__settingsTitle}>Cofirm you gender!</div>
			<div className={styles.chatContainer__settingsSubTitle}> Click a selfie of yourself from below, and we will detect your gender, We never save your photos </div>
			<div className={styles.chatContainer__identityBox} style={{ background: state.genderFlag && state.identityObj.gender ? "#58b12e" : null }}>
				{!state.isUserImageCaptured && !state.genderFlagMessage && (
					<React.Fragment>
						<input type="file" accept="image/*" capture="user" onChange={(eve) => handleVerifyIndetity(eve)} />
						<div>Click to capture image</div>
					</React.Fragment>
				)}

				{state.isUserImageCaptured && <Loader width={40} height={20} top={10} right={50} color={"white"} />}

				{state.genderFlagMessage && (
					<div className={styles.chatContainer__detectedGender}>
						<div>{state.genderFlagMessage} </div>
						<div onClick={handleResetImageCapture}>
							<Image src={RefreshIcon.src} alt="refresh" width={120} height={120} />
						</div>{" "}
					</div>
				)}
			</div>

			<div className={styles.chatContainer__settingsTitle}>Your full name?</div>
			<div className={styles.chatContainer__keywordInput} style={{ marginTop: "10px" }}>
				<input value={state.identityObj.fullname} onChange={handleNameChange} placeholder="Enter your name here" id="NameInput" readOnly={state.saveOrEditFlagFullname} />
				<div onClick={handleAddName}>{!state.saveOrEditFlagFullname ? "Save" : "Edit"}</div>
			</div>

			<div className={styles.chatContainer__settingsTitle}>Your age?</div>
			<div className={styles.chatContainer__keywordInput} style={{ marginTop: "10px" }}>
				<input value={state.identityObj.age} onChange={handleAgeChange} placeholder="Enter your name here" id="AgeInput" readOnly={state.saveOrEditFlagAge} />
				<div onClick={handleAddAge}>{!state.saveOrEditFlagAge ? "Save" : "Edit"}</div>
			</div>
		</div>
	);
}

export default IdentityTab;
