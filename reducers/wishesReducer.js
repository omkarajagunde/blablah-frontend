import {
	CLEAR_WISHES,
	GET_TRENDS_SUCCESS,
	GET_WISH_CATEGORIES_FAILURE,
	GET_WISH_CATEGORIES_SUCCESS,
	GET_WISH_TEMPLATES_FAILURE,
	GET_WISH_TEMPLATES_SUCCESS,
	SAVE_NEW_WISH_TEMPLATE_FAILURE,
	SAVE_NEW_WISH_TEMPLATE_SUCCESS
} from "../actions/types";

const INIT_STATE = {
	wishesCategoriesData: [],
	wishesCategoriesStatus: null,

	saveNewWishTemplateData: [],
	saveNewWishTemplateStatus: null,

	getWishesTemplatesData: [],
	getWishesTemplatesStatus: null
};

const WishesReducer = (state = INIT_STATE, action) => {
	const { type, payload } = action;
	switch (type) {
		case CLEAR_WISHES:
			return {
				...state,
				wishesCategoriesData: [],
				wishesCategoriesStatus: null,
				saveNewWishTemplateData: [],
				saveNewWishTemplateStatus: null,
				getWishesTemplatesData: [],
				getWishesTemplatesStatus: null
			};

		case GET_WISH_TEMPLATES_SUCCESS: {
			return {
				...state,
				getWishesTemplatesData: payload.data.data,
				getWishesTemplatesStatus: payload.data.status
			};
		}

		case GET_WISH_TEMPLATES_FAILURE: {
			return {
				...state,
				getWishesTemplatesStatus: payload.data.status
			};
		}

		case SAVE_NEW_WISH_TEMPLATE_SUCCESS:
			return {
				...state,
				saveNewWishTemplateData: payload.data.data,
				saveNewWishTemplateStatus: payload.data.status
			};

		case SAVE_NEW_WISH_TEMPLATE_FAILURE:
			return {
				...state,
				saveNewWishTemplateStatus: payload.data.status
			};

		case GET_WISH_CATEGORIES_SUCCESS:
			return {
				...state,
				wishesCategoriesData: payload.data.data,
				wishesCategoriesStatus: payload.data.status
			};

		case GET_WISH_CATEGORIES_FAILURE:
			return {
				...state,
				wishesCategoriesStatus: payload.data.status
			};

		default:
			return state;
	}
};

export default WishesReducer;
