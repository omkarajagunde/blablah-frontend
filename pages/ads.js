import Script from "next/script";
import React from "react";

function Ads() {
	return (
		<div>
			<iframe style={{ width: "100vw", height: "100vh" }} data-tally-src="https://tally.so/r/nraqVL?transparentBackground=1" title="Blablah Ads"></iframe>
			<Script
				id="tally-js"
				src="https://tally.so/widgets/embed.js"
				onLoad={() => {
					Tally.loadEmbeds();
				}}
			/>
		</div>
	);
}

export default Ads;
