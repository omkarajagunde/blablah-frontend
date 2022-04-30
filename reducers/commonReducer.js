import {} from "../actions/types";

const INIT_STATE = {};

const LiveChatReducer = (state = INIT_STATE, action) => {
	const { type, payload } = action;
	switch (type) {
		default:
			return state;
	}
};

export default LiveChatReducer;
