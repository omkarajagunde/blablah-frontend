import React, { useState, useEffect } from "react";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import styles from "../styles/Home.module.scss";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

// Icons !
import SiteLogoBlack from "../Resources/SiteLogoBlack.svg";
import SiteLogoWhite from "../Resources/SiteLogoWhite.svg";

function NavBar() {
	const [state, setState] = useState({
		isMobileView: false,
		isNavOpen: false,
		headerLinks: [
			{
				link: "/ads",
				title: "Buy Ads",
			},
			{
				link: "/quiz",
				title: "Create Quiz",
			},
			{
				link: "/live",
				title: "Live Chat",
			},
			{
				link: "/blog",
				title: "Blog",
			},
		],
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

	const handleNavigationToggle = () => {
		setState((prevState) => ({ ...prevState, isNavOpen: !prevState.isNavOpen }));
	};

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		setState((prevState) => ({ ...prevState, isMobileView: flag }));
		console.log("resize event triggered, updating local component state");
	}, 500);

	return (
		<div className={styles.mainContainer_siteLogoNavBar}>
			<div className={styles.mainContainer_siteLogo}>
				<Image src={state.isNavOpen ? SiteLogoWhite.src : SiteLogoBlack.src} alt="blabla-siteLogo.png" width={state.isMobileView ? 140 : 200} height={state.isMobileView ? 80 : 80} />
			</div>
			<div className={styles.mainContainer_navbar}>
				{state.headerLinks.map((header) => (
					<div>
						<Link
							href={{
								pathname: header.link,
							}}
						>
							{header.title}
						</Link>
					</div>
				))}
			</div>
			{state.isMobileView && (
				<div className={state.isNavOpen ? styles.mainContainer_siteNavigationWhite : styles.mainContainer_siteNavigationBlue} onClick={handleNavigationToggle}>
					<div></div>
					<div></div>
				</div>
			)}
			{/* Logic to show full screen navbar if on mobile */}
			{state.isNavOpen && (
				<div className={styles.mainContainer_navScreen}>
					{state.headerLinks.map((header) => (
						<div className={styles.mainContainer__navMenuItem}>
							<Link
								href={{
									pathname: header.link,
								}}
							>
								{header.title}
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default NavBar;
