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
			<Head></Head>
			<Analytics />
			{/* Below script is AdsCash interrstial */}
			{/* <Script src="//linkonclick.com/a/display.php?r=7725022" type="text/javascript" data-cfasync="false"></Script> */}
			<Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1117843900019355" crossorigin="anonymous"></Script>
			<Script src="https://www.googletagmanager.com/gtag/js?id=G-97F16HF9GJ" />

			{/* AdsCash */}
			{/* <Script id="aclib" src="https://acscdn.com/script/aclib.js" data-cfasync="false" /> */}
			{/* <Script>
				{`
                    aclib.runAutoTag({
                        zoneId: 'i0geuqggou',
                    });
                `}
			</Script> */}
			<Script type="text/javascript">
				{` window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-97F16HF9GJ')
                `}
			</Script>

			{/* <HighlightInit
				projectId={"kev2k3g3"}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: []
				}}
			/> */}
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
