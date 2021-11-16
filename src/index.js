import React,  { useState }  from "react";
import ReactDOM from "react-dom";
import ReactTooltip from "react-tooltip";

import "./index.css";

import MapChart from "./MapChart";

function App() {
    const [content, setContent] = useState("");
    return (
        <div>
            <h1>#1.11 - A new metric (#cases/#tests) for testing county visualization</h1>
            <MapChart setTooltipContent={setContent} />
            <ReactTooltip>{content}</ReactTooltip>
        </div>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
