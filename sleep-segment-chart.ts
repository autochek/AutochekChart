import {PedometerSleepSegment, PedometerSleepSummary} from '@AutochekCommon/vanilla/objects/device-data-object';
import {AutochekChartOption, chartCommon} from './chart.option';
import * as Highcharts from 'highcharts';
import Xrange from 'highcharts/modules/xrange';

Xrange(Highcharts);
chartCommon(Highcharts);

export function drawSleepChart(canvas: string, data: PedometerSleepSegment[] | PedometerSleepSummary[], opt?: AutochekChartOption) {
  setSleepSegmentOption(data).then(
    (options) => {
      Highcharts.chart(canvas, options);
    }
  );
}

async function setSleepSegmentOption(sleepData: PedometerSleepSegment[] | PedometerSleepSummary[]) {
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
      column: {
        stacking: 'normal'
      },
      series: {
        marker: {
          enabled: true
        }
      }
    },
    series: []
  };

  const notInSleep = [];
  const shallowSleep = [];
  const deepSleep = [];

  if (sleepData[0] instanceof PedometerSleepSegment) {
    option.series = [{
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
      }];

    let flag: number = (sleepData[0] as PedometerSleepSegment).sleepIndex;
    let startTime: number = new Date(sleepData[0].date).getTime();
    let endTime: number;

    for (let i = 1; i < sleepData.length; i++) { // Data is of type PedometerSleepSegment
      const sData: PedometerSleepSegment = sleepData[i] as PedometerSleepSegment;
      const bool = sData.sleepIndex !== flag;
      if (i !== (sleepData.length - 1)) {
        if (bool) {
          endTime = new Date(sData.date).getTime();
          await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);

          startTime = new Date(sData.date).getTime();
          flag = sData.sleepIndex;
        }
      } else {
        if (!bool) {
          endTime = new Date(sData.date).getTime() + 300 * 1000;
          await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
        } else {
          endTime = new Date(sData.date).getTime();
          await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
          startTime = endTime;
          endTime = new Date(sData.date).getTime() + 300 * 1000;
          flag = sData.sleepIndex;
          await makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
        }
      }
    }

    option.series[0].data = notInSleep;
    option.series[1].data = shallowSleep;
    option.series[2].data = deepSleep;
  } else { // Data is of type PedometerSleepSummary
    option.series = [
      {
        name: '얕은잠',
        data: [],
        color: '#bcc5fa',
      },
      {
        name: '깊은잠',
        data: [],
        color: '#8191f5'
      }];
    sleepData.forEach(data => {
      const thatDay = new Date(data.date).getTime();
      deepSleep.push(thatDay, data.deepSleep);
      shallowSleep.push(thatDay, data.lightSleep);
    });

    option.series[0].data = shallowSleep;
    option.series[1].data = deepSleep;

    option.chart.type = 'column';
  }

  return option;
}

async function makeSleepData(index: number, startTime: number, thisTime: number, notInSleep, shallowSleep, deepSleep) {
  switch (index) {
    case 3:
      notInSleep.push({
        x: startTime,
        x2: thisTime,
        y: 0
      });
      break;
    case 2:
      shallowSleep.push({
        x: startTime,
        x2: thisTime,
        y: 0
      });
      break;
    case 1:
      deepSleep.push({
        x: startTime,
        x2: thisTime,
        y: 0
      });
      break;
  }
}
