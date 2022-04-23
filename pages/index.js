import React, { useState } from "react";

import styles from "../styles/Home.module.scss";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

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

export default function Home() {
	const [state, setState] = useState({
		isMobileView: false,
		tickOptions: ["We don’t save your chat", "Safe random chats", "Gender detection & filters", "Free to use", "Full Privacy Controls", "Image/Audio sharing"],
	});

	const handleMeetPeopleClick = () => {
		// Click event
		if (window.umami) window.umami("Meet People Button Click");
	};

	const renderLeftSection = () => (
		<div className={styles.mainContainer_leftSection}>
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
					Don{`'`}t just pass time <br /> Make memories
				</div>
				<div className={styles.mainContainer_tagLineButtonsContainer}>
					<button>Create Quiz</button>
					<button onClick={handleMeetPeopleClick}>
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
				{state.tickOptions.map((tick) => (
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
										pathname: footer.link,
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
			{/* Tracking Umami is code */}
			<Script data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEB_ID} strategy="lazyOnload" src={process.env.NEXT_PUBLIC_ANALYTICS_URL} />
			<Head>
				<title>BlaBla - Meet new people</title>
				<link rel="icon" href="/favicon.ico" />

				<meta name="theme-color" content="#474663" />
				<meta name="title" content="Talk with beautiful girls and handsome men" />
				<meta
					name="description"
					content="Do you also feel lonely? How many time you wanted to share something but you were afraid of getting judged by others?  start an interesting conversation with, someone Unknown, someone Caring, someone Funny, but someone Real, and someone who won't judge you, Head onto Blablah.app/live and meet new people rightaway"
				/>
				<meta
					name="keywords"
					content="anonymous random chat app,anonymous random video chat app,random anonymous voice chat,anonymous stranger chat app,best anonymous chat site,chat anonymously,chat anonymously online,anonymous chat with strangers,anonymous chat online,online anonymous chatting,india anonymous chat,"
				/>
				<meta name="robots" content="index, follow" />
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
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
