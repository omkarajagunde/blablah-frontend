import React, { useEffect, useState } from "react";

function AudioRecording() {
	const [time, setTime] = useState(0);

	useEffect(() => {
		let interval = setTimeout(() => {
			setTime(time + 1);
		}, 1000);

		return () => clearTimeout(interval);
	}, [time]);

	const timeToMMSS = (seconds) =>
		new Date(seconds * 1000).toLocaleTimeString("en-GB", {
			timeZone: "Etc/UTC",
			hour12: false,
			minute: "2-digit",
			second: "2-digit",
		});

	return (
		<>
			<div style={{ fontWeight: "500" }}>{timeToMMSS(time)}</div> please Speak...
		</>
	);
}

export default AudioRecording;
