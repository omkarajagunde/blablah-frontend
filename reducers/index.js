import { combineReducers } from "redux";
import LiveChatReducer from "./liveChatReducer";
import CommonReducer from "./commonReducer";

export default combineReducers({
	liveChat: LiveChatReducer,
	common: CommonReducer,
});
