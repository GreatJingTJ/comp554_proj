import {canpraseint, pad, request_data_by_state, states_map } from "./util_func";
import {Bar, Line} from "react-chartjs-2";
import React from "react";
import {week_list} from "./modal_chart_util";

export const color_list = ['rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)', '#FF4500', '#FF0000'];
const state_get_full = states_map();


export function searchChart(data2021, data2020, state_list, picknum = 2){

    let labels_arr = returneachday(data2020, 'CA', "2020");
    if(picknum === 1) {
        labels_arr = returneachday(data2021, 'CA', "2021");
    } else if(picknum === 2) {
        labels_arr = returneachday(data2020, 'CA', "2020").concat(returneachday(data2021, 'CA', "2021"));
    }

    let bar_view = {

        labels: labels_arr,
        datasets: []
    };

    for(let i = 0; i < state_list.length; i += 1) {
        let statename = state_list[i].name, stateinit = state_list[i].id;
        bar_view.datasets.push({
            label: statename,
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            borderWidth: 1,
            data: [],


        })
        let data_arr = returnStateData(data2020, stateinit);
        if(picknum === 1) {
            data_arr = returnStateData(data2021, stateinit);
        } else if(picknum === 2) {
            data_arr = returnStateData(data2020, stateinit).concat(returnStateData(data2021, stateinit));
        }

        let data = data_arr;
        bar_view.datasets[i].data = data;

    }



    return (<div>
        <p>Historical Cases Per Test (Number of Confirmed Cases / Number of Tests)</p>
        <Line
            data={bar_view}
            options={{

                title:{
                    display:true,
                    text:'Today\'s Confirm Rate',
                    fontSize:20
                },
                legend:{
                    display:true,
                    position:'right'
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },


            }}
        />
    </div>);

}

function returnStateData(data2021, statename){
    let data = []
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    for(let month = 1; month <= 12; month += 1) {
        const monthPadded = pad(month);
        for(let day = 1; day <= datemap[month]; day += 1) {
            const dayPadded = pad(day);
            const stateData = data2021[month - 1][day - 1][statename];
            if (stateData) {
                const numConfirmed = canpraseint(stateData['Confirmed']);
                let numTests = canpraseint(stateData['Total_Test_Results']);

                if(!numTests){
                    numTests = canpraseint(stateData['People_Tested']);
                }

                if (numConfirmed && numTests) {
                    let result = numConfirmed / numTests;
                    if(result >= 1) {
                        if(data.length >= 1){
                            result = data[data.length - 1]
                        } else {
                            result -= 1;
                        }
                    }
                    data.push(result);
                }
            }
        }
    }
   return data;
}

function returneachday(data2021, statename, year){
    let data = []
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    for(let month = 1; month <= 12; month += 1) {
        const monthPadded = pad(month);
        for(let day = 1; day <= datemap[month]; day += 1) {
            const dayPadded = pad(day);
            const stateData = data2021[month - 1][day - 1][statename];

            if (stateData) {

                const numConfirmed = canpraseint(stateData['Confirmed']);
                let numTests = canpraseint(stateData['Total_Test_Results']);
                if(!numTests){
                    numTests = canpraseint(stateData['People_Tested']);
                }
                if (numConfirmed && numTests) {

                    data.push(`${year}-${monthPadded}-${dayPadded}`);
                }
            }
        }
    }
    return data;
}


