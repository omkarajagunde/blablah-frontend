import React, { useEffect, useState } from "react";
import styles from "../styles/Diwali.module.scss";
import HeroAnim from "../components/heroAnim";
import { nanoid } from "nanoid";
import { isMobile } from "react-device-detect";
import { firebase } from "../apiHelpers/firebase";
import { getDatabase, ref, set } from "firebase/database";
import Script from "next/script";
import Head from "next/head";
import useUpdateEffect from "../components/_helpers/useUpdateEffect";
import axios from "axios";
import { countryCodes } from "../Resources/json-res";

const APP_NAME = "opnr";

function diwali() {
	const [state, setState] = useState({
		scroll: 0,
		audioAlreadyPlayed: false,
		scrollPercent: 0,
		isModalOpen: false,
		name: "Your name here, click below",
		phoneNum: "",
		isPhoneValid: false,
		isNameValid: false
	});
	useEffect(() => {
		let params = new URLSearchParams(window.location.search);
		params = Object.fromEntries(params);
		console.log(params);
		if (params.n && params.n.trim().length > 0) {
			setState((prevState) => ({ ...prevState, name: params.n.replaceAll("-", " ") }));
		}

		let path = document.querySelector("path");
		let pathLength = path.getTotalLength();
		path.style.strokeDasharray = pathLength + " " + pathLength;
		path.style.strokeDashoffset = pathLength;

		window.addEventListener("scroll", () => {
			var scrollPercent = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight);
			var drawLength = pathLength * scrollPercent;
			path.style.strokeDashoffset = pathLength - drawLength;
			setState((prevState) => ({ ...prevState, scroll: document.documentElement.scrollTop, scrollPercent: scrollPercent * 100 }));
		});

		// Save country code
		axios.get("https://us-central1-notzillow.cloudfunctions.net/getCoordinates").then((resp) => {
			if (resp.status === 200) {
				let countryCode = resp.data.data.country;
				countryCodes.forEach((cn) => {
					if (cn.code === countryCode) {
						sessionStorage.setItem("cc", cn.dial_code);
						sessionStorage.setItem("cn", cn.name);
					}
				});
			}
		});

		// Analytics init...
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag("js", new Date());
		gtag("config", "G-Y56FZ0BQNJ");
	}, []);

	useUpdateEffect(() => {
		console.log(state);
		if (state.isNameValid && state.isPhoneValid) {
			writeUserData();
		}
	}, [state.isNameValid, state.isPhoneValid]);

	useEffect(() => {
		if (state.scrollPercent > 90 && !state.audioAlreadyPlayed) {
			let media = new Audio("/HappyDiwali.mp3");
			setTimeout(() => media.play(), 1000);
			setState((prevState) => ({ ...prevState, audioAlreadyPlayed: true }));
		}

		if (state.scrollPercent < 90) {
			setState((prevState) => ({ ...prevState, audioAlreadyPlayed: false }));
		}
	}, [state.scrollPercent, state.audioAlreadyPlayed]);

	const writeUserData = () => {
		const db = getDatabase(firebase);
		set(ref(db, "users/" + `id-${nanoid(10)}-` + state.name), {
			name: state.name,
			phone: state.phoneNum,
			countryCode: sessionStorage.getItem("cc") || "NA (please refer `phone` field)",
			countryName: sessionStorage.getItem("cn") || "NA",
			userCreatedLink: `https://${APP_NAME}.app/diwali?n=` + encodeURI(state.name),
			createdDate: new Date().toString()
		});
	};

	const getPhone = () => {
		if (state.isPhoneValid) return true;

		let msg = sessionStorage.getItem("cc")
			? "Enter your phone number? (exclude country code, enter only phone number)"
			: "Enter your phone number? (include country code e.g. +91)";

		let phoneNum = prompt(msg);
		if (phoneNum && (phoneNum.trim().length < 6 || isNaN(phoneNum.replaceAll(" ", "").trim()))) {
			let flag = confirm("Phone number should be atleast 6 digit numeric value!");
			if (flag) {
				return getPhone();
			}
		} else {
			if (phoneNum) setState((prevState) => ({ ...prevState, phoneNum: phoneNum.replaceAll(" ", ""), isPhoneValid: true }));
			return true;
		}
	};

	const convertToSlug = (Text) => {
		return Text.toLowerCase()
			.replace(/ /g, "-")
			.replace(/[^\w-]+/g, "");
	};

	const getName = () => {
		let name = prompt("Enter your name?");
		if (name && name.trim().length < 4) {
			let flag = confirm("Name should be atleast 4 letter character value (no numbers allowed)");
			if (flag) {
				getName();
			}
		} else {
			if (name) setState((prevState) => ({ ...prevState, name: convertToSlug(name), isNameValid: true, isModalOpen: true }));
		}
	};

	const handleClaimLink = () => {
		let flag = getPhone();
		if (flag) getName();
	};

	const handleCloseModal = () => {
		setState((prevState) => ({ ...prevState, isModalOpen: false }));
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: "Wish you happy diwali, may this diwali bring you joy and prosperity...",
					text: "🧨 Please click below and accept my digital wish 🪔",
					url: `https://${APP_NAME}.app/diwali?n=` + encodeURI(state.name)
				})
				.then(() => console.log("Successful share"))
				.catch((error) => console.log("Error sharing", error));
		}
	};

	const handleWpShare = () => {
		if (navigator.userAgent.match(/iPhone|Android/i)) {
			document.write(
				`<a id="wpShare" href="whatsapp://send?text=🧨 Please click below and accept my digital wish 🪔 - https://${APP_NAME}.app/diwali?n=${state.name}">Share on WhatApp</a>`
			);
			document.getElementById("wpShare").click();
		}
	};

	return (
		<div className={styles.container}>
			<Head>
				<title>Happy Diwali 2022</title>
				<link rel="icon" href="/opnr.ico" />

				<meta name="theme-color" content="#474663" />
				<meta name="title" content="Digital Happy Diwali Wish" />
				<meta name="description" content="Wish you happy diwali, may this diwali bring you joy and prosperity..." />
				<meta name="image" content={"/diwaliImage.png"} />
				<meta name="keywords" content={"Happy Diwali gif, Happy diwali greeting, Happy diwali link generator, happy diwali images"} />
				<meta name="robots" content="index, follow" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="language" content="English" />
				<meta name="revisit-after" content="1 days" />
			</Head>
			<Script src="dist/clipboard.min.js" />
			<Script src="https://www.googletagmanager.com/gtag/js?id=G-Y56FZ0BQNJ" />
			<HeroAnim />
			{state.scrollPercent > 90 && (
				<audio controls src="/HappyDiwali.mp3">
					Your browser does not support the
					<code>audio</code> element.
				</audio>
			)}
			{state.isModalOpen && state.name !== "Your name here, click below" && (
				<div className={styles.modal}>
					<div className={styles.modalContent}>
						<div className={styles.displaySpaceBetween}>
							<b>{isMobile ? "Here is your link" : "Here is your link, share with your friends"}</b>
							<div>
								<b style={{ cursor: "pointer" }} onClick={handleCloseModal}>
									X
								</b>
							</div>
						</div>
						<div className={styles.linkContainer}>{`https://${APP_NAME}.app/diwali?n=${state.name}`}</div>
						<div className={!isMobile ? styles.displaySpaceBetween : ""}>
							<button className={styles.share} onClick={handleShare}>
								Click to share
							</button>
							{isMobile && (
								<button className={styles.share} onClick={handleWpShare}>
									Whatsapp share
								</button>
							)}
						</div>
					</div>
				</div>
			)}
			<div className={styles.heroSection}>
				<div className={styles.logo}>Opnr</div>

				<div className={styles.gif}>
					{state.scrollPercent > 90 && (
						<div className={styles.username}>
							<div className={styles.subtitle}>From,</div>
							{state.name}
							<br />
							<button onClick={handleClaimLink} className={styles.claimYourLink}>
								Claim your link
							</button>
						</div>
					)}
					{state.scrollPercent > 50 && <iframe src="/HappDiwaliSVG.svg" className={styles.iframe} />}
				</div>

				{state.scroll < 20 && (
					<div className={styles.startScroll}>
						Start <br /> scrolling...
					</div>
				)}
			</div>
		</div>
	);
}

export default diwali;
