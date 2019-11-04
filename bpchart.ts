import * as moment from 'moment'
import MomentTimeZone from "moment-timezone";

window['moment'] = moment;
MomentTimeZone();

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import {BloodpressureMeasurement} from '@AutochekCommon/vanilla/objects/device-data-object';
import {AutochekChartOption} from './chart.option';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

export function drawBloodpressurePeriodChart(canvas: string, data: BloodpressureMeasurement[], opt?: AutochekChartOption) {
  const option = setBloodPressureOption(data, opt);
  Highcharts.chart(canvas, option);
}

Highcharts.setOptions({
  lang: {
    months: [
      '1', '2', '3', '4',
      '5', '6', '7', '8',
      '9', '10', '11', '12'
    ],
    weekdays: [
      '일', '월', '화', '수', '목', '금', '토'
    ],
    shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  }
});

function setBloodPressureOption(bpData: BloodpressureMeasurement[], opt?: AutochekChartOption) {
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
        text: '시간',
        enabled: false
      },
      dateTimeLabelFormats: {
        minute: '%H시:%M분',
        hour: '%H시:%M분',
        day: '%b.%e',
        week: '%b.%e',
        month: '%y년 %b월'
      }
    },
    yAxis: [{
      title: {
        text: '혈압',
        enabled: false
      },
      min: 0,
      max: 160,
      labels: {
        format: '{value}',
        padding: 2,
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      }
    }, {
      gridLineWidth: 1,
      opposite: true,
      title: {
        text: '맥박',
        enabled: false
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
      opacity: 0.6,
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
  if (opt.max) {
    options.yAxis.max = opt.max
  }

  return options;
}
