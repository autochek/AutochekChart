
import * as moment from 'moment'
import MomentTimeZone from "moment-timezone";

window['moment'] = moment
MomentTimeZone();

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import { BloodpressureMeasurement } from '@AutochekCommon/vanilla/objects/device-data-object';
import { AutochekChartOption } from './chart.option';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);



export function drawBloodpressurePeriodChart(canvas: string, data:BloodpressureMeasurement[], opt?:AutochekChartOption) {
  const bpData = data; 
  const option = setBloodPressureOption(bpData, opt);
  Highcharts.chart(canvas, option);
}
  
  

function setBloodPressureOption(bpData: any, opt:AutochekChartOption) {
  const options: any = {
    title: {
    text: 'Blood Pressure chart'
    },
    credits: {
    enabled: false
    },
    tooltip: {
    shared: true
    },
    time: {
    timezone: 'Asia/Seoul'
    },
    xAxis: {
    type: 'datetime',
    gridLineWidth: 1,
    startOnTick: true,
    endOnTick: true,
    title: {
        text: '시간'
    }
    },
    yAxis: [{
    labels: {
        format: '{value}mmHg',
        style: {
        color: Highcharts.getOptions().colors[3]
        }
    }
    }, {
    gridLineWidth: 1,
    opposite: true,
    title: {
        text: '맥박',
    },
    labels: {
        format: '{value}회/분',
        align: 'left',
    }
    }],
    plotOptions: {
    series: {
        marker: {
        enabled: true
        },
        pointWidth: 30
    }
    },
    series: [{
    name: '최대/최소 혈압',
    type: 'arearange',
    lineWidth: 1,
    fillOpacity: 0.3,
    zIndex: 0,
    color: Highcharts.getOptions().colors[3],
    data: []
    }, {
    name: '평균 혈압',
    zIndex: 1,
    data: [],
    }, {
    name: '심박수',
    type: 'column',
    yAxis: 1,
    zIndex: 0,
    opacity: 0.8,
    data: []
    }]
};

const updatedSystolic = [];
const updatedAverage = [];
const updatedRate = [];

bpData.forEach(data => {
    const time = new Date(data.date).getTime();
    const tempSystolic = [
    time, data.diastolic, data.systolic
    ];
    const tempAverage = [
    time, data.mean
    ];
    const tempRate = [
    time, data.rate
    ];
    updatedSystolic.push(tempSystolic);
    updatedAverage.push(tempAverage);
    updatedRate.push(tempRate);
});

options.series[0].data = updatedSystolic;
options.series[1].data = updatedAverage;
    options.series[2].data = updatedRate;
    
    if (opt.start) {
    options.xAxis.min = opt.start.getTime();
}
if (opt.end) {
    options.xAxis.max = opt.end.getTime();
}

return options;
}