import { PedometerSleepSegment, PedometerSleepSummary } from 'autochek-base/objects/device-data-object';
import { AutochekChartOption, chartCommon } from './chart.option';
import * as Highcharts from 'highcharts';

chartCommon(Highcharts);

export function drawSleepChart(canvas: string, data: PedometerSleepSegment[] | PedometerSleepSummary[], opt?: AutochekChartOption) {
  if (data.length > 0) {
    setSleepSegmentOption(data).then(
      (options) => {
        Highcharts.chart(canvas, options);
      }
    );
  } else {
    Highcharts.chart(canvas, {});
  }
}

async function setSleepSegmentOption(sleepData: PedometerSleepSegment[] | PedometerSleepSummary[]) {
  const option: any = {
    chart: {
      type: 'columnrange',
      inverted: true
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
      visible: false
    },
    plotOptions: {
      xrange: {
        grouping: false,
        borderRadius: 0,
        pointPadding: 0,
        groupPadding: 0,
        colorByPoint: false,
        animation: false,
        marker: {
          enabled: false
        },
        enableMouseTracking: false,
        stickyTracking: false,
        shadow: false,
        dataLabels: {
          style: {
            textShadow: false
          }
        }
      },
      column: {
        stacking: 'normal',
        grouping: true,
        pointWidth: null,
        pointPadding: 0.1,
        groupPadding: 0.3,
        animation: false,
        marker: {
          enabled: false
        },
        enableMouseTracking: false,
        stickyTracking: false,
        shadow: false,
        dataLabels: {
          style: {
            textShadow: false
          }
        }
      },
      columnrange: {
        grouping: false,
        pointWidth: null,
        pointPadding: 0,
        groupPadding: 0,
        marker: {
          enabled: true
        }
      },
      series: {
        marker: {
          enabled: false
        }
      }
    },
    series: []
  };

  const notInSleep = [];
  const shallowSleep = [];
  const deepSleep = [];

  if (sleepData[0] instanceof PedometerSleepSegment) {
    option.xAxis = {
      categories: ['수면패턴'],
      labels: {
        enabled: false
      }
    };
    option.yAxis = {
      type: 'datetime',
      startOnTick: false,
      endOnTick: false,
      title: undefined
    };
    option.series = [{
      name: '안 잠',
      stack: 'tasks',
      data: [],
      color: '#e5e9fd',
    },
      {
        name: '얕은잠',
        stack: 'tasks',
        data: [],
        color: '#bcc5fa',
      },
      {
        name: '깊은잠',
        stack: 'tasks',
        data: [],
        color: '#8191f5'
      }];
    option.tooltip = {
      enabled: false
      // formatter() {
      //   return '<b>' + Highcharts.dateFormat('%H:%M', this.point.high) + '-' + '</b> <b>' + Highcharts.dateFormat('%H:%M', this.point.low) + '</b>';
      // }
    };

    let flag: number = (sleepData[0] as PedometerSleepSegment).sleepIndex;
    let startTime: number = new Date(sleepData[0].date).getTime();
    let endTime: number;

    for (let i = 1; i < sleepData.length; i++) { // Data is of type PedometerSleepSegment
      const sData: PedometerSleepSegment = sleepData[i] as PedometerSleepSegment;
      const bool = sData.sleepIndex !== flag;
      if (i !== (sleepData.length - 1)) {
        if (bool) {
          endTime = new Date(sData.date).getTime();
          makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);

          startTime = new Date(sData.date).getTime();
          flag = sData.sleepIndex;
        }
      } else {
        if (!bool) {
          endTime = new Date(sData.date).getTime() + 300 * 1000;
          makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
        } else {
          endTime = new Date(sData.date).getTime();
          makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
          startTime = endTime;
          endTime = new Date(sData.date).getTime() + 300 * 1000;
          flag = sData.sleepIndex;
          makeSleepData(flag, startTime, endTime, notInSleep, shallowSleep, deepSleep);
        }
      }
    }

    option.series[0].data = notInSleep;
    option.series[1].data = shallowSleep;
    option.series[2].data = deepSleep;
  } else { // Data is of type PedometerSleepSummary
    option.chart.type = 'column';
    option.xAxis = {
      type: 'datetime',
      minTickInterval: 24 * 3600 * 1000,
      units: [['day', [1]]],
      minPadding: 0.1,
      maxPadding: 0.1
    };
    option.yAxis = {
      visible: true,
      title: '',
      labels: {}
    },
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
      deepSleep.push([thatDay, data.deepSleep]);
      shallowSleep.push([thatDay, data.lightSleep]);
    });

    option.series[0].data = shallowSleep;
    option.series[1].data = deepSleep;
  }
  return option;
}

function makeSleepData(index: number, startTime: number, thisTime: number, notInSleep, shallowSleep, deepSleep) {
  switch (index) {
    case 3:
      notInSleep.push({
        low: startTime,
        high: thisTime,
        x: 0
      });
      break;
    case 2:
      shallowSleep.push({
        low: startTime,
        high: thisTime,
        x: 0
      });
      break;
    case 1:
      deepSleep.push({
        low: startTime,
        high: thisTime,
        x: 0
      });
      break;
  }
}
