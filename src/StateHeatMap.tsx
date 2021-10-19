import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

declare global {
    interface Window {
        tableau: any;
    }
}

function StateHeatMap() {
    const vizContainer = React.useRef();
    const url = "https://public.tableau.com/views/cases-per-test-states/Sheet1"

    function initViz() {
        new window.tableau.Viz(vizContainer.current, url);
    }

    useEffect(() => { initViz() });

    return <div ref={vizContainer.current}></div>
}

export default StateHeatMap;