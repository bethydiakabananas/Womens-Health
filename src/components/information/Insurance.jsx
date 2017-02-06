"use strict";

import React, { Component } from "react";
import Highcharts from "react-highcharts";
import _ from "underscore";
import InlineSelect from "../InlineSelect.jsx";
import Legend from "./Legend.jsx";
import stateNames from "../../data/state-names.json";
import strings from "../../data/strings.json";
import Dispatcher from "../../setup.js";
import colors from "../../data/colors.js";

let getBarChartColor = (insurance, activeInsurance) => {
  if (insurance === activeInsurance) {
    return colors[colors.mapping[activeInsurance]].range(70);
  }
  return colors.turquoise.defaultFill;
};

let getBarChartData = (data, state, insurance) => {
  let stateData = _.findWhere(data, {State: state});
  return [{
    name: strings.insurance.employer.name,
    color: getBarChartColor("employer", insurance),
    y: +stateData.employer
  },
  {
    name: strings.insurance["non-group"].name,
    color: getBarChartColor("non-group", insurance),
    y: +stateData["non-group"]
  },
  {
    name: strings.insurance.medicaid.name,
    color: getBarChartColor("medicaid", insurance),
    y: +stateData.medicaid
  },
  {
    name: strings.insurance.uninsured.name,
    color: getBarChartColor("uninsured", insurance),
    y: +stateData.uninsured
  }];
};

let getChartConfig = (data, state, insurance) => {
  return {
    chart: {
      type: "column",
      style: {
        fontFamily: ["Open Sans", "Verdana", "Arial", "Helvetica", "sans-serif"]
      }
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
        animation: {
          duration: 100
        }
      }
    },
    title: {
      text: `Health insurance coverage of women aged 19–64 in <b>${stateNames[state]}</b>`,
      align: "left",
      useHtml: true,
      style: {
        "font-family": ["Open Sans", "Arial", "sans-serif"],
        "font-weight": "300",
        "font-size": "14px"
      }
    },
    xAxis: {
      categories: [strings.insurance.employer.name,
                    strings.insurance["non-group"].name,
                    strings.insurance.medicaid.name,
                    strings.insurance.uninsured.name]
    },
    yAxis: {
      title: {
        text: "Percent"
      }
    },
    series: [{
      data: getBarChartData(data, state, insurance),
      showInLegend: false
    }],
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 1)",
      formatter: function () {
        let insuranceString = _.findWhere(strings.insurance, {name: this.x}).have;
        return `${this.y}% of ${stateNames[state]} women ${insuranceString}`;
      }
    }
  };
};

let changeInsurance = (e) => {
  let value = e.currentTarget.dataset.insurance;
  Dispatcher.dispatch({
    actionType: "INSURANCE_TYPE_CHANGED",
    data: value
  });
};

export default class Insurance extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let chart;
    if (this.props.fetched) {
      chart = <Highcharts config={getChartConfig(this.props.data, this.props.activeState, this.props.activeInsurance)} />;
    }

    return (
      <div className="full-height">
        <div className="insurance-selector">
          Percentage of women aged <span className="nowrap">19–64</span>&nbsp;
          <InlineSelect value={this.props.activeInsurance}>
            <div>
              <li><a href="#" data-insurance="medicaid" onClick={changeInsurance}> {strings.insurance.medicaid.with}</a></li>
              <li><a href="#" data-insurance="employer" onClick={changeInsurance}> {strings.insurance.employer.with}</a></li>
              <li><a href="#" data-insurance="non-group" onClick={changeInsurance}> {strings.insurance["non-group"].with}</a></li>
              <li><a href="#" data-insurance="uninsured" onClick={changeInsurance}> {strings.insurance.uninsured.with}</a></li>
            </div>
          </InlineSelect>
        </div>

        <Legend minimumColor={this.props.colors.range(0)} maximumColor={this.props.colors.range(70)}/>

        <div className="state-information">
          {chart}
        </div>
      </div>
    );
  }
}

Insurance.propTypes = {
  fetched: React.PropTypes.bool.isRequired,
  data: React.PropTypes.array,
  activeState: React.PropTypes.string.isRequired,
  activeInsurance: React.PropTypes.string.isRequired,
  colors: React.PropTypes.object.isRequired
};
