import * as moment from 'moment';
import MomentTimeZone from 'moment-timezone';

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

export function drawPedometerChart(canvas: string, data: PedometerTimeSegment[] | PedometerDaySummary[], opt?: AutochekChartOption) {
  const PedoData = setPedometerData(data);
  console.log(PedoData[0]);
  console.log(PedoData[1]);
  console.log(PedoData[2]);
  PedoData.forEach((dataset, i) => {
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart';
    document.getElementById(canvas).appendChild(chartDiv);
    options.series[0].data = dataset;
    options.yAxis.title.text = optionData[i].yAxisTitle;
    options.title.text = optionData[i].title;
    Highcharts.chart(chartDiv, options);
  });
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

const optionData = [
  {title: '활동량', yAxisTitle: '걸음(보)'},
  {title: '소모 칼로리', yAxisTitle: '칼로리(kcal)'},
  {title: '이동거리', yAxisTitle: '거리(km)'}
];

const options: any = {
  title: {
    text: ''
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
  yAxis: {
    title: {
      text: ''
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
  },
  plotOptions: {
    series: {
      showInLegend: false,
      marker: {
        enabled: true
      },
    }
  },
  series: [{
    type: 'column',
    data: []
  }]
};

function setPedometerData(pedoData: PedometerTimeSegment[] | PedometerDaySummary[]) {
  const rtnData = [];
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

  rtnData.push(step);
  rtnData.push(cal);
  rtnData.push(dist);

  return rtnData;
}
