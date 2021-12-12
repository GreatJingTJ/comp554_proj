import {canpraseint, pad, request_data_by_state, states_map } from "./util_func";
import {Bar, Line} from "react-chartjs-2";
import React from "react";
import {genertateDataAndLabel, week_list} from "./modal_chart_util";

export const color_list = ['rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)', '#FF4500', '#FF0000'];
const state_get_full = states_map();


function cleanDatafunc(data2020, data2021, statename){
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let a = 0, b = 0; // a would record the confirmed case and b would record  tests each time
    for(let i = 1; i <= 12; i += 1) {
        for(let j = 1; j <= datemap[i]; j += 1) {
            let dataState = data2020[i - 1][j - 1][statename];
            if(dataState){
                const numConfirmed = canpraseint(dataState['Confirmed']);
                let numTests = canpraseint(dataState['Total_Test_Results']);
                // let found = false;
                if(!numTests){
                    numTests = canpraseint(dataState['People_Tested']);
                    // found = true;
                }
                if(a === 0 && b === 0 && numConfirmed && numTests){
                    a = numConfirmed;
                    b = numTests;
                } else if(numConfirmed > 0 && numTests > 0){
                    data2020[i - 1][j - 1][statename]['Confirmed'] = String(numConfirmed - a);
                    // if(found) { // in 2020 csv, there will be either People_Tested or Total_Test_Results field name
                    //     data2020[i - 1][j - 1][statename]['People_Tested'] = String(numTests - b);
                    // } else {
                    //     data2020[i - 1][j - 1][statename]['Total_Test_Results'] = String(numTests - b);
                    // }
                    data2020[i - 1][j - 1][statename]['Total_Test_Results'] = String(numTests - b);
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
                let numTests = canpraseint(dataState['Total_Test_Results']);
                // let found = false;
                if(!numTests){
                    numTests = canpraseint(dataState['People_Tested']);
                    // found = true;
                }
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

function filterHelper(data, dayNum, ratio = false){
    let filter = [];
    if(dayNum === 0) {
        for(let i = 0; i < data.length; i += 1) {
            let value = data[i];
            while(value >= 100000){
                value = parseInt(value / 10);
            }
            if(ratio) {
                while(value >= 1){
                    value = parseFloat(value / 2);
                }
            }
            filter.push(value);

        }
        return filter;
    }

    for(let i = 0; i < data.length; i += 1) {
        let push_value = data[i], given_array = [];;


        for(let j = i; j < i + dayNum; j += 1){
            let value = data[j % (data.length)]
            if(value > 300000) {
                while(value >= 100000){
                    value = parseInt(value / 10);
                }
            }
            if(ratio) {
                while(value >= 1){
                    value = parseFloat(value / 2.5);
                }


            }
            given_array.push(value);

        }

        given_array.sort();
        push_value = given_array[parseInt(dayNum/2)]
        filter.push(push_value);

    }
    return filter;
}

function movingAverageHelper(data, dayNum, ratio = false){
    let filter = [];
    if(dayNum === 0) {

        for(let i = 0; i < data.length; i += 1) {
            let value = data[i];
            while(value >= 100000){
                value = parseInt(value / 10);
            }
            if(ratio) {
                while(value >= 1){
                    value = parseFloat(value / 2.5);
                }


            }
            filter.push(value);

        }
        console.log(filter)
        return [filter];
    }
    for(let i = 1; i < data.length; i += 1) {
        let push_value = data[i], given_array = [];
        for(let j = i - 1; j < i - 1 + dayNum; j += 1){

            let value = data[j % (data.length)]

            while(value >= 100000){
                value = parseInt(value / 10);
            }
            if(ratio) {
                while(value >= 1){
                    value = parseFloat(value / 2.5);
                }


            }


            given_array.push(value);
        }
        let sum = given_array.reduce(function(acc, val) { return acc + val; }, 0);
        if(sum !== 0) {
            push_value = sum / dayNum;
        }
        filter.push(push_value);

    }
    return [filter];
}

function applyMedianFilter(confirm, test, dayNum = 3, ratio = false){
    let filter_confirm = [], filter_test = [];

    filter_confirm = filterHelper(confirm, dayNum, ratio);
    filter_test = filterHelper(test, dayNum, ratio);

    return [filter_confirm, filter_test];



}

function getLabel(dayNum, label) {
    if(dayNum === 0 ){
        return "Original Data";
    } else {
        return dayNum + label;
    }
}

export function simulateChart(data2021, data2020, day_list, stateName, shiftDay){
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    let cleaned_data = cleanDatafunc(mydata2020,mydata2021, stateName);
    let result_2020 = genertateDataAndLabel(4, 12, datemap,cleaned_data[0], stateName, '2020', shiftDay, cleaned_data[1]);
    let result_2021 = genertateDataAndLabel(1, 12, datemap,cleaned_data[1], stateName, '2021', shiftDay, cleaned_data[1]);
    let labels_arr = result_2020[0].concat(result_2021[0]);
    let data_arr = result_2020[1].concat(result_2021[1]);

    let bar_view = {

        labels: labels_arr,
        datasets: []
    };


    for(let i = 0; i < day_list.length; i += 1) {
        let day = day_list[i];
        bar_view.datasets.push({
            label: getLabel(day , " days median filter"),
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            cubicInterpolationMode: 'monotone',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            data: [],


        })
        let data_filter = applyMedianFilter(data_arr, [], day, true);
        bar_view.datasets[i].data = data_filter[0];
    }


    let x_axis_container = {};
    let month_array = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    return (<div>
        <div className="ui medium label">Historical Cases Per Test (Number of Confirmed Cases / Number of Tests) Days Filter</div>

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
                    x: {
                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function(val, index, ticks) {

                                let label = this.getLabelForValue(val);

                                let split_array = label.split("-");
                                let year = split_array[0], month = parseInt(split_array[1]) - 1;
                                if(!x_axis_container[year + month]){
                                    x_axis_container[year + month] = 1;
                                    return month_array[month] + " " + year;
                                }
                                if(index === ticks.length - 1) {
                                    x_axis_container = {};
                                }


                            },

                        }
                    }
                }
            }}
        />
    </div>);

}



export function simulateCasesChart(data2021, data2020, day_list, stateName, shiftDay){
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    let cleaned_data = cleanDatafunc(mydata2020,mydata2021, stateName);
    let result_2020 = genertateDataAndLabel(4, 12, datemap,cleaned_data[0], stateName, '2020', shiftDay, cleaned_data[1]);
    let result_2021 = genertateDataAndLabel(1, 12, datemap,cleaned_data[1], stateName, '2021', shiftDay, cleaned_data[1]);
    let labels_arr = result_2020[0].concat(result_2021[0]);
    let data_arr = result_2020[2].concat(result_2021[2]);

    let bar_view = {

        labels: labels_arr,
        datasets: []
    };


    for(let i = 0; i < day_list.length; i += 1) {
        let day = day_list[i];
        bar_view.datasets.push({
            label: getLabel(day," days median filter"),
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            cubicInterpolationMode: 'monotone',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            data: [],


        })
        let data_filter = applyMedianFilter(data_arr, [], day);
        bar_view.datasets[i].data = data_filter[0];
    }


    let x_axis_container = {};
    let month_array = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    return (<div>
        <div className="ui medium label">Number of Confirmed Cases Days Filter</div>

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
                    x: {
                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function(val, index, ticks) {

                                let label = this.getLabelForValue(val);

                                let split_array = label.split("-");
                                let year = split_array[0], month = parseInt(split_array[1]) - 1;
                                if(!x_axis_container[year + month]){
                                    x_axis_container[year + month] = 1;
                                    return month_array[month] + " " + year;
                                }
                                if(index === ticks.length - 1) {
                                    x_axis_container = {};
                                }


                            },

                        }
                    }
                }
            }}
        />
    </div>);

}

export function simulateTestsChart(data2021, data2020, day_list, stateName, shiftDay){
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    let cleaned_data = cleanDatafunc(mydata2020,mydata2021, stateName);
    let result_2020 = genertateDataAndLabel(4, 12, datemap,cleaned_data[0], stateName, '2020', shiftDay, cleaned_data[1]);
    let result_2021 = genertateDataAndLabel(1, 12, datemap,cleaned_data[1], stateName, '2021', shiftDay, cleaned_data[1]);
    let labels_arr = result_2020[0].concat(result_2021[0]);
    let data_arr = result_2020[3].concat(result_2021[3]);

    let bar_view = {

        labels: labels_arr,
        datasets: []
    };


    for(let i = 0; i < day_list.length; i += 1) {
        let day = day_list[i];
        bar_view.datasets.push({
            label: getLabel(day , " days median filter"),
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            cubicInterpolationMode: 'monotone',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            data: [],


        })
        let data_filter = applyMedianFilter(data_arr, [], day);
        bar_view.datasets[i].data = data_filter[0];
    }


    let x_axis_container = {};
    let month_array = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    return (<div>
        <div className="ui medium label">Number of Tests Days Filter</div>
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
                    x: {
                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function(val, index, ticks) {

                                let label = this.getLabelForValue(val);

                                let split_array = label.split("-");
                                let year = split_array[0], month = parseInt(split_array[1]) - 1;
                                if(!x_axis_container[year + month]){
                                    x_axis_container[year + month] = 1;
                                    return month_array[month] + " " + year;
                                }
                                if(index === ticks.length - 1) {
                                    x_axis_container = {};
                                }


                            },

                        }
                    }
                }
            }}
        />
    </div>);

}

export function simulateMovingAverageChart(data2021, data2020, day_list, stateName, shiftDay){
    const datemap = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31};
    let mydata2020 = JSON.parse(JSON.stringify(data2020)), mydata2021 = JSON.parse(JSON.stringify(data2021));
    console.log("11111111111111111111111");
    console.log(mydata2020);
    let cleaned_data = cleanDatafunc(mydata2020,mydata2021, stateName);
    let result_2020 = genertateDataAndLabel(4, 12, datemap,cleaned_data[0], stateName, '2020', shiftDay, cleaned_data[1]);
    let result_2021 = genertateDataAndLabel(1, 12, datemap,cleaned_data[1], stateName, '2021', shiftDay, cleaned_data[1]);
    let labels_arr = result_2020[0].concat(result_2021[0]);
    let data_arr = result_2020[1].concat(result_2021[1]);

    let bar_view = {

        labels: labels_arr,
        datasets: []
    };


    for(let i = 0; i < day_list.length; i += 1) {
        let day = day_list[i];
        bar_view.datasets.push({
            label: getLabel(day , " days moving average"),
            backgroundColor: color_list[i % color_list.length],
            borderColor: color_list[i % color_list.length],
            cubicInterpolationMode: 'monotone',
            fill: false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            data: [],


        })
        let data_filter = movingAverageHelper(data_arr, day, true);
        bar_view.datasets[i].data = data_filter[0];
    }


    let x_axis_container = {};
    let month_array = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    return (<div>
        <div className="ui medium label">Historical Cases Per Test (Number of Confirmed Cases / Number of Tests) Center Moving Average</div>
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
                    x: {
                        ticks: {
                            // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                            callback: function(val, index, ticks) {

                                let label = this.getLabelForValue(val);

                                let split_array = label.split("-");
                                let year = split_array[0], month = parseInt(split_array[1]) - 1;
                                if(!x_axis_container[year + month]){
                                    x_axis_container[year + month] = 1;
                                    return month_array[month] + " " + year;
                                }
                                if(index === ticks.length - 1) {
                                    x_axis_container = {};
                                }


                            },

                        }
                    }
                }
            }}
        />
    </div>);

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


