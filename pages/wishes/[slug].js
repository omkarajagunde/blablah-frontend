import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { gsap } from "gsap/dist/gsap";
import { InView } from "react-intersection-observer";

function Slug(props) {
	const router = useRouter();
	const { slug } = router.query;
	const [state, setState] = useState({
		isMobileView: false,
		templateData: props.template,
		frameCount: 200,
		drawOnCanvas: true
	});
	const canvasRef = useRef(null);
	const canvasContextRef = useRef(null);
	const imageRef = useRef(null);
	const canvasHolderRef = useRef(null);
	const frameCount = useRef("200");
	const currentIndex = useRef("001");

	useEffect(() => {
		const load = async () => {
			if (typeof window !== undefined) {
				const ScrollMagic = (await import("scrollmagic")).default;
				const controller = new ScrollMagic.Controller();

				new ScrollMagic.Scene({
					duration: `${frameCount.current + 2}%`, // the scene should last for a scroll distance of 100px
					offset: getViewport()[1] - 50 // start this scene after scrolling for 50px
				})
					.setPin("#canvasHolder") // pins the element for the the scene's duration
					.addTo(controller);
			}
		};
		load();
		preloadImages();
	}, []);

	const getCurrentFrame = (idx) => {
		let str = typeof window !== "undefined" && window.innerWidth <= 768 ? `/${slug}/9_16${idx}.jpg` : `/${slug}/16_9${idx}.jpg`;
		return str;
	};

	const setScroller = (inView) => {
		if (inView) {
			if (state.drawOnCanvas) {
				canvasContextRef.current = canvasRef.current.getContext("2d");
				if (window.innerWidth < 768) {
					canvasRef.current.width = window.innerWidth + window.innerWidth;
					canvasRef.current.height = window.innerHeight + window.innerHeight + window.innerHeight;
				} else {
					canvasRef.current.width = window.innerWidth + 300;
					canvasRef.current.height = window.innerHeight + 300;
				}

				imageRef.current = new window.Image();
				imageRef.current.src = getCurrentFrame(currentIndex.current);
				imageRef.current.onload = function () {
					canvasContextRef.current.drawImage(imageRef.current, 0, 0);
				};
			}

			window.addEventListener("scroll", scrollHandler);
		} else {
			//window.removeEventListener("scroll", scrollHandler);
		}
	};

	const scrollHandler = () => {
		const scrollTop = document.documentElement.scrollTop;
		const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
		const scrollFraction = scrollTop / maxScrollTop;
		let frameIndex = Math.min(frameCount.current - 1, Math.ceil(scrollFraction * frameCount.current));
		if (frameIndex === 0) frameIndex += 1;
		currentIndex.current = frameIndex.toString().padStart(3, "0");

		if (state.drawOnCanvas) {
			requestAnimationFrame(() => updateImage(currentIndex.current));
		} else {
			if (imageRef.current) imageRef.current.src = getCurrentFrame(currentIndex.current);
		}
	};

	const preloadImages = async () => {
		for (let i = 1; i < frameCount.current; i++) {
			const img = new window.Image();
			img.src = getCurrentFrame(i.toString().padStart(3, "0"));
		}
	};

	function getViewport() {
		var viewPortWidth;
		var viewPortHeight;

		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
		if (typeof window.innerWidth != "undefined") {
			(viewPortWidth = window.innerWidth), (viewPortHeight = window.innerHeight);
		}

		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
		else if (typeof document.documentElement != "undefined" && typeof document.documentElement.clientWidth != "undefined" && document.documentElement.clientWidth != 0) {
			(viewPortWidth = document.documentElement.clientWidth), (viewPortHeight = document.documentElement.clientHeight);
		}

		// older versions of IE
		else {
			(viewPortWidth = document.getElementsByTagName("body")[0].clientWidth), (viewPortHeight = document.getElementsByTagName("body")[0].clientHeight);
		}
		return [viewPortWidth, viewPortHeight];
	}

	const updateImage = (index) => {
		imageRef.current.src = getCurrentFrame(index);
		canvasContextRef.current.drawImage(imageRef.current, 0, 0);
	};

	return (
		<div>
			<div className="section-1">Loading || Scrolling || Profile</div>
			<InView as="div" onChange={(inView, entry) => setScroller(inView)}>
				<div ref={canvasHolderRef} id="canvasHolder">
					{!state.drawOnCanvas && (
						<div id="img-sequencer">
							<img
								ref={imageRef}
								src={getCurrentFrame(currentIndex.current)}
								alt="image"
								width={typeof window !== "undefined" ? window.innerWidth : 100}
								height={typeof window !== "undefined" ? window.innerHeight : 100}
							/>
						</div>
					)}
					{state.drawOnCanvas && <canvas ref={canvasRef} id="img-sequencer" />}
				</div>
			</InView>
		</div>
	);
}

export async function getStaticPaths() {
	// Call an external API endpoint to get posts
	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/wishes-template?onlyMetaData=true`);
	const wishesTemplates = response.data.data;
	// Get the paths we want to pre-render based on posts
	const paths = wishesTemplates.map((template) => ({
		params: { slug: template.slug, title: template.title, templateId: template._id }
	}));

	// We'll pre-render only these paths at build time.
	// { fallback: blocking } will server-render pages
	// on-demand if the path doesn't exist.
	return {
		paths: [
			...paths // See the "paths" section below
		],
		fallback: "blocking" // See the "fallback" section below
	};
}

// This also gets called at build time
export async function getStaticProps({ params }) {
	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/wishes-template/${params.slug}`);
	const templateData = response.data.data;

	// Pass ] data to the page via props
	return { props: { template: templateData }, revalidate: 60 };
}

export default Slug;
