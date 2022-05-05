import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import ReadingProgress from "../../components/ReadingProgress";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";


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
		blogCardsArr: props.blogCardsArr,
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

	const getTimeToRead = (text) => {
		return "8 mins";
	};

	return (
		<div>
			<ReadingProgress target={target} />
			<NavBar />
			<div className={styles.blogContainer} ref={target}>
				<div className={styles.blogContainer__publishedTitle}>
					<div>{new Date(props.blogTopic.publishedAt).toDateString()}</div>
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
				</div>
			</div>
			{renderSocialShare()}
			<div className={styles.blogContainer__blogTitle}>Other Similar Blogs!</div>
			<div className={styles.blogHome__fullView}>
			{state.blogCardsArr.map((blog) => (
						blog._id !== props.blogTopic._id && <div className={styles.blogHome__viewCard}>
							<Link
								href="/blog/[slug]"
								as={"/blog/" + blog.blogSlug}
							>
								<div className={styles.blogCard}>
									<div className={styles.blogCard__image}>
										<img src={blog.blogImage} alt={blog.blogImageAlt || ""} />
									</div>
									<div className={styles.blogCard__text}>
										<div className={styles.blogCard__title} style={{ maxWidth: "100%", fontSize: "1rem" }}>
											{blog.blogTitle}
										</div>
										<div className={styles.blogCard__timestamp} style={{ maxWidth: "100%", fontSize: ".7rem" }}>
											<div>{new Date(blog.publishedAt).toISOString()}</div>
											<div>{getTimeToRead(blog.blogHtml)}</div>
										</div>
										<div className={styles.blogCard__subtitle} style={{ maxWidth: "100%", fontSize: ".8rem", WebkitLineClamp: state.isMobileView ? 3 : 5 }}>
											{blog.shortDesc}
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

	let resp = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog?topics=true`);
	const blogCards = resp.data.data;
	// Pass ] data to the page via props
	return { props: { blogTopic: blogTopic, blogCardsArr: blogCards }, revalidate: 1 };
}

export default Slug;
