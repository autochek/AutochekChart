import * as moment from 'moment'
import MomentTimeZone from "moment-timezone";

window['moment'] = moment;
MomentTimeZone();


import {PedometerSleepSegment} from '@AutochekCommon/vanilla/objects/device-data-object';
import {AutochekChartOption} from './chart.option';

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import Xrange from 'highcharts/modules/xrange';

Xrange(Highcharts);
Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

export function drawSleepChart(canvas: string, data: PedometerSleepSegment[], opt?: AutochekChartOption) {
  setSleepSegmentOption(data).then(
    (options) => {
      Highcharts.chart(canvas, options);
    }
  )
}

async function setSleepSegmentOption(sleepData: PedometerSleepSegment[]) {
  const option: any = {
    chart: {
      type: 'xrange'
    },
    title: {
      text: '수면 패턴 기록'
    },
    time: {
      timezone: 'Asia/Seoul'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%b월 %e일',
        week: '%b월 %e일',
        month: '%y년 %b월'
      }
    },
    yAxis: {
      categories: ['수면패턴'],
      reversed: true,
      visible: false
    },
    plotOptions: {
      xrange: {
        grouping: false,
        borderRadius: 0,
        pointPadding: 0,
        groupPadding: 0,
        colorByPoint: false,
        dataLabels: {
          enabled: true
        }
      },
      series: {
        marker: {
          enabled: true
        }
      }
    },
    series: [
      {
        name: '안 잠',
        data: [],
        color: '#e5e9fd',
      },
      {
        name: '얕은잠',
        data: [],
        color: '#bcc5fa',
      },
      {
        name: '깊은잠',
        data: [],
        color: '#8191f5'
      }]
  };

  let flag: number = sleepData[0].sleepIndex;
  let startTime: number = new Date(sleepData[0].date).getTime();
  let endTime: number;

  const notInSleep = [];
  const shallowSleep = [];
  const deepSleep = [];

  for (let i = 1; i < sleepData.length; i++) {
    const bool = sleepData[i].sleepIndex !== flag;
    if (i !== (sleepData.length - 1)) {
      if (bool) {
        endTime = new Date(sleepData[i].date).getTime();
        await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);

        startTime = new Date(sleepData[i].date).getTime();
        flag = sleepData[i].sleepIndex;
      }
    } else {
      if (!bool) {
        endTime = new Date(sleepData[i].date).getTime() + 300 * 1000;
        await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
      } else {
        endTime = new Date(sleepData[i].date).getTime();
        await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
        startTime = endTime;
        endTime = new Date(sleepData[i].date).getTime() + 300 * 1000;
        flag = sleepData[i].sleepIndex;
        await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
      }
    }
  }

  option.series[0].data = notInSleep;
  option.series[1].data = shallowSleep;
  option.series[2].data = deepSleep;

  return option;
}

async function makeSleepData(index: number, startTime: number, endTime: number, notInSleep, shallowSleep, deepSleep) {
  switch (index) {
    case 3:
      notInSleep.push({
        x: startTime,
        x2: endTime,
        y: 0
      });
      break;
    case 2:
      shallowSleep.push({
        x: startTime,
        x2: endTime,
        y: 0
      });
      break;
    case 1:
      deepSleep.push({
        x: startTime,
        x2: endTime,
        y: 0
      });
      break;
  }
}
