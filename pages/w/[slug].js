import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

function Slug(props) {
	const router = useRouter();
	const { slug } = router.query;

	return <div> User view - {slug}</div>;
}

// export async function getStaticPaths() {
// 	// Call an external API endpoint to get posts
// 	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog?topics=0`);
// 	const blogTopics = response.data.data;
// 	// Get the paths we want to pre-render based on posts
// 	const paths = blogTopics.map((blog) => ({
// 		params: { slug: blog.blogSlug, blogTitle: blog.blogTitle }
// 	}));

// 	// We'll pre-render only these paths at build time.
// 	// { fallback: blocking } will server-render pages
// 	// on-demand if the path doesn't exist.
// 	return {
// 		paths: [
// 			...paths // See the "paths" section below
// 		],
// 		fallback: "blocking" // See the "fallback" section below
// 	};
// }

// // This also gets called at build time
// export async function getStaticProps({ params }) {
// 	let response = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog/${params.slug}`);
// 	const blogTopic = response.data.data;

// 	let resp = await axios.get(`${process.env.NEXT_PUBLIC_BLABLAH_URL}/api/blog?topics=true`);
// 	const blogCards = resp.data.data;
// 	// Pass ] data to the page via props
// 	return { props: { blogTopic: blogTopic, blogCardsArr: blogCards }, revalidate: 1 };
// }

export default Slug;
