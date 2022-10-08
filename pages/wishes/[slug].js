import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

function Slug(props) {
	const router = useRouter();
	const { slug } = router.query;
	const [state, setState] = useState({
		templateData: props.template
	});

	useEffect(() => {
		console.log(state);
	}, [state]);

	return <div> Login and add info - {slug}</div>;
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
