import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

// import the two exports from the last code snippet.
import { persistor, store } from "../store";
import Script from "next/script";
import "../public/beeguide-tools.css";

function MyApp({ Component, pageProps }) {
	return (
		<Provider store={store}>
			<Script id="beeguide-tools" src={"/beeguide-tools.js"} data-token={"55e4bef7a37b799522b59b9bd4b0791203e75f21"} />
			<Script src="https://unpkg.com/blob-util@2.0.2/dist/blob-util.js"></Script>
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
