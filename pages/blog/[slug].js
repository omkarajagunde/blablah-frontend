import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import ReadingProgress from "../../components/ReadingProgress";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import axios from "axios";
import "suneditor/dist/css/suneditor.min.css";
const SunEditor = dynamic(() => import("suneditor-react"), {
	//besure to import dynamically
	ssr: false,
});

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

function Slug(props) {
	const router = useRouter();
	const editor = useRef();
	const { slug } = router.query;
	const target = useRef(null);
	const [state, setState] = useState({
		isMobileView: false,
		editorContent: props.blogTopic.blogHtml,
		blogKeywords: ["Branding", "Communication", "Experience", "Identity"],
		blogTitle: props.blogTopic.blogTitle,
		blogImageUrl: props.blogTopic.blogImage,
		blogShortDesc: props.blogTopic.shortDesc,
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

		console.log(props);

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
		return type.type;
	};

	// The sunEditor parameter will be set to the core suneditor instance when this function is called
	const getSunEditorInstance = (sunEditor) => {
		editor.current = sunEditor;
	};

	const handleEditorOnLoad = () => {
		editor.current.readOnly(true);
		editor.current.setContents(state.editorContent);
		editor.current.disable();
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
				<div className={styles.blogContainer__blogTitle}>{state.blogTitle}</div>
				<div className={styles.blogContainer__blogKeywords}>
					{props.blogTopic.metaKeywords.map((keyword) => (
						<div className={styles.blogContainer__blogKwd}>{keyword}</div>
					))}
				</div>
				<div className={styles.blogContainer__blogBigImage}>
					<img src={state.blogImageUrl} alt={state.blogImageAlt} />
				</div>
				<div className={styles.blogContainer__blogBigHeadline}>{state.blogShortDesc}</div>

				<div className={styles.blogContainer__blogContent} dangerouslySetInnerHTML={{ __html: state.editorContent }}>
					{/* <SunEditor
						width="100%"
						value={state.editorContent}
						onLoad={handleEditorOnLoad}
						getSunEditorInstance={getSunEditorInstance}
						setOptions={{ height: "max-content" }}
						setDefaultStyle="font-family:'Montserrat', sans-serif"
					/> */}
				</div>
				{renderLiveChatInitmation()}
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

export async function getStaticPaths() {
	// Call an external API endpoint to get posts
	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog?topics=0`);
	const blogTopics = response.data.data;
	// Get the paths we want to pre-render based on posts
	const paths = blogTopics.map((blog) => ({
		params: { slug: blog.blogSlug, blogTitle: blog.blogTitle },
	}));

	// We'll pre-render only these paths at build time.
	// { fallback: blocking } will server-render pages
	// on-demand if the path doesn't exist.
	return {
		paths: [
			...paths, // See the "paths" section below
		],
		fallback: "blocking", // See the "fallback" section below
	};
}

// This also gets called at build time
export async function getStaticProps({ params }) {
	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog/${params.slug}`);
	const blogTopic = response.data.data;
	// Pass ] data to the page via props
	return { props: { blogTopic: blogTopic }, revalidate: 1 };
}

export default Slug;
