import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

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
		console.log(slug);
		if (state.drawOnCanvas) {
			canvasContextRef.current = canvasRef.current.getContext("2d");
			imageRef.current = new window.Image();
			imageRef.current.src = getCurrentFrame("000");
			imageRef.current.onload = function () {
				canvasContextRef.current.imageSmoothingEnabled = false;
				canvasContextRef.current.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
			};
		}

		window.addEventListener("scroll", () => {
			const scrollTop = document.documentElement.scrollTop;
			const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
			const scrollFraction = scrollTop / maxScrollTop;
			let frameIndex = Math.min(frameCount.current - 1, Math.ceil(scrollFraction * frameCount.current));
			if (frameIndex === 0) frameIndex += 1;
			currentIndex.current = frameIndex.toString().padStart(3, "0");

			if (state.drawOnCanvas) {
				requestAnimationFrame(() => updateImage(frameIndex + 1));
			} else {
				if (imageRef.current) imageRef.current.src = getCurrentFrame(currentIndex.current);
			}
		});

		preloadImages();
	}, []);

	const getCurrentFrame = (idx) => {
		let str = typeof window !== "undefined" && window.innerWidth <= 768 ? `/${slug}/9_16${idx}.jpg` : `/${slug}/16_9${idx}.jpg`;
		return str;
	};

	const preloadImages = async () => {
		for (let i = 1; i < frameCount.current; i++) {
			const img = new window.Image();
			img.src = getCurrentFrame(i.toString().padStart(3, "0"));
		}
	};

	const updateImage = (index) => {
		imageRef.current.src = getCurrentFrame(index);
		canvasContextRef.current.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
	};

	return (
		<div ref={canvasHolderRef} id="canvasHolder">
			{!state.drawOnCanvas && (
				<div id="image">
					<img
						ref={imageRef}
						src={getCurrentFrame(currentIndex.current)}
						alt="image"
						width={typeof window !== "undefined" ? window.innerWidth : 100}
						height={typeof window !== "undefined" ? window.innerHeight : 100}
					/>
				</div>
			)}
			{state.drawOnCanvas && <canvas ref={canvasRef} id="hero-lightpass" />}
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
