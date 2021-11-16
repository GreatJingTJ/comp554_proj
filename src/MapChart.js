import React, { useState, useEffect, memo} from "react";
import { ZoomableGroup, ComposableMap, Geographies, Geography } from "react-simple-maps";

import { csv } from "d3-fetch";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

const MapChart = ({setTooltipContent}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // https://www.bls.gov/lau/
        csv("/unemployment-by-county-2017.csv").then(counties => {
            setData(counties);
        });
    }, []);

    // const colorScale = scaleQuantile()
    //   .domain(data.map(d => d.unemployment_rate))
    //   .range([
    //     "#ffedea",
    //     "#ffcec5",
    //     "#ffad9f",
    //     "#ff8a75",
    //     "#ff5533",
    //     "#e2492d",
    //     "#be3d26",
    //     "#9a311f",
    //     "#782618"
    //   ]);

    return (
        <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }}>
            <ZoomableGroup>
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map(geo => {
                            var cur = data.find(s => s.id === geo.id);
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseEnter={() => {

                                        if(cur) {
                                            setTooltipContent(cur.name);
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
        </ComposableMap>
    );
};

export default memo(MapChart);;
