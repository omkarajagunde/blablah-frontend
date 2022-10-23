import React from "react";
import styles from "../styles/Diwali.module.scss";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";

function HeroAnim() {
	return (
		<div className={styles.path}>
			{isMobile && (
				<svg preserveAspectRatio="xMidYMax meet" viewBox="0 0 218 454" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M1.5 0V92H42L54 86.5L65 92H73L76.5 100L79.5 92H87L92 78.5L98 92H104.5L107 97.5L114 12.5L124 144L129.5 92H143.5L157.5 76L169 92H214.5V300.5H1.5V575.5"
						stroke="white"
						stroke-width="2"
						stroke-linejoin="round"
					/>
				</svg>
			)}
			{!isMobile && (
				<svg preserveAspectRatio="xMidYMax meet" viewBox="0 0 1085 1031" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M2 0V234H120.5L135.5 202L150.5 234L187.5 113.5L222 294L263 175L290.5 262L309.5 202L323 234L335.5 175L349.5 234H380.5V49H1082.5V583.5H2V378H187.5"
						stroke="white"
						stroke-width="4"
					/>
				</svg>
			)}
		</div>
	);
}

export default HeroAnim;
