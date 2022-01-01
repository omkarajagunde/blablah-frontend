import { DETECT_GENDER_FAILURE, DETECT_GENDER_SUCCESS, CLEAR_LIVE_CHAT_LOGS } from "../actions/types";

const INIT_STATE = {
	detectedGenderStatus: null,
	detectedGenderData: null,
};

const LiveChatReducer = (state = INIT_STATE, action) => {
	const { type, payload } = action;
	switch (type) {
		case CLEAR_LIVE_CHAT_LOGS:
			return {
				...state,
				detectedGenderStatus: null,
			};

		case DETECT_GENDER_SUCCESS:
			return {
				...state,
				detectedGenderData: payload.data.data,
				detectedGenderStatus: payload.data.status,
			};

		case DETECT_GENDER_FAILURE:
			return {
				detectedGenderStatus: payload.data.status,
			};

		default:
			return state;
	}
};

export default LiveChatReducer;
