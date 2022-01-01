import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import rootReducer from "./reducers"; // the value from combineReducers

const createNoopStorage = () => {
	return {
		getItem(_key) {
			return Promise.resolve(null);
		},
		setItem(_key, value) {
			return Promise.resolve(value);
		},
		removeItem(_key) {
			return Promise.resolve();
		},
	};
};

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const persistConfig = {
	key: "root",
	storage: storage,
	stateReconciler: autoMergeLevel2, // see "Merge Process" section for details.

	//whitelist: ["posts"], // Here you can specify which reducer you want to persist, if not specified then all reducers are been persisted
};

const pReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(pReducer, composeWithDevTools(applyMiddleware(thunk)));
export const persistor = persistStore(store);
