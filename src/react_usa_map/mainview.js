import USAMap from "react-usa-map";
import React, { Component } from "react";
import {Button, Confirm, Modal, Image, Header, Segment, SegmentGroup, } from 'semantic-ui-react'
import "./mainview.css"
import faker from 'faker'
import _ from 'lodash'
import {pad, states_map, generateColorStateMap, request_data_by_state, canpraseint} from "../util/util_func"
import { SegmentedControl } from 'segmented-control'
import {historicalView, semiAnnuallyView, todayBarView, quarterView} from '../util/modal_chart_util'
import Multiselect from 'multiselect-react-dropdown';
import { Dropdown, Menu } from 'semantic-ui-react'
import Select from 'react-select';
import {searchChart} from "../util/search_chart_util";
import {
    simulateCasesAndTestsChart,
    simulateCasesChart,
    simulateChart, simulateMovingAverageChart,
    simulateTestsChart
} from "../util/simulate_chart_util";

const map_get_full = states_map()

let multilestyle = {
    chips: { // To change css chips(Selected options)
        background: '#191970',
        alignItems: 'center',
        borderRadius: '5px',
        border: '1px solid #191970',
    },

}
const options = [
    { text: '2020', value: 0 },
    { text: '2021', value: 1 },
    { text: 'Both', value: 2 },
]
export default class MainView  extends Component{
    constructor(props) {
        super(props);

        this.state = {
            data_2021: Array(12).fill(0).map(row => new Array(31).fill({})),
            data_2020: Array(12).fill(0).map(row => new Array(31).fill({})),
            selectMonth:1,
            selectDay:1,
            select_date_data:[],

            loading: true,
            loading2: true,
            open:false,
            fill_color_state_map:{},

            segment_control_background: { width: 500,  color: 'red',  fontSize: '15px', borderRadius: "10px 10px 10px 10px",  }, // background color of segment
            tab:1,
            main_tab:10,
            select_state:"",

            selectText: "Select Or Enter Text",
            options: [{name: 'Option 1️⃣', id: 1},{name: 'Option 2️⃣', id: 2}, {name: 'Option 3', id: 2}],
            select_state_list:[],
            selectedValue:[],
            selectYearInSearch:2,

            select_day_list:[],
            selectedStateValue:"",

            selectYearInQuarter: '2021',
            selectQuarterInQuarter: "Fall",
            selectYearInSemiannually: '2021',
            selectSemesterInSemiannually: "Fall",
            selectedShiftDay: 0,
        }
        //onSelect
        this.onSelect = this.onSelect.bind(this);

        //onRemove
        this.onRemove = this.onRemove.bind(this);

    }

    componentDidMount() {
        this.requestAllData()

        this.requestDataByDate()
        this.fillSearchBarData()
    }

    /***********************functions used for map*/

    async requestAllData(){
        // let datemap = {1: 31, 2: 28, 3:31, 4:30, 5:31, 6:30, 7: 31, 8:31, 9:30, 10:31, 11:30, 12:31};
        // let list_map = [], map_parsed = {}, a = [];
        // for(let i = 1 ; i <= 12; i += 1) {
        //     let month = pad(i);

        //     for(let j = 1; j <= datemap[i]; j += 1) {
        //         let day = pad(j);
        //         const filename = "./dataset/" + month + "-" + day + "-" + 2021 + ".csv";

        //         if(i >= 11 || (i === 10 && j >= 15)) {
        //             break;
        //         } else {
        //             import(`${filename}`)
        //                 .then(async module => {
        //                     a = await fetch(module.default)
        //                         .then(rs => rs.text())
        //                         .then(text => {

        //                             let info_list = text.split("\n"), day_map = {};
        //                             let row_identifer = info_list[0].split(",");
        //                             for(let k = 1; k < info_list.length; k += 1) {
        //                                 let splited_data = info_list[k].split(",");
        //                                 for (let l = 0; l < splited_data.length; l += 1) {
        //                                     map_parsed[row_identifer[l]] = splited_data[l];
        //                                 }
        //                                 map_parsed['Province_State'] = String(splited_data[0]);
        //                                 let state_name = map_parsed['Province_State'];
        //                                 if(state_name) {

                                            // for(const [key, value] of Object.entries(map_get_full)){
        //                                         if(state_name === value){
        //                                             day_map[key] = map_parsed;
        //                                             break;
        //                                         }
        //                                     }
        //                                 }
        //                                 map_parsed = {};

        //                             }


        //                             this.state.data_2021[i - 1][j - 1] = day_map;
        //                         });
        //                 })

        //         }


        //     }
        //     for(let j = 1; j <= datemap[i]; j += 1) {
        //         let day = pad(j);
        //         const filename = "./dataset/" + month + "-" + day + "-" + 2020 + ".csv";

        //         if((i == 4 && j >= 12) || i >= 5){
        //             import(`${filename}`)
        //                 .then(async module => {
        //                     a = await fetch(module.default)
        //                         .then(rs => rs.text())
        //                         .then(text => {

        //                             let info_list = text.split("\n"), day_map = {};
        //                             let row_identifer = info_list[0].split(",");
        //                             for(let k = 1; k < info_list.length; k += 1) {
        //                                 let splited_data = info_list[k].split(",");
        //                                 for (let l = 0; l < splited_data.length; l += 1) {
        //                                     map_parsed[row_identifer[l]] = splited_data[l];
        //                                 }
        //                                 map_parsed['Province_State'] = String(splited_data[0]);
        //                                 let state_name = map_parsed['Province_State'];
        //                                 if(state_name) {

        //                                     for(const [key, value] of Object.entries(map_get_full)){
        //                                         if(state_name === value){
        //                                             day_map[key] = map_parsed;
        //                                             break;
        //                                         }
        //                                     }
        //                                 }
        //                                 map_parsed = {};

        //                             }


        //                             this.state.data_2020[i - 1][j - 1] = day_map;
        //                         });
        //                 })
        //         }


        //     }


        // }
        console.log("start");
        const response = await fetch('http://192.168.1.72:8888/whole?state=Texas', {
            method: 'GET', // The method
            mode: 'cors', // It can be no-cors, cors, same-origin
        });
        console.log(response);
        console.log("GET finish");
        const data = await response.json();
        console.log(data);
        console.log(data["2020"]);
        this.state.data_2020 = data["2020"];
        this.state.data_2021 = data["2021"];
        console.log(this.state.data_2020);
        console.log(this.state.data_2021);

        // await fetch('http://192.168.1.72:8888/whole?state=Texas', {
        // method: 'GET', // The method
        // mode: 'cors', // It can be no-cors, cors, same-origin
        // }).then(async function(response) {
        //     // The response is a Response instance.
        //     // You parse the data into a useable format using `.json()`
        //     console.log(response);
        //     console.log(response.body.json());
        //     console.log("to json");
        //     return response.body.json();
        // }).
        // then(async function(data) {
        //     // `data` is the parsed version of the JSON returned from the above endpoint.
        //     console.log("receive data success");
        //     console.log(data);
        //     this.state.data_2020 = data["2020"];
        //     this.state.data_2021 = data["2021"];
        // }).catch(err => {
        //     // In case it errors.
        // });


        this.setState({data_2021: this.state.data_2021, data_2020: this.state.data_2020, loading2:false});
    }



    requestDataByDate(){
        let list_map = []

        const filename = "./dataset/" + pad(this.state.selectMonth) + "-" + pad(this.state.selectDay) + "-" + "2021.csv";

        import(`${filename}`)
            .then(async module => {
                let a = await fetch(module.default)
                    .then(rs => rs.text())
                    .then(text => {

                        let list = text.split("\n");

                        let row_identifer = list[0].split(",");
                        let map_parsed = {}
                        for (let i = 1; i < list.length; i += 1) {
                            let splited_data = list[i].split(",");
                            for (let j = 0; j < splited_data.length; j += 1) {
                                map_parsed[row_identifer[j]] = splited_data[j];
                            }

                            map_parsed['Province_State'] = String(splited_data[0]);
                            if(list_map.length <= 60) {
                                list_map.push(map_parsed);
                            }

                            map_parsed = {};
                        }
                        this.setState({select_date_data: list_map, loading:false})

                    });
            })
    }

    fillSearchBarData(){
        function* entries(obj) {
            for (let key in obj)
                yield [key, obj[key]];
        }
        const map = new Map(entries(map_get_full));
        let searchOptiopnArray = [];

        for (let [key, value] of map){
            let object = {};
            object.name = value;
            object.id = key;
            searchOptiopnArray.push(object);
        }
        this.state.options = [];
        this.state.options = JSON.parse(JSON.stringify(searchOptiopnArray));
        this.setState({options: this.state.options})
    }

    mapHandler = event => {
        let selectState = event.target.dataset.name, select_state_color = generateColorStateMap(this.state.select_date_data)[selectState];
        this.state.segment_control_background.color = select_state_color.fill;

        this.setState({open: true, segment_control_background: this.state.segment_control_background, select_state:selectState})
    };

    showTab(){

        switch (this.state.tab){
            //quarterView(data2020, data2021, statename, useYear2020, quarter)
                //semiAnnuallyView(data2020, data2021, statename, useYear2020, semester, todaydata)
            case 2:
                return quarterView(this.state.data_2020, this.state.data_2021,this.state.select_state, this.state.selectYearInQuarter, this.state.selectQuarterInQuarter,  this.state.select_date_data)
            case 3:
                return semiAnnuallyView(this.state.data_2020, this.state.data_2021, this.state.select_state, this.state.selectYearInSemiannually, this.state.selectSemesterInSemiannually, this.state.select_date_data)
            case 4:
                return historicalView(this.state.data_2020,this.state.data_2021, this.state.select_state, this.state.select_date_data)
            default:
                return todayBarView(this.state.select_date_data, this.state.select_state)
        }

    }
    showSelection(){
        if(this.state.tab === 2) {
            return (
                <div>
                    <Menu compact style = {{position: 'absolute',
                        right: "10px",}}>
                        <Dropdown value = {this.state.selectQuarterInQuarter} options={[ {text: "Winter", value: 'Winter'}, { text: 'Spring', value: 'Spring' }, {text: "Summer", value: "Summer"}, { text: 'Fall', value: 'Fall' },]}  onChange={(event, {value})=>{
                            this.setState({selectQuarterInQuarter: value});
                            console.log(this.state.selectQuarterInQuarter);
                        }} simple item />
                    </Menu>
                    <Menu compact style = {{position: 'absolute',
                        right: "130px",}}>
                        <Dropdown value = {this.state.selectYearInQuarter} options={[{ text: '2020', value: '2020' }, { text: '2021', value: '2021' },]}  onChange={(event, {value})=>{
                            this.setState({selectYearInQuarter: value});
                            console.log(this.state.selectYearInQuarter);
                        }} simple item />
                    </Menu>
                </div>


            );
        } else if (this.state.tab === 3) {
            return (
                <div>
                    <Menu compact style = {{position: 'absolute',
                        right: "10px",}}>
                        <Dropdown value = {this.state.selectSemesterInSemiannually} options={[{ text: 'Jan-June', value: 'Spring' }, { text: 'July-Dec', value: 'Fall' },]}  onChange={(event, {value})=>{
                            this.setState({selectSemesterInSemiannually: value});
                            console.log(value)
                        }} simple item />
                    </Menu>

                    <Menu compact style = {{position: 'absolute',
                        right: "130px",}}>
                        <Dropdown value = {this.state.selectYearInSemiannually} options={[{ text: '2020', value: '2020' }, { text: '2021', value: '2021' },]}  onChange={(event, {value})=>{
                            this.setState({selectYearInSemiannually: value});
                            console.log(this.state.selectYearInSemiannually);
                        }} simple item />
                    </Menu>

                </div>

            );
        } else {
            return null;
        }

    }

    showMainTab(){
        switch (this.state.main_tab){
            case 30:
                return this.simulateView()
            case 20:
                return this.mainSearchView()
            default:
                return this.mainMapView()
        }
    }

    statesCustomConfig = () => {
        return generateColorStateMap(this.state.select_date_data);
    };

    setOpen(value){
        this.setState({open:value,  selectYearInQuarter: '2021',
            selectQuarterInQuarter: "Fall",
            selectYearInSemiannually: '2021',
            selectSemesterInSemiannually: "Fall",});

    }

    setTab(value){
        this.setState({tab:value})
    }

    setMainTab(value){
        this.setState({main_tab: value, })
        this.setState({select_state_list:[], select_day_list:[]})
    }


    mainMapView(){
        return <div className="App" width="200">

            <USAMap
                customize={this.statesCustomConfig()}
                onClick={this.mapHandler}
            />
            <Modal
                onClose={() => this.setOpen(false)}
                onOpen={() => this.setOpen(true)}
                open={this.state.open}
            >
                <Modal.Header>
                    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center' }}>
                        <SegmentedControl
                            className = "modal_segmentedControl"
                            name="oneDisabled"
                            options={[
                                { label: "Today", value: 1, default: true },
                                { label: "Quarterly", value: 2 },
                                { label: "Semi-annually", value: 3},
                                { label: "Historical", value: 4 }
                            ]}
                            setValue={newValue => this.setTab(newValue)}
                            style={ this.state.segment_control_background} // purple400
                        />
                        <div className="ui button" data-tooltip="Data missing? That's because some states may not provide detail data" data-position="top center">
                            ?
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Content>
                    {this.showSelection()}
                    {this.showTab()}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='black' onClick={() => this.setOpen(false)}>
                        Suggestions
                    </Button>
                    <Button
                        content="Yep, that's great"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => this.setOpen(false)}
                        positive
                    />
                </Modal.Actions>
            </Modal>
        </div>
    }


    onSelect(selectedList, selectedItem) {
        if(selectedList && selectedList.length >= 1) {

            this.state.selectText = "Backspace to remove ";
        } else {
            this.state.selectText = "Select...";
        }
        this.setState({selectText: this.state.selectText, select_day_list:[],select_state_list: selectedList})
    }

    onRemove(selectedList, removedItem) {
        if(selectedList && selectedList.length >= 1) {
            this.state.selectText = "Backspace to remove ";
        } else {
            this.state.selectText = "Select...";
        }
        this.setState({selectText: this.state.selectText, select_day_list:[] ,select_state_list: selectedList})
    }





    searchChartResult(){
        return searchChart(this.state.data_2021, this.state.data_2020, this.state.select_state_list, this.state.selectYearInSearch);
    }


    mainSearchView(){

        return (
            <div style={{marginLeft: "50px", marginRight: "50px"}}>
                <Multiselect
                    options={this.state.options} // Options to display in the dropdown
                    selectedValues={this.state.selectedValue} // Preselected value to persist in dropdown
                    onSelect={this.onSelect} // Function will trigger on select event
                    onRemove={this.onRemove} // Function will trigger on remove event
                    displayValue="name"
                    showCheckbox ={true}
                    placeholder = {this.state.selectText}// Property name to display in the dropdown options
                    style={multilestyle}
                />
                <Menu compact style = {{position: 'absolute',
                    right: "50px",}}>
                    <Dropdown value = {this.state.selectYearInSearch} options={options}  onChange={(event, {value})=>{
                        this.setState({selectYearInSearch: value});
                        console.log(value)
                    }} simple item />
                </Menu>
                {this.searchChartResult()}
            </div>
        );
    }


    handleChangeSelectDay = (e, {value}) => {
        this.setState({select_day_list: value})
    }

    handleChangeSelectState = (e, {value}) =>{

        this.setState({selectedStateValue: value})
    }

    handleChangeSelectShiftDays = (e, {value}) =>{

        this.setState({selectedShiftDay: value})
    }




    simulateChartRatioResult(){
        return simulateChart(this.state.data_2021, this.state.data_2020, this.state.select_day_list, this.state.selectedStateValue, this.state.selectedShiftDay);
    }

    simulateChartTestsResult(){
        return simulateTestsChart(this.state.data_2021, this.state.data_2020, this.state.select_day_list, this.state.selectedStateValue, this.state.selectedShiftDay);
    }









    simulateChartCasesResult(){
        return simulateCasesChart(this.state.data_2021, this.state.data_2020, this.state.select_day_list, this.state.selectedStateValue, this.state.selectedShiftDay);
    }

    simulateMovingAverageResult(){
        return simulateMovingAverageChart(this.state.data_2021, this.state.data_2020, this.state.select_day_list, this.state.selectedStateValue, this.state.selectedShiftDay);
    }

    simulateView(){
        let simulateOptions = [];
        simulateOptions.push({key: 0, text: "Original", value: 0});
        for(let i = 3; i <= 30; i += 1) {
            simulateOptions.push({key: i, text: i + " Days", value: i});
        }


        const addressDefinitions = faker.definitions.address
        const stateOptions = _.map(addressDefinitions.state, (state, index) => ({
            key: addressDefinitions.state_abbr[index],
            text: state,
            value: addressDefinitions.state_abbr[index],
        }))






        let shiftDayOptions = [];

        for(let i = 0; i <= 5; i += 1) {
            shiftDayOptions.push(
                {
                    key: i,
                    text: i,
                    value: i,
                }
            );
        }

        return (
            <div>
                <div style={{marginLeft: "50px", marginRight: "50px"}}>
                    <div>
                        <Dropdown placeholder='State' search selection options={stateOptions} onChange={this.handleChangeSelectState.bind(this)} />
                        <Dropdown placeholder='Shift Days' search selection options={shiftDayOptions} onChange={this.handleChangeSelectShiftDays.bind(this)} />
                    </div>
                    <Dropdown
                        placeholder='n day filter'
                        fluid
                        multiple
                        search
                        selection
                        options={simulateOptions}
                        onChange={this.handleChangeSelectDay.bind(this)}
                    />
                </div>
                <br/>
                <div className="row">
                    <div className="column">

                        {this.simulateChartTestsResult()}

                    </div>
                    <div className="column">
                        {this.simulateChartCasesResult()}

                    </div>

                </div>
                <br/>
                <div className="row">
                    <div className="column">
                        {this.simulateChartRatioResult()}
                    </div>
                    <div className="column">
                        {this.simulateMovingAverageResult()}
                    </div>

                </div>

            </div>


        );
    }
    /***********************functions used for map*/





    render(){
        if(this.state.loading || this.state.loading2){
            return <h1>Loading...</h1>
        }
        return(
            <div>
                <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop: "100px"}}>
                    <SegmentedControl
                        className = "modal_segmentedControl"
                        name="oneDisabled"
                        options={[
                            { label: "Map View", value: 10, default: true },
                            { label: "Search View", value: 20 },
                            { label: "Simulate View", value: 30 },
                        ]}
                        setValue={newValue => this.setMainTab(newValue)}
                        style ={{width: 450, color: '#191970', fontSize: '15px', borderRadius: "10px 10px 10px 10px",}}
                    />

                </div>
                {this.showMainTab()}
                {/*<div className={"rectangle"}>*/}

                {/*</div>*/}

            </div>

        );
    }


}

