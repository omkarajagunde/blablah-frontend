import React, { useState, useEffect, useRef } from "react";

import Head from "next/head";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import ReadingProgress from "../../components/ReadingProgress";
import { SEO } from "../../Resources/json-res";

// Styles !
import styles from "../../styles/Blog.module.scss";

// Icons !
import TitleIcon from "../../Resources/the-blog-graphics.svg";
import LeftIcon from "../../Resources/LeftIcon.svg";
import RightIcon from "../../Resources/RightIcon.svg";
import DownIcon from "../../Resources/DownIcon.svg";

// Jsons !

function Index(props) {
	const target = useRef(null);
	const [state, setState] = useState({
		isMobileView: false,
		isExpanded: false,
		templates: props.templates || [],
		categories: props.categories || [],
		selectedTemplateId: props.categories[0]?._id,
		mouseHoveredIndex: null
	});

	useEffect(() => {
		console.log(state);
	}, [state]);

	const handleSelectCategory = (template, index) => {
		let elem = document.getElementById("templates");
		if (elem) {
			elem.scrollIntoView();
		}
		setState((prevState) => ({ ...prevState, selectedTemplateId: template._id }));
	};

	const handleExpandCategories = () => {
		setState((prevState) => ({ ...prevState, isExpanded: !prevState.isExpanded }));
	};

	const handleTemplateMouseToggle = (idx, flag) => {
		setState((prevState) => ({ ...prevState, mouseHoveredIndex: flag ? idx : null }));
	};

	const handleGotoTemplate = (template) => {
		window.location.pathname = `/wishes/${template.slug}`;
	};

	return (
		<div>
			<ReadingProgress target={target} />
			{/* Tracking Umami is code */}
			<Script data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEB_ID} strategy="lazyOnload" src={process.env.NEXT_PUBLIC_ANALYTICS_URL} />
			<Head>
				<title>{SEO.wishes.pageTitle}</title>
				<link rel="icon" href="/favicon.ico" />

				<meta name="theme-color" content="#474663" />
				<meta name="title" content={SEO.wishes.metaTitle} />
				<meta name="description" content={SEO.wishes.description} />
				<meta name="keywords" content={SEO.wishes.keywords} />
				<meta name="robots" content="index, follow" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				<meta name="language" content="English" />
				<meta name="revisit-after" content="7 days" />

				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			<NavBar />

			<div className={styles.blogHome} ref={target}>
				<div className={styles.blogHome__title}>Wishes Templates</div>
				<div className={styles.blogHome__subtitle}>
					<div className={styles.blogHome__subtitleContainer}>
						<div>All templates are categorised by the festival names, we can click on category to reveal all the templates for selected category </div>
						<div>
							<Image src={TitleIcon.src} width={state.isMobileView ? 75 : 150} height={state.isMobileView ? 75 : 150} alt={`the-blog-icon`} />
						</div>
					</div>
				</div>
				<div className={styles.blogHome__fullView}>
					<div className={styles.wishes__wishCategories}>
						<div className={styles.wishes__wishCategoriesText}>
							<div>Categories</div>
							<div onClick={handleExpandCategories}>{state.isExpanded ? "Collapse all" : "Expand all"}</div>
						</div>
						<div className={styles.wishes__scrollBox}>
							{!state.isExpanded && (
								<div className={styles.wishes__scrollBoxLeft}>
									<Image src={LeftIcon.src} width={state.isMobileView ? 20 : 30} height={state.isMobileView ? 20 : 30} alt={`the-left-icon`} />
								</div>
							)}
							<div className={styles.wishes__scrollBoxItems} style={{ flexWrap: state.isExpanded ? "wrap" : "nowrap" }}>
								{state.categories.map((template, idx) => {
									return (
										<div
											style={{
												background: template._id === state.selectedTemplateId ? "#e56b9f" : null,
												color: template._id === state.selectedTemplateId ? "#ffffff" : null,
												minWidth: state.isExpanded ? "250px" : null
											}}
											onClick={() => handleSelectCategory(template, idx)}
											className={styles.wishes__scrollBoxItem}
										>
											{template.name}
										</div>
									);
								})}
							</div>
							{!state.isExpanded && (
								<div className={styles.wishes__scrollBoxRight}>
									<Image src={RightIcon.src} width={state.isMobileView ? 20 : 30} height={state.isMobileView ? 20 : 30} alt={`the-right-icon`} />
								</div>
							)}
						</div>
					</div>
					<div className={styles.wishes__wishCategories}>
						<div className={styles.wishes__wishCategoriesText}>
							<div>Templates</div>
						</div>
						<div className={styles.wishes__wishCategoriesSubText}>
							<div>Hover on a template to preview animation, click to customise the template</div>
						</div>
						<div className={styles.wishes__templatesBox} id="templates">
							{state.templates.length > 0 &&
								state.templates
									.filter((temp) => temp.category === state.selectedTemplateId)
									.map((template, idx) => {
										console.log(template);
										return (
											<div
												className={styles.wishes__template}
												onMouseEnter={() => handleTemplateMouseToggle(idx, true)}
												onMouseLeave={() => handleTemplateMouseToggle(idx, false)}
												onClick={() => handleGotoTemplate(template)}
												style={{
													opacity: state.mouseHoveredIndex !== idx && state.mouseHoveredIndex !== null ? "0.3" : "1"
												}}
											>
												<div>
													<img src={template.gif} alt={template.title}></img>
												</div>
												<div>
													<Link href={`/wishes/${template.slug}`}>{template.title}</Link>
												</div>
											</div>
										);
									})}
							{state.templates.length > 0 && state.templates.filter((temp) => temp.category === state.selectedTemplateId).length === 0 && (
								<div>{"No templates added yet..., please come back later"}</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}

// This also gets called at build time
// export async function getStaticProps({ params }) {
// 	let responseCategories = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/category`);
// 	const categories = responseCategories.data.data;

// 	let responseTemplates = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/wishes-template?onlyMetaData=true`);
// 	const wishesTemplates = responseTemplates.data.data;
// 	// Pass data to the page via props
// 	return {
// 		props: {
// 			templates: wishesTemplates,
// 			categories: categories
// 		},
// 		// 12 hrs === 43200 secs to revalidate
// 		revalidate: 43200
// 	};
// }

export default Index;
