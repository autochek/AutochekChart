import * as moment from 'moment'
import MomentTimeZone from "moment-timezone";
import {PedometerHeartrateSegment} from '@AutochekCommon/vanilla/objects/device-data-object';

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';

window['moment'] = moment;
MomentTimeZone();

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

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

export async function drawHeartRateChart(canvas: string, data: PedometerHeartrateSegment[]) {
  const option = await setHeartRateChartOption(data);
  await Highcharts.chart(canvas, option);
}

async function setHeartRateChartOption(data: PedometerHeartrateSegment[]) {
  const option: any = {
    title: {
      text: 'Heart Rate Chart'
    },
    time: {
      timezone: 'Asia/Seoul'
    },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 1,
      dateTimeLabelFormats: {
        minute: '%H시:%M분',
        hour: '%H시:%M분',
        day: '%b월 %e일',
        week: '%b월 %e일',
        month: '%y년 %b월'
      }
    },
    yAxis: {
      labels: {
        format: '{value}bpm',
      }
    },
    plotOptions: {},
    series: [{
      name: '심박수',
      type: 'spline',
      color: Highcharts.getOptions().colors[0],
      data: []
    }]
  };

  heartRateData.forEach(data => {
    const time = new Date(data.date).getTime();
    options.series[0].data.push([time, data.rate]);
  });
  // set xAxis min: first input data start of day  max: last input data end of day
  const startOfDay = moment(heartRateData[0].date).startOf('day').toDate()
  const endOfDay = moment(heartRateData[heartRateData.length - 1].date).endOf('day').toDate()
  options.xAxis.min = startOfDay.getTime();
  options.xAxis.max = endOfDay.getTime();

  return options;
}
