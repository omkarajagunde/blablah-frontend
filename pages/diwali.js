import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Diwali.module.scss";
import HeroAnim from "../components/heroAnim";
import Image from "next/image";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";
import Script from "next/script";
import Head from "next/head";

function diwali() {
	const [state, setState] = useState({
		scroll: 0,
		audioAlreadyPlayed: false,
		scrollPercent: 0,
		isModalOpen: false,
		name: "Your name here, click below"
	});
	useEffect(() => {
		let params = new URLSearchParams(window.location.search);
		params = Object.fromEntries(params);
		console.log(params);
		if (params.n && params.n.trim().length > 0) {
			setState((prevState) => ({ ...prevState, name: params.n }));
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
	}, []);

	const handleClaimLink = () => {
		let name = prompt("Enter your name?");
		setState((prevState) => ({ ...prevState, name, isModalOpen: true }));
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
					url: "https://blablah.app/diwali?n=" + encodeURI(state.name)
				})
				.then(() => console.log("Successful share"))
				.catch((error) => console.log("Error sharing", error));
		}
	};

	const handleWpShare = () => {
		if (navigator.userAgent.match(/iPhone|Android/i)) {
			document.write(
				`<a id="wpShare" href="whatsapp://send?text=🧨 Please click below and accept my digital wish 🪔 - https://blablah.app/diwali?n=${state.name}">Share on WhatApp</a>`
			);
			document.getElementById("wpShare").click();
		}
	};

	return (
		<div className={styles.container}>
			<Script data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEB_ID} strategy="lazyOnload" src={process.env.NEXT_PUBLIC_ANALYTICS_URL} />
			<Head>
				<title>Happy Diwali 2022</title>
				<link rel="icon" href="/favicon.ico" />

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
			<HeroAnim />
			{state.scrollPercent > 90 && (
				<audio controls src="/HappyDiwali.mp">
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
						<div className={styles.linkContainer}>{`https://blablah.app/diwali?name=${state.name}`}</div>
						<div className={!isMobile ? styles.displaySpaceBetween : ""}>
							<button className={styles.share} onClick={handleShare}>
								Click to share
							</button>
							{isMobile && (
								<button className={styles.share} onClick={handleWpShare}>
									Whatsapp share
								</button>
							)}
							<div className={styles.attribution}>
								Created by{" "}
								<a target={"_blank"} href={"https://omkarajagunde.web.app"}>
									<b>@omkarajagunde</b>
								</a>
							</div>
						</div>
					</div>
				</div>
			)}
			<div className={styles.heroSection}>
				<div className={styles.logo}>Blablah</div>

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
