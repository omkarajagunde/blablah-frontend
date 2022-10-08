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
		frameCount: 0
	});
	const canvasRef = useRef(null);
	const canvasContextRef = useRef(null);
	const imageRef = useRef(null);
	const canvasHolderRef = useRef(null);
	const frameCount = useRef("000");
	const currentIndex = useRef(0);

	useEffect(() => {
		if (window.innerWidth <= 768) {
			setState((prevState) => ({ ...prevState, isMobileView: true, ext: "9_16" }));
			frameCount.current = props.template.mobileImageSeq.length;
		} else {
			setState((prevState) => ({ ...prevState, isMobileView: false, ext: "16_9" }));
			frameCount.current = props.template.laptopImageSeq.length;
		}

		window.addEventListener("resize", () => {
			if (window.innerWidth < 768) setIsMobileViewDebouncer(true);
			else setIsMobileViewDebouncer(false);
		});

		//canvasContextRef.current = canvasRef.current.getContext("2d");

		// imageRef.current = new Image();
		// imageRef.current.src = getCurrentFrame(0);
		// imageRef.current.onload = function () {
		// 	canvasContextRef.current.drawImage(imageRef.current, 0, 0);
		// };

		window.addEventListener("scroll", () => {
			const scrollTop = document.documentElement.scrollTop;
			const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
			const scrollFraction = scrollTop / maxScrollTop;
			const frameIndex = Math.min(frameCount.current - 1, Math.ceil(scrollFraction * frameCount.current));
			currentIndex.current = frameIndex
				.toString()
				.padStart(state.isMobileView ? state.templateData.mobileImageSeq.length.toString().length : props.template.laptopImageSeq.length.toString().length, "0");
			console.log("IMG - ", state.isMobileView ? state.templateData.mobileImageSeq.length.toString().length : props.template.laptopImageSeq.length.toString().length);
			setState((prevState) => ({ ...prevState, idx: currentIndex.current }));
			//requestAnimationFrame(() => updateImage(frameIndex + 1));
		});

		//preloadImages();
	}, []);

	useEffect(() => {
		//preloadImages();
		console.log("call preload images");
	}, [state.isMobileView]);

	useEffect(() => {
		console.log(state);
	}, [state]);

	// Debouncing resize event
	const setIsMobileViewDebouncer = AwesomeDebouncePromise((flag) => {
		if (flag) {
			frameCount.current = props.template.mobileImageSeq.length;
			setState((prevState) => ({ ...prevState, isMobileView: flag, ext: "9_16" }));
		} else {
			frameCount.current = props.template.laptopImageSeq.length;
			setState((prevState) => ({ ...prevState, isMobileView: flag, ext: "16_9" }));
		}
		console.log("resize event triggered, updating local component state");
	}, 500);

	const getCurrentFrame = (idx) => {
		//console.log(state.templateData, idx);
		//return state.isMobileView ? state.templateData.mobileImageSeq[idx] : props.template.laptopImageSeq[idx];
		return `../../Diwali_16_9/Happy_Diwali_16_9${idx}.jpg`;
	};

	const preloadImages = async () => {
		for (let i = 1; i < frameCount.current; i++) {
			const img = new Image();
			img.src = getCurrentFrame(i);
			//console.log(getCurrentFrame(i));
		}
	};

	const updateImage = (index) => {
		console.log(getCurrentFrame(index), index);
		imageRef.current.src = getCurrentFrame(index);
		canvasContextRef.current.drawImage(imageRef.current, 0, 0);
	};

	return (
		<div ref={canvasHolderRef} id="canvasHolder">
			{" "}
			{/* <Image src={`/Diwali_16_9/Happy_Diwali_16_9${currentIndex.current}.jpg`} alt="image" width={600} height={400} /> */}
			<div id="image">
				<img
					src={`/Happy_Diwali_${state.ext}${currentIndex.current}.jpg`}
					alt="image"
					width={typeof window !== "undefined" ? window.innerWidth : null}
					height={typeof window !== "undefined" ? window.innerHeight : null}
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
	console.log("wishesTemplates - ", wishesTemplates);
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
	console.log("params - ", params);
	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/wishes-template/${params.slug}`);
	const templateData = response.data.data;

	// Pass ] data to the page via props
	return { props: { template: templateData }, revalidate: 60 };
}

export default Slug;
