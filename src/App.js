import React, { Component } from "react";
import { useState } from 'react';
import "./App.css"; /* optional for styling like the :hover pseudo-class */
import USAMap from "react-usa-map";
import { connect } from 'react-redux';

import LoadingBar from 'react-top-loading-bar'
import { Button, Confirm, Modal, Image, Header } from 'semantic-ui-react'
import { SegmentedControl } from 'segmented-control'
import {Bar, Chart, Line} from 'react-chartjs-2';




class App extends Component {
  /* mandatory */


  constructor(props){
    super(props);

    this.state = {
      dataset:[],
      data_2021: Array(12).fill(0).map(row => new Array(31).fill({})),
      module: null,
      loading: false,
      open: false,
      header: '',
      content: '',
      tab:'',
      tabbarcolor:'red',
      color_state: {},
      click_state:"",
      styleofSegmentControl: { width: 400,  color: 'red',  'font-size': '12px', borderRadius: "10px 10px 10px 10px",  },
      bar_view:{

        labels: ['Confirmed Cases', 'Deaths Cases', 'Recovered Cases',
          'Active Cases', 'Testing Positive Rate Per 100,000'],
        datasets: [
          {
            label: 'Cases',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: [365747, 4872, 202137.0, 158738.0, 66800.27369964625]
          }
        ]
      },
      line_view:{
        labels: ['Confirmed Cases', 'Deaths Cases', 'Recovered Cases',
          'Active Cases', 'Testing Positive Rate Per 100,000'],
        datasets: [
          {
            label: 'Monday',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: [365747, 4872, 202137.0, 158738.0, 66800.27369964625]
          },
          {
            label: 'Tuesday',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: [365000, 4900, 202137.0, 158738.0, 66800.27369964625]
          },
          {
            label: 'Wednesday',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: [365323, 5000, 202137.0, 158738.0, 66800.27369964625]
          },
          {
            label: 'Thursday',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: [365747, 4872, 202137.0, 158738.0, 66800.27369964625]
          },
          {
            label: 'Friday',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: [365747, 4872, 202137.0, 158738.0, 66800.27369964625]
          },
        ]
      },
    };

  }
  returnMonth(month = 1, day = 10, state = 'TX'){
    month -= 1;
    day -= 1;
    let month_day = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let background_color = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)']
    let borderColor = [ 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',];
    let returnarray = [];
    if(day >= 6){
      for (let i = day - 6; i < day; i += 1) {
        let full_calendar = '2020' + '-' + (month + 1) + '-' + (i + 1);
        let new_date = new Date(full_calendar );
        if(new_date.getDay() >= 0 && new_date.getDay() <= 6) {
          let object = {};
          let weekday_result = weekday[new_date.getDay()] + " (" + (month + 1) + "/" + (i + 1) + ")";
          object['label'] = weekday_result;
          object['backgroundColor'] = background_color[i % (day - 6)];
          object['borderColor'] = borderColor[i % (day - 6)];
          object['borderWidth'] = 1;
          //fill: false,
          //       lineTension: 0.5,
          object['fill'] = false;

          object['lineTension'] = 0.5;
          console.log(this.returnToday(month + 1, i + 1, state))
          object['data'] = this.returnToday(month + 1, i + 1, state);
          returnarray.push(object);
        }
      }
    } else {
      if(month === 1) {

      } else {

      }
    }
    console.log(returnarray)
    return returnarray;

  }
  returnToday(month = 1, day= 1, state = 'TX'){
    let object = this.state.data_2021[month - 1][day - 1][state];
    let default_Arr = [365747, 4872, 202137.0, 158738.0, 66800.27369964625];
    console.log(month + "-" + day + "-" + state)
    let arr = [];


    if(object){
      let confirmed = parseInt(object['Confirmed']),  total_test_result = parseInt(object['Total_Test_Results']);

      arr.push(isNaN(parseInt(object['Confirmed'])) ? 0 : parseInt(object['Confirmed']));
      arr.push(  isNaN(parseInt((object['Deaths'])))? 0 : parseInt((object['Deaths']))  );
      arr.push(isNaN(parseInt((object['Recovered'])))? 0 : parseInt((object['Recovered'])));
      arr.push(isNaN(parseInt((object['Active'])))? 0 : parseInt((object['Active'])));
      if(isNaN(confirmed) === false && isNaN(total_test_result) === false) {
        object['Testing_Rate'] = parseInt(parseFloat(confirmed / total_test_result) * 100000);

      } else {
        object['Testing_Rate'] = '';
      }
      arr.push(isNaN(parseInt((object['Testing_Rate'])))? 0 : parseInt((object['Testing_Rate'])));
    }

    return arr.length? arr : default_Arr;
  }

  mapHandler = event => {
    //this.state.open = true;
    //this.setState({open: this.state.open})
    let color_list = ['#ADD8E6', '#87CEEB', '#87CEFA', '#191970','#000080', '#FF7F50', '#FF6347','#FF4500', '#FF0000'];
    let color_states = {};
    for(const [key, value] of Object.entries(states_map)){
      color_states[key] = {fill:"red"};
      let data_select_state = this.state.dataset.filter(item=>item.Province_State === value);
      if(data_select_state && data_select_state.length >= 1){

        for(let i = 0; i < color_list.length; i += 1) {
          if (data_select_state[0].Testing_Rate < (i + 1) * 10000) {

            color_states[key] = {fill: color_list[i]};
            break;
          }
        }
      }
    }
    this.state.click_state = event.target.dataset.name;
    this.settab({click_state: this.state.click_state})

    if(color_states[event.target.dataset.name]){
      this.state.styleofSegmentControl['color'] = color_states[event.target.dataset.name].fill
      this.setState({styleofSegmentControl: this.state.styleofSegmentControl});

    }
    this.state.click_state = event.target.dataset.name;
    this.setState({click_state: this.state.click_state});
    console.log(this.state.bar_view["datasets"][0]["backgroundColor"] );
    this.state.bar_view["datasets"][0]["borderColor"] = this.state.styleofSegmentControl['color'];
    this.state.bar_view["datasets"][0]["backgroundColor"] = this.state.styleofSegmentControl['color'];
    this.state.bar_view["datasets"][0]["data"] =  this.returnToday(1,1,event.target.dataset.name);

    this.state.line_view["datasets"] = [];
    this.state.line_view["datasets"] = this.returnMonth(1,10, event.target.dataset.name);

    this.setState({bar_view: this.state.bar_view, line_view: this.state.line_view})


    let statename = states_map[event.target.dataset.name];
    let data_select_state = this.state.dataset.filter(item=>item.Province_State === statename);
    let a = "The data in " + statename + " on 01-01-2021", b = "";

    if(!data_select_state || data_select_state.length === 0) {
      return;
    }

    // for(const [key, value] of Object.entries(data_select_state[0])) {
    //   if(key === 'Province_State' || key === 'Confirmed' || key === 'Deaths' || key === 'Recovered' || key === 'Total_Test_Results' || key === 'Testing_Rate') {
    //     let title = key, data = value;
    //     if(key === 'Province_State'){
    //       title = "State"
    //     } else if(key === 'Confirmed' || key === 'Deaths' || key === 'Recovered' ) {
    //       title += " cases "
    //     } else if(key === 'Testing_Rate')(
    //         data = String(Number.parseInt((Number.parseFloat(data) / 1000.0))) + "%"
    //     )
    //     b += title + ": " + data + " ";
    //   }
    // }
    this.setState({header: a, content: b, open: true})

  };
  open = (open = true) => this.setState({ open: open })
  close = () => this.setState({ open: false })

  settab(value){
    if(value === '1') {
      console.log("set")

      this.setState({bar_view: this.state.bar_view});
    } else if(value === '2') {
      this.setState({line_view: this.state.line_view})
    }
    this.setState({tab: value})
  }
  componentDidMount() {
    let datemap = {1: 31, 2: 28, 3:31, 4:30, 5:31, 6:30, 7: 31, 8:31, 9:30, 10:31, 11:30, 12:31};
    let list_map = [], map_parsed = {}, a = [];

    for(let i = 1 ; i <= 12; i += 1) {
      let month = i;
      if(month < 10) {
        month = "0" + i;
      }
      for(let j = 1; j <= datemap[i]; j += 1) {
        let day = j;
        if(j < 10) {
          day = "0" + day;
        }

        const filename = "./dataset/" + month + "-" + day + "-" + 2021 + ".csv";
        if(i >= 11 || (i === 10 && j >= 15)) {
          break;
        } else {
          import(`${filename}`)
              .then(async module => {
                a = await fetch(module.default)
                    .then(rs => rs.text())
                    .then(text => {
                      let info_list = text.split("\n"), day_map = {};
                      let row_identifer = info_list[0].split(",");

                      for(let k = 1; k < info_list.length; k += 1) {
                        let splited_data = info_list[k].split(",");
                        for (let l = 0; l < splited_data.length; l += 1) {
                          map_parsed[row_identifer[l]] = splited_data[l];
                        }
                        map_parsed['Province_State'] = String(splited_data[0]);
                        let state_name = map_parsed['Province_State'];
                        if(state_name) {

                          for(const [key, value] of Object.entries(states_map)){
                            if(state_name === value){
                               day_map[key] = map_parsed;
                               break;
                            }
                          }
                        }
                        map_parsed = {};
                      }
                      this.state.data_2021[i - 1][j - 1] = day_map;
                      this.setState({data_2021: this.state.data_2021, loading: true,});
                    });
              })

        }


      }


    }


    const filename = "./dataset/01-01-2021.csv";

    import(`${filename}`)
        .then(async module => {
          a = await fetch(module.default)
              .then(rs => rs.text())
              .then(text => {

                let list = text.split("\n");

                let row_identifer = list[0].split(",");
                map_parsed = {};
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
                  this.setState({dataset: list_map, loading:false})
                }

              });
        })









  }

  /* optional customization of filling per state and calling custom callbacks per state */
  statesCustomConfig = () => {

    let color_list = ['#ADD8E6', '#87CEEB', '#87CEFA', '#191970','#000080', '#FF7F50', '#FF6347','#FF4500', '#FF0000'];
    let color_states = {};
    for(const [key, value] of Object.entries(states_map)){
      color_states[key] = {fill:"red"};
      let data_select_state = this.state.dataset.filter(item=>item.Province_State === value);
      if(data_select_state.length >= 1){

        for(let i = 0; i < color_list.length; i += 1) {
          if (data_select_state[0].Testing_Rate < (i + 1) * 10000) {

            color_states[key] = {fill: color_list[i]};
            break;
          }
        }
      }
    }



    return color_states;
  };



  updatebarview(a){
    this.setState({bar_view: a})
  }
  returntabs(){

    if(this.state.tab === '1'){


      return (<div>
        <Line
            data={this.state.bar_view}
            options={{

              title:{

                display:true,
                text:'data per day',
                fontSize:20
              },
              legend:{
                display:true,
                position:'right'
              }
            }}
        />
      </div>);
    } else if (this.state.tab === '2') {
      return (
          <div>
        <Bar
            data={this.state.line_view}
            options={{
              indexAxis: 'y',
              title:{
                display:true,
                text:'day per week',
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
  }


  render() {

    if (this.state.loading === false) {
      return <LoadingBar />;
    } else {

    }
    return (

        <div>
          <h1 style={{textAlign: 'center', marginTop:125 }}>new-metric-cases-per-test-visualization</h1>
          <div className="App" width="500" style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop:75 }}>
            <USAMap
                customize={this.statesCustomConfig()}
                onClick={this.mapHandler}

            />
            <Modal
                onClose={() => this.open(false)}
                onOpen={() => this.open(true)}
                open={this.state.open}

            >
              <Modal.Header>
                <div style={{display: 'flex',  justifyContent:'center', alignItems:'center' }}>
                  <SegmentedControl
                      className = "modal_segmentedControl"
                      name="oneDisabled"
                      options={[
                        { label: "today", value: "1", default: true },
                        { label: "this Week", value: "2" },
                        { label: "this Month", value: "3"},
                        { label: "three Months", value: "4" }
                      ]}
                      setValue={newValue => this.settab(newValue)}
                      style={ this.state.styleofSegmentControl} // purple400
                  />
                  <div className="ui button" data-tooltip="Data missing? That's because some states may not provide detail data" data-position="top center">
                    ?
                  </div>
                </div>
              </Modal.Header>
              <Modal.Content>

                <Modal.Description>
                  {this.returntabs()}
                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button color='black' onClick={() => this.open(false)}>
                  Sugeestions
                </Button>
                <Button
                    content="Yep, that's great"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={() => this.open(false)}
                    positive
                />
              </Modal.Actions>
            </Modal>

            {/*<Confirm*/}
            {/*    open={this.state.open}*/}
            {/*    header= {this.state.header}*/}
            {/*    content= {this.state.content}*/}
            {/*    onCancel={this.close}*/}
            {/*    onConfirm={this.close}*/}
            {/*/>*/}
          </div>
          <Button onClick={()=>{
            const filename = "./dataset/10-10-2021.csv";
            let a = {}, map_parsed = {}, list_map = [];
            import(`${filename}`)
                .then(async module => {
                  a = await fetch(module.default)
                      .then(rs => rs.text())
                      .then(text => {

                        let list = text.split("\n");

                        let row_identifer = list[0].split(",");
                        map_parsed = {};
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
                          this.setState({dataset: list_map, loading:true})
                        }

                      });
                })
          }}> update from 01/01/2021 to 10/10/2021</Button>
        </div>

    );
  }
}

function findinit(name) {
  for(const [key, value] of Object.entries(states_map)){
    if(value === name) {
      return key;
    }
  }
  return -1;
}

const states_map = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AS": "American Samoa",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "DC": "District Of Columbia",
  "FM": "Federated States Of Micronesia",
  "FL": "Florida",
  "GA": "Georgia",
  "GU": "Guam",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MH": "Marshall Islands",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "MP": "Northern Mariana Islands",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PW": "Palau",
  "PA": "Pennsylvania",
  "PR": "Puerto Rico",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VI": "Virgin Islands",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
};
export default App;
