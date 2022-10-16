import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import axios from "axios";
import useUpdateEffect from "../../components/_helpers/useUpdateEffect";
import Image from "next/image";

function Slug(props) {
	const router = useRouter();
	const { slug } = router.query;
	const [state, setState] = useState({
		isMobileView: false,
		templateData: props.template,
		frameCount: 200,
		ext: "16_9"
	});
	const canvasRef = useRef(null);
	const canvasContextRef = useRef(null);
	const imageRef = useRef(null);
	const canvasHolderRef = useRef(null);
	const frameCount = useRef("200");
	const currentIndex = useRef("001");

	useEffect(() => {
		if (window.innerWidth <= 768) {
			setState((prevState) => ({ ...prevState, isMobileView: true, ext: "9_16" }));
			//frameCount.current = props.template.mobileImageSeq.length;
			frameCount.current = 200;
		} else {
			setState((prevState) => ({ ...prevState, isMobileView: false, ext: "16_9" }));
			//frameCount.current = props.template.laptopImageSeq.length;
			frameCount.current = 200;
		}

		window.addEventListener("resize", () => {
			if (window.innerWidth < 768) setIsMobileViewDebouncer(true);
			else setIsMobileViewDebouncer(false);
		});

		// canvasContextRef.current = canvasRef.current.getContext("2d");

		// imageRef.current = new window.Image();
		// console.log("imageRef.current - ", imageRef.current);
		// imageRef.current.src = getCurrentFrame("000");
		// imageRef.current.onload = function () {
		// 	canvasContextRef.current.imageSmoothingEnabled = false;
		// 	canvasContextRef.current.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
		// };

		window.addEventListener("scroll", () => {
			const scrollTop = document.documentElement.scrollTop;
			const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
			const scrollFraction = scrollTop / maxScrollTop;
			let frameIndex = Math.min(frameCount.current - 1, Math.ceil(scrollFraction * frameCount.current));
			if (frameIndex === 0) frameIndex += 1;
			currentIndex.current = frameIndex
				.toString()
				.padStart(state.isMobileView ? state.templateData.mobileImageSeq.length.toString().length : props.template.laptopImageSeq.length.toString().length, "0");

			//setState((prevState) => ({ ...prevState, idx: currentIndex.current }));
			//requestAnimationFrame(() => updateImage(frameIndex + 1));
			// console.log(imageRef.current);
			if (imageRef.current) imageRef.current.src = getCurrentFrame(currentIndex.current);
		});

		preloadImages();
	}, []);

	useEffect(() => {
		preloadImages();
		console.log("call preload images");
	}, [state.isMobileView]);

	useEffect(() => {
		console.log(state);
	}, [state]);

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		if (flag) {
			//frameCount.current = props.template.mobileImageSeq.length;
			frameCount.current = 200;
			setState((prevState) => ({ ...prevState, isMobileView: flag, ext: "9_16" }));
		} else {
			//frameCount.current = props.template.laptopImageSeq.length;
			frameCount.current = 200;
			setState((prevState) => ({ ...prevState, isMobileView: flag, ext: "16_9" }));
		}
		console.log("resize event triggered, updating local component state");
	}, 500);

	const getCurrentFrame = (idx) => {
		//console.log(state.templateData, idx);
		//return state.isMobileView ? state.templateData.mobileImageSeq[idx] : props.template.laptopImageSeq[idx];
		//console.log(`/Happy_Diwali_${state.ext}${currentIndex.current}.jpg`);
		let str = typeof window !== "undefined" && window.innerWidth <= 768 ? `/Happy_Diwali_9_16${currentIndex.current}.jpg` : `/Happy_Diwali_16_9${currentIndex.current}.jpg`;
		console.log("str -- ", str);
		return str;
		//return state.isMobileView ? `/Happy_Diwali_9_16310.jpg` : `/Happy_Diwali_16_9310.jpg`;
		//return `/ezgif-frame-${currentIndex.current}.jpg`;
	};

	const preloadImages = async () => {
		for (let i = 1; i < frameCount.current; i++) {
			const img = new window.Image();
			img.src = getCurrentFrame(i);
			//console.log(getCurrentFrame(i));
		}
	};

	const updateImage = (index) => {
		console.log("imageRef.current - ", imageRef.current);
		window.imageRef = imageRef.current;
		imageRef.current.src = getCurrentFrame(index);
		canvasContextRef.current.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
	};

	return (
		<div ref={canvasHolderRef} id="canvasHolder">
			{" "}
			{/* <Image src={`/Diwali_16_9/Happy_Diwali_16_9${currentIndex.current}.jpg`} alt="image" width={600} height={400} /> */}
			<div id="image">
				<img
					ref={imageRef}
					src={getCurrentFrame(currentIndex.current)}
					alt="image"
					width={typeof window !== "undefined" ? window.innerWidth : 100}
					height={typeof window !== "undefined" ? window.innerHeight : 100}
				/>
			</div>
			{/* <canvas ref={canvasRef} id="hero-lightpass" /> */}
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
