import { combineReducers } from "redux";
import LiveChatReducer from "./liveChatReducer";
import CommonReducer from "./commonReducer";
import WishesReducer from "./wishesReducer";

export default combineReducers({
	liveChat: LiveChatReducer,
	common: CommonReducer,
	wishes: WishesReducer
});
