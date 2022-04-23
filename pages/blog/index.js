import React, { useState, useEffect, useRef } from "react";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import Image from "next/image";
import Link from "next/link";
import ReadingProgress from "../../components/ReadingProgress";

// Styles!
import styles from "../../styles/Blog.module.scss";

// Icons!
import TitleIcon from "../../Resources/the-blog-graphics.svg";

function index() {
	const target = useRef(null);
	const [state, setState] = useState({
		isMobileView: false,
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
							<Image src={TitleIcon.src} width={state.isMobileView ? 75 : 150} height={state.isMobileView ? 75 : 150} alt={`the-blog-icon`} />
						</div>
					</div>
				</div>
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
										<div className={styles.blogCard__subtitle} style={{ maxWidth: "100%", fontSize: ".8rem", WebkitLineClamp: state.isMobileView ? 3 : 5 }}>
											{blog.subTitle}
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

export default index;
