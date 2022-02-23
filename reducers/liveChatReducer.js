import { DETECT_GENDER_FAILURE, DETECT_GENDER_SUCCESS, CLEAR_LIVE_CHAT_LOGS, HANDLE_IDENTITY_CHANGE, SERVER_IS_OPERATIONAL_FAILURE, SERVER_IS_OPERATIONAL_SUCCESS, GET_TRENDS_SUCCESS, GET_TRENDS_FAILURE } from "../actions/types";

const INIT_STATE = {
	detectedGenderStatus: null,

	isServerOperationalStatus: null,
	isServerOperationalData: null,

	identityObj: {
		fullname: "",
		age: "",
		gender: "any",
	},

	trendsData: null,
	trendsStatus: null
};

const LiveChatReducer = (state = INIT_STATE, action) => {
	const { type, payload } = action;
	switch (type) {
		case CLEAR_LIVE_CHAT_LOGS:
			return {
				...state,
				detectedGenderStatus: null,
				isServerOperationalStatus: null,
				trendsStatus: null
			};

		case GET_TRENDS_SUCCESS:
			return{
				...state,
				trendsData: payload.data,
				trendsStatus: payload.data.status
			}

		case GET_TRENDS_FAILURE:
			return{
				...state,
				trendsStatus: payload.data.status
			}

		case SERVER_IS_OPERATIONAL_SUCCESS:
			window.tkn = payload.data.token;
			payload.data.token = null
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
