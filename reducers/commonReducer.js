import { DEMO_SUCCESS, DEMO_FAILURE } from "../actions/types";

const INIT_STATE = {};

const LiveChatReducer = (state = INIT_STATE, action) => {
	const { type, payload } = action;
	switch (type) {
		case DEMO_SUCCESS:
			return {
				...state,
			};

		case DEMO_FAILURE:
			return {};

		default:
			return state;
	}
};

export default LiveChatReducer;
