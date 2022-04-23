import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import ReadingProgress from "../../components/ReadingProgress";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import Link from "next/link";

// Styles!
import styles from "../../styles/Blog.module.scss";

// Icons!
import TimeIcon from "../../Resources/time-outline.svg";
import InstagramLogo from "../../Resources/logo-instagram.svg";
import LinkedinLogo from "../../Resources/logo-linkedin.svg";
import FacebookLogo from "../../Resources/logo-facebook.svg";
import TwitterLogo from "../../Resources/logo-twitter.svg";
import WhatsappLogo from "../../Resources/logo-whatsapp.svg";
import CopyLogo from "../../Resources/copy-outline.svg";
import LiveIcon from "../../Resources/live-icon.png";

function Slug() {
	const router = useRouter();
	const { slug } = router.query;
	const target = useRef(null);
	const [state, setState] = useState({
		isMobileView: false,

		blogKeywords: ["Branding", "Communication", "Experience", "Identity"],
		blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
		blogImageAlt: "blog-image",
		blogCardsArr: [
			{
				title: "How to find friends online, How to find friends online",
				blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
				blogImageAlt: "blog-image",
				subTitle:
					"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
				publishedText: "14 Apr 2022",
				readTime: "8 mins",
				blogLink: "/url",
			},
			{
				title: "How to find friends online, How to find friends online",
				blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
				blogImageAlt: "blog-image",
				subTitle:
					"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
				publishedText: "14 Apr 2022",
				readTime: "8 mins",
				blogLink: "/url",
			},
			{
				title: "How to find friends online, How to find friends online",
				blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
				blogImageAlt: "blog-image",
				subTitle:
					"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
				publishedText: "14 Apr 2022",
				readTime: "8 mins",
				blogLink: "/url",
			},
			{
				title: "How to find friends online, How to find friends online",
				blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
				blogImageAlt: "blog-image",
				subTitle:
					"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
				publishedText: "14 Apr 2022",
				readTime: "8 mins",
				blogLink: "/url",
			},
			{
				title: "How to find friends online, How to find friends online",
				blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
				blogImageAlt: "blog-image",
				subTitle:
					"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
				publishedText: "14 Apr 2022",
				readTime: "8 mins",
				blogLink: "/url",
			},
			{
				title: "How to find friends online, How to find friends online, , How to find friends online , How to find friends online ashgdashjdgas",
				blogImageUrl: "https://thumbs.dreamstime.com/b/blog-information-website-concept-workplace-background-text-view-above-127465079.jpg",
				blogImageAlt: "blog-image",
				subTitle:
					"10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself, 10 ways how we can find friends online and express ourself",
				publishedText: "14 Apr 2022",
				readTime: "8 mins",
				blogLink: "/url",
			},
		],
		blogSocialShares: [
			{
				logoRes: InstagramLogo,
				type: "instagram",
			},
			{
				logoRes: LinkedinLogo,
				type: "linkedin",
			},
			{
				logoRes: FacebookLogo,
				type: "facebook",
			},
			{
				logoRes: TwitterLogo,
				type: "twitter",
			},
			{
				logoRes: WhatsappLogo,
				type: "whatsapp",
			},
			{
				logoRes: CopyLogo,
				type: "copy",
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

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		setState((prevState) => ({ ...prevState, isMobileView: flag }));
		console.log("resize event triggered, updating local component state");
	}, 500);

	const generateSocialLink = (type) => {
		console.log(type);
		return type.type;
	};

	const renderSocialShare = () => {
		return (
			<div className={styles.blogContainer__socialShares}>
				<div className={styles.blogContainer__socialSharesTitle}>Please share</div>
				{state.blogSocialShares.map((type) => (
					<div>
						<Link
							href={{
								pathname: generateSocialLink(type),
							}}
						>
							<Image src={type.logoRes.src} width={25} height={25} alt={`${type.type}-icon`} />
						</Link>
					</div>
				))}
			</div>
		);
	};

	const renderLiveChatInitmation = () => {
		return (
			<div className={styles.blogContainer__liveCard}>
				<div className={styles.blogContainer__liveCardDiv}>
					<div className={styles.blogContainer__liveCardLine}>
						<div>
							<Image src={LiveIcon.src} height={60} width={80} alt="" />
						</div>{" "}
						<div>
							<b>234</b> people chatting live
						</div>
					</div>
					<div className={styles.blogContainer__liveCardButton}>
						<button>Start chatting now</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div>
			<ReadingProgress target={target} />
			<NavBar />
			<div className={styles.blogContainer} ref={target}>
				<div className={styles.blogContainer__publishedTitle}>
					<div>Published January 13, 2021</div>
					<div>
						<Image src={TimeIcon.src} width={state.isMobileView ? 20 : 20} height={state.isMobileView ? 25 : 25} alt="estimated-time-icon" />
						<div style={{ marginLeft: "10px" }}>8 mins read</div>
					</div>
				</div>
				<div className={styles.blogContainer__blogTitle}>7 Rules of Effective Branding</div>
				<div className={styles.blogContainer__blogSubTitle}>Why branding matters to your business</div>
				<div className={styles.blogContainer__blogKeywords}>
					{state.blogKeywords.map((keyword) => (
						<div className={styles.blogContainer__blogKwd}>{keyword}</div>
					))}
				</div>
				<div className={styles.blogContainer__blogBigImage}>
					<img src={state.blogImageUrl} alt={state.blogImageAlt} />
				</div>
				<div className={styles.blogContainer__blogBigHeadline}>
					If the protocol is a lender, and fees are generated by users borrowing, they will vote emissions on assets with the highest borrow rates, which will incentivize more borrowing due
					to increased incentives, which earns more fees, thus Ouroboros.
				</div>

				<div className={styles.blogContainer__blogContent}>
					If the protocol is an AMM, and fees are generated by trading, they will vote emissions on pools with the highest trade volume, this will incentivize more liquidity for that pool,
					which improves trade quotes, which increases trade volume, and thus earns more fees. The design itself can be deployed on any protocol to align emission with incentives. Background
					In part 2, we want to explore the fees themselves, how they are paid out, how this can be used by other protocols, and how to set them up to best maximize the (3,3) spirit. Fee
					assets; Token vs Stable Fees are often use for “buyback” models, while this seems positive for the protocol, this means the fees themselves are correlated to the protocols token
					price, this volatility is a blessing if prices go up, but a curse when prices go down. The veCRV model popularized paying out fees in stable coins, this in itself, changes how
				</div>
				{renderLiveChatInitmation()}
				<div className={styles.blogContainer__blogContent}>
					If the protocol is an AMM, and fees are generated by trading, they will vote emissions on pools with the highest trade volume, this will incentivize more liquidity for that pool,
					which improves trade quotes, which increases trade volume, and thus earns more fees. The design itself can be deployed on any protocol to align emission with incentives. Background
					In part 2, we want to explore the fees themselves, how they are paid out, how this can be used by other protocols, and how to set them up to best maximize the (3,3) spirit. Fee
					assets; Token vs Stable Fees are often use for “buyback” models, while this seems positive for the protocol, this means the fees themselves are correlated to the protocols token
					price, this volatility is a blessing if prices go up, but a curse when prices go down. The veCRV model popularized paying out fees in stable coins, this in itself, changes how
				</div>
				<div className={styles.blogContainer__blogContent}>
					If the protocol is an AMM, and fees are generated by trading, they will vote emissions on pools with the highest trade volume, this will incentivize more liquidity for that pool,
					which improves trade quotes, which increases trade volume, and thus earns more fees. The design itself can be deployed on any protocol to align emission with incentives. Background
					In part 2, we want to explore the fees themselves, how they are paid out, how this can be used by other protocols, and how to set them up to best maximize the (3,3) spirit. Fee
					assets; Token vs Stable Fees are often use for “buyback” models, while this seems positive for the protocol, this means the fees themselves are correlated to the protocols token
					price, this volatility is a blessing if prices go up, but a curse when prices go down. The veCRV model popularized paying out fees in stable coins, this in itself, changes how
				</div>
				<div className={styles.blogContainer__blogContent}>
					If the protocol is an AMM, and fees are generated by trading, they will vote emissions on pools with the highest trade volume, this will incentivize more liquidity for that pool,
					which improves trade quotes, which increases trade volume, and thus earns more fees. The design itself can be deployed on any protocol to align emission with incentives. Background
					In part 2, we want to explore the fees themselves, how they are paid out, how this can be used by other protocols, and how to set them up to best maximize the (3,3) spirit. Fee
					assets; Token vs Stable Fees are often use for “buyback” models, while this seems positive for the protocol, this means the fees themselves are correlated to the protocols token
					price, this volatility is a blessing if prices go up, but a curse when prices go down. The veCRV model popularized paying out fees in stable coins, this in itself, changes how
				</div>
				<div className={styles.blogContainer__blogContent}>
					If the protocol is an AMM, and fees are generated by trading, they will vote emissions on pools with the highest trade volume, this will incentivize more liquidity for that pool,
					which improves trade quotes, which increases trade volume, and thus earns more fees. The design itself can be deployed on any protocol to align emission with incentives. Background
					In part 2, we want to explore the fees themselves, how they are paid out, how this can be used by other protocols, and how to set them up to best maximize the (3,3) spirit. Fee
					assets; Token vs Stable Fees are often use for “buyback” models, while this seems positive for the protocol, this means the fees themselves are correlated to the protocols token
					price, this volatility is a blessing if prices go up, but a curse when prices go down. The veCRV model popularized paying out fees in stable coins, this in itself, changes how
				</div>
			</div>
			{renderSocialShare()}
			<div className={styles.blogHome__fullView}>
				{state.blogCardsArr.map((blog) => (
					<div className={styles.blogHome__viewCard}>
						<Link
							href={{
								pathname: blog.blogUrl,
							}}
						>
							<div className={styles.blogCard}>
								<div className={styles.blogCard__image}>
									<img src={blog.blogImageUrl} alt={blog.imageAlt} />
								</div>
								<div className={styles.blogCard__text}>
									<div className={styles.blogCard__title} style={{ maxWidth: "100%", fontSize: "1rem" }}>
										{blog.title}
									</div>
									<div className={styles.blogCard__timestamp} style={{ maxWidth: "100%", fontSize: ".7rem" }}>
										<div>{blog.publishedText}</div>
										<div>{blog.readTime}</div>
									</div>
									<div className={styles.blogCard__subtitle} style={{ maxWidth: "100%", fontSize: ".8rem", WebkitLineClamp: 5 }}>
										{blog.subTitle}
									</div>
								</div>
							</div>
						</Link>
					</div>
				))}
			</div>
			<Footer />
		</div>
	);
}

export default Slug;
