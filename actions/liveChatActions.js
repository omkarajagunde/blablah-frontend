import Server from "../apiHelpers/jwtserver";

import {
	GET_TRENDS_SUCCESS,
	GET_TRENDS_FAILURE,
	DETECT_GENDER_SUCCESS,
	DETECT_GENDER_FAILURE,
	CLEAR_LIVE_CHAT_LOGS,
	HANDLE_IDENTITY_CHANGE,
	SERVER_IS_OPERATIONAL_FAILURE,
	SERVER_IS_OPERATIONAL_SUCCESS,
	ADD_NOTIFY_TOKEN_SUCCESS,
	ADD_NOTIFY_TOKEN_FAILURE
} from "./types";

let networkErrObj = { data: { status: 600, message: "Please check your network connection" } };

const DetectGender = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.post(process.env.NEXT_PUBLIC_SERVER_URL + "/api/chat/identity/agdetector", params);
			dispatch({
				type: DETECT_GENDER_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: DETECT_GENDER_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: DETECT_GENDER_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const GetTrends = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/chat/enablement/get/smart/replies", params);
			dispatch({
				type: GET_TRENDS_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: GET_TRENDS_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: GET_TRENDS_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const AddNotifyToken = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.post("/api/notify", params);
			dispatch({
				type: ADD_NOTIFY_TOKEN_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: ADD_NOTIFY_TOKEN_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: ADD_NOTIFY_TOKEN_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const HandleIdentityChange = (params) => {
	return (dispatch, getState) => {
		dispatch({
			type: HANDLE_IDENTITY_CHANGE,
			payload: params
		});
	};
};

const IsServerOperational = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.post(process.env.NEXT_PUBLIC_SERVER_URL + "/api/is/alive", params);
			dispatch({
				type: SERVER_IS_OPERATIONAL_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: SERVER_IS_OPERATIONAL_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: SERVER_IS_OPERATIONAL_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const ClearLiveChatLogs = (params) => {
	return (dispatch) => dispatch({ type: CLEAR_LIVE_CHAT_LOGS, payload: params });
};

export { DetectGender, ClearLiveChatLogs, HandleIdentityChange, IsServerOperational, GetTrends, AddNotifyToken };
