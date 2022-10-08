import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClearWishes, GetWishesTemplates } from "../actions/wishesActions";
import useUpdateEffect from "./_helpers/useUpdateEffect";
import _ from "lodash";

function ViewTemplates() {
	const dispatch = useDispatch();
	const WishesSelector = useSelector((state) => state.wishes, _.isEqual);
	const [state, setState] = useState({
		templates: []
	});

	useEffect(() => {
		dispatch(GetWishesTemplates());
	}, []);

	useUpdateEffect(() => {
		if (WishesSelector.getWishesTemplatesStatus === 200) {
			dispatch(ClearWishes());
			setState((prevState) => ({ ...prevState, templates: WishesSelector.getWishesTemplatesData }));
		}

		if (WishesSelector.getWishesTemplatesStatus === 600) {
			dispatch(ClearWishes());
			if (confirm("Please check your internet connection, Click OK to refresh")) window.location.reload();
		}
	}, [WishesSelector]);

	return <div>ViewTemplates</div>;
}

export default ViewTemplates;
