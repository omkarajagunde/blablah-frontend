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
						d="M1 0.5V231H169L182.5 224.5L196.5 231H206L211 240.5L214 231H223.5L229.5 215L235.5 229L244.5 233L247.5 237.5L255.5 134.5L268 294.5L274.5 231H290.5L307.5 213L322.5 231H379.5V49.5H1081.5V583.5H1V377.5H185.5"
						stroke="white"
						stroke-width="4"
						stroke-linejoin="round"
					/>
				</svg>
			)}
		</div>
	);
}

export default HeroAnim;
