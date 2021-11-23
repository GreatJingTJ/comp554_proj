import React, { useState, useEffect, memo} from "react";
import { ZoomableGroup, ComposableMap, Geographies, Geography } from "react-simple-maps";

import { csv } from "d3-fetch";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

const date = "5/27/21"


const MapChart = ({setTooltipContent}) => {
    const [data, setData] = useState([]);
    const [county, setCounty] = useState([]);
    const [date, changeDate] = useState("5/27/21")
       useEffect(() => {
            csv("/unemployment-by-county-2017.csv").then(counties => {
                setData(counties);
            });
        }, []);
        useEffect(() => {
            csv("/TS_TX_county.csv").then(counties => {
                   setCounty(counties);
            });
        }, []);



    return (
        <div>
        <input type="text"  id="dateInput"></input><button onClick = {() => changeDate(document.getElementById("dateInput").value)}>update</button>
        <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }}>
                    <ZoomableGroup>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map(geo => {
                                    var cur = data.find(s => s.id === geo.id);
                                    var d = county.find(c => (c.County === geo.properties.name) && (c.Date === date));
                                    console.log(date)
                                    return (

                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={() => {

                                            if(d ) {
                                                setTooltipContent(cur.name + "    " + d["Confirmed Cases"]);
                                            }


                                            }}
                                            onMouseLeave={() => {
                                                setTooltipContent("");
                                            }}
                                            style={{

                                                hover: {
                                                    fill: "#F53",
                                                    outline: "none"
                                                },
                                                pressed: {
                                                    fill: "#E42",
                                                    outline: "none"
                                                }
                                            }}
                                            fill = "#D6D6DA"


                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap></div>
    );
};

export default memo(MapChart);;
