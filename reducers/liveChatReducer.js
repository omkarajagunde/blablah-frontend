import { DETECT_GENDER_FAILURE, DETECT_GENDER_SUCCESS, CLEAR_LIVE_CHAT_LOGS, HANDLE_IDENTITY_CHANGE, SERVER_IS_OPERATIONAL_FAILURE, SERVER_IS_OPERATIONAL_SUCCESS } from "../actions/types";

const INIT_STATE = {
	detectedGenderStatus: null,

	isServerOperationalStatus: null,
	isServerOperationalData: null,

	identityObj: {
		fullname: "",
		age: "",
		gender: "any",
	},
};

const LiveChatReducer = (state = INIT_STATE, action) => {
	const { type, payload } = action;
	switch (type) {
		case CLEAR_LIVE_CHAT_LOGS:
			return {
				...state,
				detectedGenderStatus: null,
				isServerOperationalStatus: null,
			};

		case SERVER_IS_OPERATIONAL_SUCCESS:
			return {
				...state,
				isServerOperationalStatus: payload.data.status,
				isServerOperationalData: payload.data,
			};

		case SERVER_IS_OPERATIONAL_FAILURE:
			return {
				...state,
				isServerOperationalStatus: payload.data.status,
			};

		case DETECT_GENDER_SUCCESS:
			return {
				...state,
				identityObj: { ...state.identityObj, gender: payload.data.data.gender },
				detectedGenderStatus: payload.data.status,
			};

		case DETECT_GENDER_FAILURE:
			return {
				...state,
				identityObj: { ...state.identityObj, gender: "any" },
				detectedGenderStatus: payload.data.status,
			};

		case HANDLE_IDENTITY_CHANGE:
			return {
				...state,
				identityObj: payload,
			};

		default:
			return state;
	}
};

export default LiveChatReducer;
