import React, { useState, useEffect } from "react";
import AwesomeDebouncePromise from "awesome-debounce-promise";

import styles from "../styles/Home.module.scss";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

// Icons !
import SiteLogoBlack from "../Resources/SiteLogoBlack.svg";
import SiteLogoWhite from "../Resources/SiteLogoWhite.svg";
import Polygon1 from "../Resources/Polygon1.svg";
import Polygon2 from "../Resources/Polygon2.svg";
import Polygon3 from "../Resources/Polygon3.svg";
import Polygon4 from "../Resources/Polygon4.svg";
import Tick from "../Resources/tick.svg";
import LiveChatMobilePreview from "../Resources/LiveChatMobilePreview.svg";
import LiveChatMobilePreviewOptions from "../Resources/LiveChatMobilePreviewOptions.svg";

export default function Home() {
	const [state, setState] = useState({
		isMobileView: false,
		isNavOpen: false,
	});

	// Run only first time when component loads
	useEffect(() => {
		// set initial level
		if (window.innerWidth <= 768) setState((prevState) => ({ ...prevState, isMobileView: true }));
		else setState((prevState) => ({ ...prevState, isMobileView: false }));

		window.addEventListener("resize", () => {
			if (window.innerWidth <= 768) setIsMobileViewDebouncer(true);
			else setIsMobileViewDebouncer(false);
		});
		return () => {
			window.removeEventListener("resize", () => {});
		};
	}, []);

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		setState((prevState) => ({ ...prevState, isMobileView: flag }));
		console.log("resize event triggered, updating local component state");
	}, 500);

	const handleNavigationToggle = () => {
		setState((prevState) => ({ ...prevState, isNavOpen: !prevState.isNavOpen }));
	};

	const handleRedirectLiveChat = () => {
		window.location.pathname = "/live"
	}

	const renderLeftSection = () => (
		<div className={styles.mainContainer_leftSection}>
			<div className={styles.mainContainer_siteLogoNavBar}>
				<div className={styles.mainContainer_siteLogo}>
					<Image src={state.isNavOpen ? SiteLogoWhite.src : SiteLogoBlack.src} alt="blabla-siteLogo.png" width={state.isMobileView ? 140 : 200} height={state.isMobileView ? 80 : 80} />
				</div>
				{state.isMobileView && (
					<div className={state.isNavOpen ? styles.mainContainer_siteNavigationWhite : styles.mainContainer_siteNavigationBlue} onClick={handleNavigationToggle}>
						<div></div>
						<div></div>
					</div>
				)}
			</div>

			<div className={styles.mainContainer_tagLine}>
				<div className={styles.mainContainer_tagLine_poly1}>
					<Image src={Polygon1.src} width={state.isMobileView ? 180 : 180} height={state.isMobileView ? 180 : 180} alt="" />
				</div>
				<div className={styles.mainContainer_tagLine_poly2}>
					<Image src={Polygon2.src} width={state.isMobileView ? 200 : 200} height={state.isMobileView ? 200 : 200} alt="" />
				</div>
				<div className={styles.mainContainer_tagLine_poly3}>
					<Image src={Polygon3.src} width={state.isMobileView ? 200 : 280} height={state.isMobileView ? 200 : 280} alt="" />
				</div>
				<div className={styles.mainContainer_tagLine_poly4}>
					<Image src={Polygon4.src} width={state.isMobileView ? 200 : 190} height={state.isMobileView ? 200 : 190} alt="" />
				</div>

				<div>
					Don{`'`}t just timepass <br /> Make memories
				</div>
				<div className={styles.mainContainer_tagLineButtonsContainer}>
					<button>Create Quiz</button>  
					<button >
						<Link
							href={{
								pathname: "/live",
							}}
						>
							Meet People
						</Link>
					</button>
				</div>
			</div>

			<div className={styles.mainContainer_features}>
				<div className={styles.mainContainer_featureItem}>
					<Image src={Tick.src} width={30} height={30} alt="" />
					<div>We don’t save your chat logs</div>
				</div>

				<div className={styles.mainContainer_featureItem}>
					<Image src={Tick.src} width={30} height={30} alt="" />
					<div>Anonymous safe random chats</div>
				</div>

				<div className={styles.mainContainer_featureItem}>
					<Image src={Tick.src} width={30} height={30} alt="" />
					<div>Gender detection & filters</div>
				</div>

				<div className={styles.mainContainer_featureItem}>
					<Image src={Tick.src} width={30} height={30} alt="" />
					<div>Free to use</div>
				</div>

				<div className={styles.mainContainer_featureItem}>
					<Image src={Tick.src} width={30} height={30} alt="" />
					<div>Full Privacy Controls</div>
				</div>

				<div className={styles.mainContainer_featureItem}>
					<Image src={Tick.src} width={30} height={30} alt="" />
					<div>Image/Audio sharing</div>
				</div>
			</div>
		</div>
	);

	const renderRightSection = () => (
		<div className={styles.mainContainer_rightSection} style={{ marginTop: state.isNavOpen ? "70px" : null }}>
			<div className={styles.mainContainer_navbar}>
				<div>
					<Link
						href={{
							pathname: "/ads",
						}}
					>
						Buy Ads
					</Link>
				</div>

				<div>
					<Link
						href={{
							pathname: "/",
						}}
					>
						Create Quiz
					</Link>
				</div>

				<div>
					<Link
						href={{
							pathname: "/live",
						}}
					>
						Live Chat
					</Link>
				</div>

				<div>
					<Link
						href={{
							pathname: "/about",
						}}
					>
						About
					</Link>
				</div>
			</div>
			<div className={styles.mainContainer_mobilePreview}>
				<div className={styles.mainContainer_liveChatPreviewBig}>
					<Image src={LiveChatMobilePreview.src} alt="" priority width={450} height={600} />
				</div>

				<div className={styles.mainContainer_liveChatPreviewSmall}>
					<Image src={LiveChatMobilePreviewOptions.src} alt="" width={300} height={550} />
				</div>
			</div>
		</div>
	);

	return (
		<div className={styles.mainContainer}>
			<Head>
				<title>BlaBla</title>
				<meta name="description" content="Please update the Favicion" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			{/* Logic to show full screen navbar if on mobile */}
			{state.isNavOpen && (
				<div className={styles.mainContainer_navScreen}>
					<div className={styles.mainContainer__navMenu}>
						<div className={styles.mainContainer__navMenuItem}>
							<Link
								href={{
									pathname: "/ads",
								}}
							>
								Buy Ads
							</Link>
						</div>
						<div className={styles.mainContainer__navMenuItem}>
							<Link
								href={{
									pathname: "/quiz",
								}}
							>
								Create Quiz
							</Link>
						</div>
						<div className={styles.mainContainer__navMenuItem}>
							<Link
								href={{
									pathname: "/live",
								}}
							>
								Live Chat
							</Link>
						</div>
						<div className={styles.mainContainer__navMenuItem}>
							<Link
								href={{
									pathname: "/about",
								}}
							>
								About
							</Link>
						</div>
					</div>
				</div>
			)}
			{renderLeftSection()}
			{renderRightSection()}
		</div>
	);
}
