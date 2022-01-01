import { useEffect, useRef } from "react";

export const useInterval = (callback, delay, searchFlag) => {
	const savedCallback = useRef();

	useEffect(() => {
		console.log(searchFlag);
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const tick = () => {
			savedCallback.current();
		};
		if (delay !== null && searchFlag) {
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
};
