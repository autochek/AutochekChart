import * as moment from 'moment'
import MomentTimeZone from "moment-timezone";

window['moment'] = moment;
MomentTimeZone();

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import {PedometerDaySummary, PedometerTimeSegment} from '@AutochekCommon/vanilla/objects/device-data-object';
import {AutochekChartOption} from './chart.option';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

// export interface PedometerTimeSegment{
//   date:Date,
//   duration:number,
//   step:number,
//   cal:number,
//   dist:number
// }


export function drawPedometerChart(canvas: string, data: PedometerTimeSegment[] | PedometerDaySummary[], opt?: AutochekChartOption) {
  const option = setPedometerOption(data);
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

// data type 두가지인데 어떻게 되는지.
function setPedometerOption(pedoData: PedometerTimeSegment[] | PedometerDaySummary[]) {
  const options: any = {
    title: {
      text: '활동량 기록'
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
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%b월 %e일',
        week: '%b월 %e일',
        month: '%y년 %b월'
      }
    },
    yAxis: [{
      title: {
        text: '걸음',
        rotation: '270'
      },
      startOnTick: false,
      endOnTick: false,
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
        text: '이동거리(km)',
        enabled: true,
        rotation: 270
      },
      labels: {
        format: '{value}',
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
      name: '걸음',
      lineWidth: 1,
      color: Highcharts.getOptions().colors[3],
      data: []
    }, {
      name: '소모 칼로리',
      data: [],
    }, {
      name: '이동거리',
      type: 'column',
      yAxis: 1,
      data: []
    }]
  };

  //
  // export interface PedometerDaySummary{
  //   date:Date,
  //   step:number,
  //   cal:number,
  //   dist:number
  // }

  const step = [];
  const cal = [];
  const dist = [];


  pedoData.forEach((data) => {
    const timeAndDate = new Date(data.date).getTime();
    const tempStep = [
      timeAndDate, data.step
    ];
    const tempCal = [
      timeAndDate, data.cal
    ];
    const tempDist = [
      timeAndDate, data.dist
    ];
    step.push(tempStep);
    cal.push(tempCal);
    dist.push(tempDist);
  });

  options.series[0].data = step;
  options.series[1].data = cal;
  options.series[2].data = dist;

  return options;
}
