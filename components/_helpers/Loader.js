import React from "react";

function Loader(props) {
	return (
		<div className="lds-facebook" style={{ top: props.top, right: props.right, height: props.height, width: props.width, ...props.style }}>
			<div style={{ background: props.color }}></div>
			<div style={{ background: props.color }}></div>
			<div style={{ background: props.color }}></div>
		</div>
	);
}

export default Loader;
