import React, { useState, useEffect, useRef } from "react";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import ReadingProgress from "../../components/ReadingProgress";

// Styles!
import styles from "../../styles/Blog.module.scss";

// Icons!
import TitleIcon from "../../Resources/the-blog-graphics.svg";

function index(props) {
	const target = useRef(null);
	const [state, setState] = useState({
		isMobileView: false,
		blogCardsArr: props.blogTopics
	});

	// Run only first time when component loads
	useEffect(() => {
		// set initial level
		if (window.innerWidth <= 768) setState((prevState) => ({ ...prevState, isMobileView: true }));
		else setState((prevState) => ({ ...prevState, isMobileView: false }));

		console.log("BlogTopics ;: ", props.blogTopics);

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

	const getTimeToRead = (text) => {
		return "8 mins";
	};

	const redirectToPage = (slug) => {
		window.location.replace(slug);
	};

	return (
		<div>
			<ReadingProgress target={target} />
			<NavBar />
			<div className={styles.blogHome} ref={target}>
				<div className={styles.blogHome__title}>The Blog!</div>
				<div className={styles.blogHome__subtitle}>
					<div className={styles.blogHome__subtitleContainer}>
						<div>This is the blog, hope you find it very useful</div>
						<div>
							<Image
								src={TitleIcon.src}
								width={state.isMobileView ? 75 : 150}
								height={state.isMobileView ? 75 : 150}
								alt={`the-blog-icon`}
							/>
						</div>
					</div>
				</div>
				<div className={styles.blogHome__fullView}>
					{state.blogCardsArr.map((blog) => (
						<div className={styles.blogHome__viewCard}>
							<Link href={"/blog/" + blog.blogSlug} onClick={() => redirectToPage("/blog/" + blog.blogSlug)}>
								<div className={styles.blogCard}>
									<div className={styles.blogCard__image}>
										<img src={blog.blogImage} alt={blog.blogImageAlt || ""} />
									</div>
									<div className={styles.blogCard__text}>
										<div className={styles.blogCard__title} style={{ maxWidth: "100%", fontSize: "1rem" }}>
											{blog.blogTitle}
										</div>
										<div className={styles.blogCard__timestamp} style={{ maxWidth: "100%", fontSize: ".7rem" }}>
											<div>{new Date(blog.publishedAt).toDateString()}</div>
											<div>{getTimeToRead(blog.blogHtml)}</div>
										</div>
										<div
											className={styles.blogCard__subtitle}
											style={{
												maxWidth: "100%",
												fontSize: ".8rem",
												WebkitLineClamp: state.isMobileView ? 3 : 5
											}}
										>
											{blog.shortDesc}
										</div>
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</div>
			<Footer />
		</div>
	);
}

// This also gets called at build time
export async function getStaticProps({ params }) {
	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog?topics=true`);
	const blogTopics = response.data.data;
	// Pass ] data to the page via props
	return { props: { blogTopics: [...blogTopics] }, revalidate: 1 };
}

export default index;
