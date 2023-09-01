import Script from "next/script";
import React from "react";

function Ads() {
	return (
		<div>
			<Script src="https://tally.so/widgets/embed.js" strategy="beforeInteractive" />
			<iframe
				style={{ width: "100vw", height: "100vh" }}
				data-tally-src="https://tally.so/r/nraqVL?transparentBackground=1"
				width="100%"
				height="100%"
				frameborder="0"
				marginheight="0"
				marginwidth="0"
				title="Blablah Ads"
			></iframe>
		</div>
	);
}

export default Ads;
