import "../styles/globals.css";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

// import the two exports from the last code snippet.
import { persistor, store } from "../store";

function MyApp({ Component, pageProps }) {
	return (
		<Provider store={store}>
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
