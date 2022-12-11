import React, { useState, useEffect } from "react";

import styles from "../styles/Home.module.scss";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

// Icons !
import Polygon1 from "../Resources/Polygon1.svg";
import Polygon2 from "../Resources/Polygon2.svg";
import Polygon3 from "../Resources/Polygon3.svg";
import Polygon4 from "../Resources/Polygon4.svg";
import Tick from "../Resources/tick.svg";
import LiveChatMobilePreview from "../Resources/LiveChatMobilePreview.svg";
import LiveChatMobilePreviewOptions from "../Resources/LiveChatMobilePreviewOptions.svg";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

// Jsons !
import { headerTexts, SEO } from "../Resources/json-res";

export default function Home() {
	const [state, setState] = useState({
		isMobileView: false,
		headerTexts: JSON.parse(JSON.stringify(headerTexts)),
		selectedHeaderIndex: 0
	});

	useEffect(() => {
		setTimeout(() => {
			let selectedHeaderIndex;
			if (state.selectedHeaderIndex === state.headerTexts.length - 1) {
				selectedHeaderIndex = 0;
			} else {
				selectedHeaderIndex = state.selectedHeaderIndex + 1;
			}
			setState((prevState) => ({ ...prevState, selectedHeaderIndex }));
		}, 5000);
	}, [state.selectedHeaderIndex]);

	const handleButtonClick = () => {
		// Click event
		// TODO TRACKING EVENT : Meet People Button Click
	};

	const renderLeftSection = () => (
		<div className={styles.mainContainer_leftSection} key={state.selectedHeaderIndex}>
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

				<div className={styles.mainContainer_tagLineText}>{state.headerTexts[state.selectedHeaderIndex].title}</div>
				<div className={styles.mainContainer_tagLineButtonsContainer}>
					{state.headerTexts[state.selectedHeaderIndex].buttons.map((btn) => (
						<button onClick={handleButtonClick} key={btn.title}>
							<Link
								href={{
									pathname: btn.link
								}}
							>
								{btn.text}
							</Link>
						</button>
					))}
				</div>
			</div>

			<div className={styles.mainContainer_features}>
				{state.headerTexts[state.selectedHeaderIndex].ticks.map((tick) => (
					<div className={styles.mainContainer_featureItem}>
						<Image src={Tick.src} width={30} height={30} alt="" />
						<div>{tick}</div>
					</div>
				))}
			</div>
		</div>
	);

	const renderRightSection = () => (
		<div className={styles.mainContainer_rightSection} style={{ marginTop: state.isNavOpen ? "70px" : null }}>
			<div className={styles.mainContainer_mobilePreview}>
				<div className={styles.mainContainer_liveChatPreviewBig}>
					<Image src={LiveChatMobilePreview.src} alt="" priority width={450} height={600} />
				</div>

				<div className={styles.mainContainer_liveChatPreviewSmall}>
					<Image src={LiveChatMobilePreviewOptions.src} alt="" width={300} height={550} />
				</div>
			</div>
			{state.isMobileView && (
				<div className={styles.footerContainer}>
					<div className={styles.footerContainer_container}>
						{state.footerLinks.map((footer) => (
							<div>
								<Link
									href={{
										pathname: footer.link
									}}
								>
									{footer.title}
								</Link>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);

	return (
		<div>
			<Head>
				<title>{SEO.home.pageTitle}</title>
				<link rel="icon" href="/favicon.ico" />

				<meta name="theme-color" content="#474663" />
				<meta name="title" content={SEO.home.metaTitle} />
				<meta name="description" content={SEO.home.description} />
				<meta name="keywords" content={SEO.home.keywords} />
				<meta name="robots" content="index, follow" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="language" content="English" />
				<meta name="revisit-after" content="7 days" />

				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			<NavBar />
			<div className={styles.mainContainer}>
				{renderLeftSection()}
				{renderRightSection()}
			</div>
			<Footer />
		</div>
	);
}
