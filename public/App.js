import { useState, useEffect } from "react"
import './App.scss';
import ProductTour from './components/ProductTour';

import React, { Component } from 'react'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tours: [],
      selectedTourArr: [],
      selectedFeatureSpotIndex: 0,
      hotspotsActivated: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      console.log("BeeGuide State :: ", this.state);
    }
  }

  componentDidMount() {
    // check if token is passed and get the tours for attached token account
    let scriptElem = document.getElementById("beeguide-tools")
    if (!scriptElem) {
      console.log("[BeeGuide logs] :: Included script is not having id : beeguide-tools, please pass this id to the included script tag");
      return
    }

    let token = scriptElem.dataset.token
    if (!token) {
      console.log("[BeeGuide logs] :: Included script is not having correct data-token attribute : please pass your token in data-token attribute");
      return
    }

    fetch("http://localhost:9001/v1/api/tour?token=" + token)
      .then(response => response.json())
      .then(response => {
        console.log("[BeeGuide logs] :: Response for GET method :: ", response.data);
        this.setState({tours: response.data })
        window.tours = response.data
      })
      .catch(error => console.log('[BeeGuide logs] :: Error for GET method :: ', error))
    
    window.BeeGuide = this
  }

  handleTriggerBeeTour = (tourId) => {
    if (!(typeof tourId === "string") || !(tourId.length > 5)) {
      console.log("[BeeGuide logs] :: tourId is not passed correctly, it should be string id")
      return
    }
    this.state.tours.forEach(tour => {
      if (tourId === tour.id) {
        this.setState({ selectedTourArr: tour.arr, selectedFeatureSpotIndex: 0, flowTriggeredFromHotspots: false, hotspotsActivated: false })

      }
    })
  }

  handleTriggerBeeSpot = (tourId, screenIdx = 0, activationFlag = true) => {
    if (!(typeof tourId === "string")  || !(tourId.length > 5)) {
      console.log("[BeeGuide logs] :: tourId is not passed correctly, it should be string id")
      return
    }
    this.state.tours.forEach(tour => {
      if (tourId === tour.id) {
        this.setState({ selectedTourArr: tour.arr, selectedFeatureSpotIndex: !activationFlag? -1: screenIdx, flowTriggeredFromHotspots: activationFlag, hotspotsActivated: false })
      }
    })
  }

  render() {
    return (
      <div className="platformAdoptionApp" id="windowFrame">
        {
          this.state.tours !== null ?
            <ProductTour
              tours={this.state.tours}
              selectedTourArr={this.state.selectedTourArr}
              flowTriggeredFromHotspots={this.state.flowTriggeredFromHotspots}
              selectedFeatureSpotIndex={this.state.selectedFeatureSpotIndex} />
          : ""  
        }
      </div>
    )
  }
}


// function App(props) {
//   const [state, setState] = useState({
//     tours: null,
//     selectedTourArr: null,
//     selectedFeatureSpotIndex: 0,
//   })

//   useEffect(() => {
//     console.log("BeeGuide :: ", state);
//   }, [state.tours])

//   useEffect(() => {
//     // check if token is passed and get the tours for attached token account
//     let scriptElem = document.getElementById("beeguide-tools")
//     if (!scriptElem) {
//       console.log("[BeeGuide logs] :: Included script is not having id : beeguide-tools, please pass this id to the included script tag");
//       return
//     }

//     let token = scriptElem.dataset.token
//     if (!token) {
//       console.log("[BeeGuide logs] :: Included script is not having correct data-token attribute : please pass your token in data-token attribute");
//       return
//     }

//     fetch("http://localhost:9001/v1/api/tour?token=" + token)
//       .then(response => response.json())
//       .then(response => {
//         console.log("[BeeGuide logs] :: Response for GET method :: ", response.data);
//         setState((prevState) => ({ ...prevState, tours: response.data }))
//         window.tours = response.data
//       })
//       .catch(error => console.log('[BeeGuide logs] :: Error for GET method :: ', error))
    
//     window.BeeGuide = App
//   }, [])

//   const handleTriggerBeeTour = (tourId) => {
//     window.tours.forEach(tour => {
//       if (tourId === tour.id) {
//         setState(prevState => ({ ...prevState, selectedTourArr: tour.arr }))
//       }
//     })
//   }

//   const handleTriggerBeeSpot = (tourId, screenIdx) => {
//     window.tours.forEach(tour => {
//       if (tourId === tour.id) {
//         setState(prevState => ({ ...prevState, selectedTourArr: tour.arr, selectedFeatureSpotIndex: screenIdx }))
//       }
//     })
//   }

//   return (
//     <div className="platformAdoptionApp" id="windowFrame">
//       {
//         state.tours !== null ?
//           <ProductTour
//             tours={state.tours}
//             selectedTourArr={state.selectedTourArr}
//             selectedFeatureSpotIndex={state.selectedFeatureSpotIndex} />
//         : ""  
//       }
//     </div>
//   );
// }

// export default App;
