import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.scss";
import Head from "next/head";
import Link from "next/link";

function Footer() {
	const [state, setState] = useState({
		isMobileView: false,
		isNavOpen: false,
		footerLinks: [
			{
				link: "/privacy-policy",
				title: "Privacy Policy",
			},
			{
				link: "/copyrights",
				title: "Copyrights",
			},
			{
				link: "/about-us",
				title: "About Us",
			},
		],
	});

	return (
		<div>
			{!state.isMobileView && (
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
}

export default Footer;
