import Server from "../api/jwtserver";

import { DEMO_FAILURE, DEMO_SUCCESS } from "./types";

const DemoAction = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.post("<EndPoint Url here>", params);
			dispatch({
				type: DEMO_SUCCESS,
				payload: response,
			});
		} catch (e) {
			dispatch({
				type: DEMO_FAILURE,
				payload: e,
			});
		}
	};
};

export { DemoAction };
