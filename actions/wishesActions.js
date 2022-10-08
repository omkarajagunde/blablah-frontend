import Server from "../apiHelpers/jwtserver";

import {
	CLEAR_WISHES,
	GET_WISH_CATEGORIES_SUCCESS,
	GET_WISH_CATEGORIES_FAILURE,
	SAVE_NEW_WISH_TEMPLATE_SUCCESS,
	SAVE_NEW_WISH_TEMPLATE_FAILURE,
	GET_WISH_TEMPLATES_SUCCESS,
	GET_WISH_TEMPLATES_FAILURE
} from "./types";

let networkErrObj = { data: { status: 600, message: "Please check your network connection" } };

const GetWishesCategories = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.get(process.env.NEXT_PUBLIC_BLABLAH_URL + "/api/category", params);
			dispatch({
				type: GET_WISH_CATEGORIES_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: GET_WISH_CATEGORIES_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: GET_WISH_CATEGORIES_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const SaveNewWishTemplate = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.post(process.env.NEXT_PUBLIC_BLABLAH_URL + "/api/wishes-template", params);
			dispatch({
				type: SAVE_NEW_WISH_TEMPLATE_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: SAVE_NEW_WISH_TEMPLATE_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: SAVE_NEW_WISH_TEMPLATE_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const GetWishesTemplates = (params) => {
	return async (dispatch, getState) => {
		try {
			const response = await Server.get(process.env.NEXT_PUBLIC_BLABLAH_URL + "/api/wishes-template", params);
			dispatch({
				type: GET_WISH_TEMPLATES_SUCCESS,
				payload: response
			});
		} catch (e) {
			if (e.response) {
				dispatch({
					type: GET_WISH_TEMPLATES_FAILURE,
					payload: e.response
				});
			} else {
				dispatch({
					type: GET_WISH_TEMPLATES_FAILURE,
					payload: networkErrObj
				});
			}
		}
	};
};

const ClearWishes = (params) => {
	return (dispatch) => dispatch({ type: CLEAR_WISHES, payload: params });
};

export { ClearWishes, GetWishesCategories, SaveNewWishTemplate, GetWishesTemplates };
