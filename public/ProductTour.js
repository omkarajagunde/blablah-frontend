import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Content from "./Content";
import HelpToolBox from "./HelpToolBox";

function ProductTour(props) {
	const [state, setState] = useState({
		tours: props.tours,
		walkScreensArr: props.selectedTourArr || [],
		expandFlag: false,
		screenAdded: true,
		currentSelectedScreen: 0,
        expandHelpToolbar: false,
        hotspotsActivated: false,
		flowTriggeredFromHotspots: false,
		helpBoxPos: 200
	});
	const lineRef = useRef(null);
	const draggableRef = useRef(null);
    const helpToolBoxRef = useRef(null);

	useEffect(() => {
		/**
		 * When window is tried to resize then we
		 * want to re paint the highlighting as the old
		 * highlighting will be correct
		 */
		window.addEventListener("resize", renderHighlighter);
		/**
		 * This will paint the highlighting for current selected
		 * screen every time when the props object is changed
		 */
		renderHighlighter();
		return () => {
			window.removeEventListener("resize", renderHighlighter);
		};
	}, [state]);

	useEffect(() => {
		console.log("BeeGuide Props :: ", props);
		setState(prevState => ({ ...prevState, walkScreensArr: props.selectedTourArr, currentSelectedScreen: props.selectedFeatureSpotIndex, flowTriggeredFromHotspots: props.flowTriggeredFromHotspots }))
	}, [props]);

	const handlePrevious = () => {
		setState((prevState) => ({ ...prevState, currentSelectedScreen: prevState.currentSelectedScreen - 1 }));
	};

	const handleNext = () => {
		setState((prevState) => ({ ...prevState, currentSelectedScreen: prevState.currentSelectedScreen + 1 }));
	};

    const handleSkipClick = () => {
        setState((prevState) => ({ ...prevState, currentSelectedScreen: -1 }));
    }

	const handleContentDrag = (newPosition) => {
		let arr = state.walkScreensArr;
		arr.forEach((element, index) => {
			if (index === state.currentSelectedScreen) {
				element.dragged = true;
				element.draggedSizes = { left: newPosition.left, top: newPosition.top };
			}
		});

		lineRef.target.position();
	};

	const renderHighlighter = () => {
		console.log(state);
        window.scrollTop = 0
		// Remove old bounding boxes on the screen
		let oldelem = document.getElementById("selectionpart");
		if (oldelem) oldelem.remove();

		let oldelem1 = document.getElementById("title-subtitle");
		if (oldelem1) oldelem1.remove();

        let helpToolBox = document.getElementById("helpToolBox");
		if (helpToolBox) helpToolBox.remove();

        if (state.hotspotsActivated){
            let hotSoptElems = document.querySelectorAll(".info-icon")
            hotSoptElems.forEach(hotspot => hotspot.remove())
        }

		if (lineRef.target) {
			lineRef.target.remove();
			lineRef.target = null;
		}

		if (draggableRef.target) {
			draggableRef.target.remove();
			draggableRef.target = null;
		}

        if (helpToolBoxRef.target){
            helpToolBoxRef.target.remove();
            helpToolBoxRef.target = null
        }

		let currScreenSettings = state.walkScreensArr[state.currentSelectedScreen];
		let toggledSelection = document.querySelector(currScreenSettings?.element || null);

		if (toggledSelection && !state.hotspotsActivated) {
			let sizes = toggledSelection.getBoundingClientRect();
			let div1 = document.createElement("div");
			div1.setAttribute("id", "selectionpart");
			div1.classList.add("selectionpart");
			div1.style.top = `${sizes.top - 10}px`;
			div1.style.left = `${sizes.left - 10}px`;
			div1.style.width = `${sizes.width + 20}px`;
			div1.style.height = `${sizes.height + 20}px`;
			div1.style.boxShadow = `0 0 0 99999px rgb(${currScreenSettings.color.r} ${currScreenSettings.color.g} ${currScreenSettings.color.b} / ${currScreenSettings.opacity}0%)`;
			document.body.appendChild(div1);

			let div2 = document.createElement("div");
			div2.setAttribute("id", "title-subtitle");
			div2.classList.add("title-subtitle");
			div2.style.top = currScreenSettings.dragged ? `${currScreenSettings.draggedSizes.top}px` : `${sizes.bottom + 100}px`;
			div2.style.left = currScreenSettings.dragged ? `${currScreenSettings.draggedSizes.left}px` : `${sizes.left - 5}px`;
			document.body.appendChild(div2);

			ReactDOM.render(
                <Content 
                    handleSkipClick={handleSkipClick} 
                    handlePrevious={handlePrevious} 
                    handleNext={handleNext} 
                    handleBackToHotspots={handleBackToHotspots}
                    state={state} 
                    currScreenSettings={currScreenSettings} />, 
                    div2
            );

			lineRef.target = new window.LeaderLine(div2, div1);
			lineRef.target.setOptions({
				color: "white",
				dash: { animation: true },
				startSocket: "auto",
				endPlug: currScreenSettings.arrowType
			});

			// Make Content -> div2 draggable
			draggableRef.target = new window.PlainDraggable(div2);
			draggableRef.target.draggingClass = "";
			draggableRef.target.movingClass = "";
			draggableRef.target.draggableClass = "";
			draggableRef.target.onMove = handleContentDrag;

			draggableRef.target.position()
			lineRef.target.position();
		}

        if (state.hotspotsActivated){
            state.walkScreensArr.forEach((screen, idx) => {
                let newHotSpotElem = document.createElement("div")
                newHotSpotElem.setAttribute("id", "selectionpart-" + idx);
			    newHotSpotElem.classList.add("selectionpart");
                newHotSpotElem.classList.add("info-icon")
                newHotSpotElem.onclick = handleHotSpotClick
                newHotSpotElem.innerHTML = 'i'
                let elementToHotSpot = document.querySelector(screen.element)
                if (elementToHotSpot){
                    let sizes = elementToHotSpot.getBoundingClientRect();
                    newHotSpotElem.style.top = `${sizes.top}px`;
			        newHotSpotElem.style.left = `${sizes.left}px`;
                    document.body.appendChild(newHotSpotElem)
                }
            })
        }


        if (state.currentSelectedScreen === -1){
			let helpToolBox = document.createElement("div");
			helpToolBox.setAttribute("id", "helpToolBox");
			document.body.appendChild(helpToolBox);
            let dragToolBox = new window.PlainDraggable(helpToolBox)
			dragToolBox.containment = { left: 0, top: 0, width: 0, height: "100%" };
			dragToolBox.onDrag = (newPos) => {
				console.log(newPos);
				setState(prevState=> ({...prevState, helpBoxPos: newPos.top}))
			}
			ReactDOM.render(
				<HelpToolBox 
					handleFullTourCheckbox={handleFullTourCheckbox} 
					handleHelpToolBoxClick={handleHelpToolBoxClick} 
					handleHotspots={handleHotspots}
					state={state} />, 
                helpToolBox
			);
			
			document.querySelector(".beeGuide-toolbox").style.top =  state.helpBoxPos + "px"
        }
	};

    const handleHotSpotClick = (eve) => {
        if (state.hotspotsActivated){
            let hotSoptElems = document.querySelectorAll(".info-icon")
            hotSoptElems.forEach(hotspot => hotspot.remove())
        }

        let targetId = eve.target.id
        targetId = parseInt(targetId.slice(-1))
        setState(prevState => ({ ...prevState, currentSelectedScreen: targetId, hotspotsActivated: false, flowTriggeredFromHotspots: true }))
    }

    const handleHelpToolBoxClick = () => {
        setState(prevState => ({ ...prevState, expandHelpToolbar: !prevState.expandHelpToolbar }))
    }

    const handleHotspots = () => {
        setState(prevState => {
            if (prevState.hotspotsActivated){
                let hotSoptElems = document.querySelectorAll(".info-icon")
                hotSoptElems.forEach(hotspot => hotspot.remove())
            }
            return { ...prevState, hotspotsActivated: !prevState.hotspotsActivated }
        })
    }

    const handleFullTourCheckbox = () => {    
        if (state.hotspotsActivated){
            let hotSoptElems = document.querySelectorAll(".info-icon")
            hotSoptElems.forEach(hotspot => hotspot.remove())
        }
        setState(prevState => ({ ...prevState, currentSelectedScreen: 0, hotspotsActivated: false, flowTriggeredFromHotspots: false }))
    }

    const handleBackToHotspots = () => {
        setState(prevState => ({ ...prevState, currentSelectedScreen: -1, hotspotsActivated: true, flowTriggeredFromHotspots: false }))
    }

	return (
		<div>
        </div>
	);
}

export default ProductTour
