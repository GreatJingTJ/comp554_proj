import {Bar, Chart, Line} from 'react-chartjs-2';
import React, { Component } from "react";
import {canpraseint, request_data_by_state, states_map} from './util_func'
import {pad } from "../util/util_func"

const state_get_full = states_map();
export const color_list = ['#ADD8E6', '#87CEEB', '#87CEFA', '#191970','#000080', '#FF7F50', '#FF6347','#FF4500', '#FF0000'];
export const week_list = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const background_color_list = ['rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',];

function cleanDatafunc(data2020, data2021, statename){
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let a = 0, b = 0; // a would record the confirmed case and b would record  tests each time
    for(let i = 1; i <= 12; i += 1) {
        for(let j = 1; j <= datemap[i]; j += 1) {
            let dataState = data2020[i - 1][j - 1][statename];
            if(dataState){
                const numConfirmed = canpraseint(dataState['Confirmed']);
                let numTests = canpraseint(dataState['Total_Test_Results']), found = false;
                if(!numTests){
                    numTests = canpraseint(dataState['People_Tested']);
                    found = true;
                }
                if(a === 0 && b === 0 && numConfirmed && numTests){
                    a = numConfirmed;
                    b = numTests;
                } else if(numConfirmed > 0 && numTests > 0){
                    data2020[i - 1][j - 1][statename]['Confirmed'] = String(numConfirmed - a);
                    if(found) { // in 2020 csv, there will be either People_Tested or Total_Test_Results field name
                        data2020[i - 1][j - 1][statename]['People_Tested'] = String(numTests - b);
                    } else {
                        data2020[i - 1][j - 1][statename]['Total_Test_Results'] = String(numTests - b);
                    }

                    a = numConfirmed;
                    b = numTests;
                } else {
                    data2020[i - 1][j - 1][statename]['Confirmed'] = '0'
                    data2020[i - 1][j - 1][statename]['People_Tested'] = '0'
                    data2020[i - 1][j - 1][statename]['Total_Test_Results'] = '0';
                }
            }
        }
    }
    // as current a and b will record the 12/31/2020 or the last day of 2020's confirmed and tests, can directly use
    for(let i = 1; i <= 12; i += 1) {
        for(let j = 1; j <= datemap[i]; j += 1) {
            let dataState = data2021[i - 1][j - 1][statename];
            if(dataState){
                const numConfirmed = canpraseint(dataState['Confirmed']);
                const numTests = canpraseint(dataState['Total_Test_Results']);
                if(numConfirmed > 0 && numTests > 0){
                    data2021[i - 1][j - 1][statename]['Confirmed'] = String(numConfirmed - a);
                    data2021[i - 1][j - 1][statename]['Total_Test_Results'] = String(numTests - b);
                    a = numConfirmed;
                    b = numTests;
                } else {
                    data2021[i - 1][j - 1][statename]['Confirmed'] = '0'
                    data2021[i - 1][j - 1][statename]['People_Tested'] = '0'
                    data2021[i - 1][j - 1][statename]['Total_Test_Results'] = '0';
                }
            }
        }
    }

    return [data2020, data2021]


}

function applyMedianFilter(confirm, test){
    let confirm_test = {}, confirm_index = {},filter_confirm = [], filter_test = [];

    for(let i = 0; i < confirm.length; i += 1){
        confirm_test[confirm[i]] = test[i];
        confirm_index[confirm[i]] = i;
    }

    for(let i = 0; i < confirm.length; i += 1) {
        let push_index = i;
        if(i + 2 <= confirm.length - 1 ) {
            let given_confirm = [confirm[i], confirm[i + 1], confirm[i + 2] ];
            given_confirm.sort();
            push_index = confirm_index[given_confirm[1]];
        } else if(i + 1 <= confirm.length - 1){
            let given_confirm = [confirm[i], confirm[i - 1], confirm[i + 1] ];
            given_confirm.sort();
            push_index = confirm_index[given_confirm[1]];
        }else {
            let given_confirm = [confirm[i - 1], confirm[i - 2], confirm[i] ];
            given_confirm.sort();
            push_index = confirm_index[given_confirm[1]];

        }
        filter_confirm.push(confirm[push_index]);
        filter_test.push(confirm_test[confirm[push_index]])
    }

    return [filter_confirm, filter_test];



}

export function semiAnnuallyView(data2020, data2021, statename, useYear2020, semester, todaydata) {
    let label_list = [], data = [];
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let semester_map = {"Fall": [7, 12], "Spring":[1, 6]}
    let month_start = semester_map[semester][0], month_end = semester_map[semester][1];


    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    let cleanData = cleanDatafunc( mydata2020, mydata2021, statename);
    let data_used_in_quarter_view = useYear2020 === "2020"? JSON.parse(JSON.stringify(cleanData[0])) : JSON.parse(JSON.stringify(cleanData[1]));

    let result = genertateDataAndLabel(month_start, month_end, datemap, data_used_in_quarter_view, statename, useYear2020);
    label_list = result[0];
    data = result[1];
    let testResultData = result[2];


    let mybar_view = {

        labels: label_list,
        datasets: [
            {
                label: 'Cases Per Test',
                cubicInterpolationMode: 'monotone',
                fill: false,
                tension: 0.4,
                yAxisID: 'A',
                backgroundColor: returnBorderColor(todaydata, statename),
                borderColor: returnBorderColor(todaydata, statename),
                borderWidth: 3,
                pointRadius: 0,
                data: applyMedianFilter(data, testResultData)[0]
            },
            {
                label: 'Tests',
                yAxisID: 'B',
                cubicInterpolationMode: 'monotone',
                fill: false,
                tension: 0.4,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 3,
                pointRadius: 0,
                data: applyMedianFilter(data, testResultData)[1]
            }
        ]
    };
    return (<div>
        <p>Recent semi-annually data in {state_get_full[statename]}</p>
        <Line
            data={mybar_view}
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

                scales:{
                    A:{
                        position: 'left',
                        ticks: {
                            // callback: function(value, index, values) {
                            //     let percentage_value = parseFloat(value) * 100;
                            //
                            //     return String(percentage_value.toFixed(2)) + "%"
                            // }
                        },
                    },
                    B:{
                        position: 'right',
                        ticks: {
                            // callback: function(value, index, values) {
                            //     return String((parseInt(value) / 100)).substring(0,3) + "K"
                            // }
                        },
                    }
                },
            }}
        />
    </div>);
}


export function quarterView(data2020, data2021, statename, useYear2020, quarter, todaydata){
    console.log("quarterView" + useYear2020 + quarter)

    let quarter_map= {
        "Winter": [12, 2],
        "Spring":[3, 5],
        "Summer": [6, 8],
        "Fall": [9, 11],
    };
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};

    let month_start = quarter_map[quarter][0], month_end = quarter_map[quarter][1];
    let label_list = [], data = [];

    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    let cleanData = cleanDatafunc( mydata2020, mydata2021, statename);
    let data_used_in_quarter_view = useYear2020 === "2020"? JSON.parse(JSON.stringify(cleanData[0])) : JSON.parse(JSON.stringify(cleanData[1]));



    let result = genertateDataAndLabel(month_start, month_end, datemap, data_used_in_quarter_view, statename, useYear2020);
    label_list = result[0];
    data = result[1];
    let testResultData = result[2];
    if(useYear2020 == "2021" && quarter === "Winter") {
        let dec_result = genertateDataAndLabel(12, 12, datemap, JSON.parse(JSON.stringify(cleanData[0])), statename, "2020");
        let month_result = genertateDataAndLabel(1, 2, datemap, JSON.parse(JSON.stringify(cleanData[1])), statename, "2021");

        label_list = dec_result[0].concat(month_result[0]);
        data = dec_result[1].concat(month_result[1]);
        testResultData = dec_result[2].concat(month_result[2]);
    }



    let bar_view = {

        labels: label_list,
        datasets: [
            {
                label: 'Cases Per Test',
                cubicInterpolationMode: 'monotone',
                fill: false,
                tension: 0.4,
                yAxisID: 'A',
                backgroundColor: returnBorderColor(todaydata, statename),
                borderColor: returnBorderColor(todaydata, statename),
                borderWidth: 3,
                pointRadius: 0,
                data: applyMedianFilter(data, testResultData)[0]
            },
            {
                label: 'Tests',
                yAxisID: 'B',
                cubicInterpolationMode: 'monotone',
                fill: false,
                tension: 0.4,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 3,
                pointRadius: 0,
                data: applyMedianFilter(data, testResultData)[1]
            }
        ]
    };

    return (<div>
        <p>Recent quarterly data in {state_get_full[statename]}</p>
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

                scales:{
                    A:{
                        position: 'left',
                        ticks: {
                            // callback: function(value, index, values) {
                            //     let percentage_value = parseFloat(value) * 100;
                            //
                            //     return String(percentage_value.toFixed(2)) + "%"
                            // }
                        },
                    },
                    B:{
                        position: 'right',
                        ticks: {
                            // callback: function(value, index, values) {
                            //     return String((parseInt(value) / 100)).substring(0,3) + "K"
                            // }
                        },
                    }
                },
            }}
        />
    </div>);
}


export function todayBarView(select_data, statename){
    let bar_view = {

        labels: ['Today'],
        datasets: [
            {
                label: 'Testing Positive Rate',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 0,

                data: []
            }
        ]
    };
    let state_data_row = request_data_by_state(select_data, states_map()[statename]);
    if(state_data_row){
        let confirmed = canpraseint(state_data_row['Confirmed']),  total_test_result = canpraseint(state_data_row['Total_Test_Results']);
        if(confirmed && total_test_result) {
            let confirm_rate = parseFloat(confirmed/total_test_result);
            let percentage_confirm_rate = confirm_rate * 100;
            let ceil_result = Math.ceil(percentage_confirm_rate/10);
            bar_view.datasets[0].data = [confirm_rate];
            bar_view.datasets[0].backgroundColor = color_list[ceil_result]

        }
    } else {
        console.log("This State not found")
    }

    return (<div>
        <p>Today's data in {state_get_full[statename]}</p>
        <Bar
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
                }
            }}
        />
    </div>);
}

export function historicalView(data2020, data2021, statename, todaydata) {
    let data = [], label_list = [], testResultData = [];
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    let cleanData = cleanDatafunc( mydata2020, mydata2021, statename);

    let result = genertateDataAndLabel(1, 12, datemap,cleanData[1], statename, '2021');
    label_list = result[0];
    data = result[1];
    testResultData = result[2];


    const plotData = {
        labels: label_list,
        datasets: [
            {
                label: 'Cases Per Test',
                cubicInterpolationMode: 'monotone',
                fill: false,
                tension: 0.4,
                yAxisID: 'A',
                backgroundColor: returnBorderColor(todaydata, statename),
                borderColor: returnBorderColor(todaydata, statename),
                borderWidth: 3,
                pointRadius: 0,
                data: applyMedianFilter(data, testResultData)[0],
            },
            {
                label: 'Tests',
                yAxisID: 'B',
                cubicInterpolationMode: 'monotone',
                fill: false,
                tension: 0.4,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 3,
                pointRadius: 0,
                data: applyMedianFilter(data, testResultData)[1]
            }

        ]
    };

    return (<div>
        <p>Historical Cases Per Test (Number of Confirmed Cases / Number of Tests) in {state_get_full[statename]}</p>
        <Line
            data={plotData}
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

                scales:{
                    A:{
                        position: 'left',
                        ticks: {
                            // callback: function(value, index, values) {
                            //     let percentage_value = parseFloat(value) * 100;
                            //
                            //     return String(percentage_value.toFixed(2)) + "%"
                            // }
                        },
                    },
                    B:{
                        position: 'right',
                        ticks: {
                            // callback: function(value, index, values) {
                            //     return String((parseInt(value) / 100)).substring(0,3) + "K"
                            // }
                        },
                    }
                },
            }}
        />
    </div>);
}

function returnBorderColor(todaydata, statename){
    let state_data_row = request_data_by_state( todaydata, states_map()[statename]);
    let confirmed = canpraseint(state_data_row['Confirmed']),  total_test_result = canpraseint(state_data_row['Total_Test_Results']);
    let confirm_rate = parseFloat(confirmed/total_test_result);
    let percentage_confirm_rate = confirm_rate * 100;
    let ceil_result = Math.ceil(percentage_confirm_rate/10);

    let border_color = color_list[ceil_result]
    return border_color;
}

function genertateDataAndLabel(month_start, month_end, datemap, data_used, statename, useYear2020){
    let data = [], label_list = [], number_tests_list = [];
    for(let i = month_start; i <= month_end; i += 1){
        let monthPadded = pad(i);
        for(let j = 1; j < datemap[i]; j += 1) {
            const stateData = data_used[i - 1][j - 1][statename];
            let dayPadded = pad(j);
            if(stateData) {
                const numConfirmed = canpraseint(stateData['Confirmed']);

                let numTests = canpraseint(stateData['Total_Test_Results']);
                if(!numTests){
                    numTests = canpraseint(stateData['People_Tested']);
                }
                if (numConfirmed && numTests) {
                    if(numConfirmed> 0 && numTests > 0) {
                        data.push(numConfirmed / numTests);
                        number_tests_list.push(numTests)
                        label_list.push(`${useYear2020}-${monthPadded}-${dayPadded}`)
                    }

                }
            }
        }
    }

    return [label_list, data, number_tests_list];
}