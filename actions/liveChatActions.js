import Server from "../api/jwtserver";

import { DETECT_GENDER_SUCCESS, DETECT_GENDER_FAILURE, CLEAR_LIVE_CHAT_LOGS } from "./types";

const DetectGender = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.post(process.env.NEXT_PUBLIC_SERVER_URL + "/api/chat/identity/agdetector", params);
			dispatch({
				type: DETECT_GENDER_SUCCESS,
				payload: response,
			});
		} catch (e) {
			dispatch({
				type: DETECT_GENDER_FAILURE,
				payload: e.response,
			});
		}
	};
};

const ClearLiveChatLogs = (params) => {
	return (dispatch) => dispatch({ type: CLEAR_LIVE_CHAT_LOGS, payload: params });
};

export { DetectGender, ClearLiveChatLogs };
