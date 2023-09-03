import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import Script from "next/script";

// import the two exports from the last code snippet.
import { persistor, store } from "../store";
import { HighlightInit } from "@highlight-run/next/client";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
	return (
		<Provider store={store}>
			<Head>
				<meta name="monetag" content="434dd3c20537d6306e961765a655ca48" />
			</Head>
			<Analytics />
			{/* <Script type="text/javascript">
				{`(function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "ikp0t7an2x");`}
			</Script> */}

			<Script src="https://www.googletagmanager.com/gtag/js?id=UA-222049771-1" />
			<Script>
				{` window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'UA-222049771-1');`}
			</Script>
			<Script src="https://www.googletagmanager.com/gtag/js?id=G-97F16HF9GJ" />
			<Script type="text/javascript">
				{` window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-97F16HF9GJ');`}
			</Script>
			<HighlightInit
				projectId={"kev2k3g3"}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: []
				}}
			/>
			{process.browser ? (
				<PersistGate loading={null} persistor={persistor}>
					<Component {...pageProps} />
				</PersistGate>
			) : (
				<Component {...pageProps} />
			)}
		</Provider>
	);
}

export default MyApp;
