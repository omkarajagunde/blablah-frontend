import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

// import the two exports from the last code snippet.
import { persistor, store } from "../store";
import { HighlightInit } from "@highlight-run/next/client";

function MyApp({ Component, pageProps }) {
	return (
		<Provider store={store}>
			<Analytics />
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
