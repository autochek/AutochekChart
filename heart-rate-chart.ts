import * as moment from 'moment';
import {PedometerHeartrateSegment} from '@AutochekCommon/vanilla/objects/device-data-object';
import * as Highcharts from 'highcharts';
import {chartCommon} from '@AutochekChart/chart.option';

chartCommon(Highcharts);

export async function drawHeartRateChart(canvas: string, data: PedometerHeartrateSegment[]) {
  const option = await setHeartRateChartOption(data);
  await Highcharts.chart(canvas, option);
}

export function drawSecondHeartRateChart(canvas: string, data: PedometerHeartrateSegment[]) {
  const option = setOption(data);
  Highcharts.chart(canvas, option);
}

async function setHeartRateChartOption(heartRateData: PedometerHeartrateSegment[]) {
  const options: any = {
    title: {
      text: '심박수 차트 (횟수/1m)'
    },
    time: {
      timezone: 'Asia/Seoul'
    },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 1,
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        format: '{value}',
      }
    },
    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: false
        },
        enableMouseTracking: false
      }
    },
    series: [{
      name: '심박수',
      type: 'line',
      color: Highcharts.getOptions().colors[0],
      data: []
    }]
  };

  heartRateData.forEach(data => {
    if (data.rate > 10) {
      const time = new Date(data.date).getTime();
      options.series[0].data.push([time, data.rate]);
    }
  });
  // set xAxis min: first input data start of day  max: last input data end of day
  const startOfDay = moment(heartRateData[0].date).startOf('day').toDate();
  const endOfDay = moment(heartRateData[heartRateData.length - 1].date).endOf('day').toDate();
  options.xAxis.min = startOfDay.getTime();
  options.xAxis.max = endOfDay.getTime();

  return options;
}

function setOption(heartRateData: PedometerHeartrateSegment[]) {
  const options: any = {
    title: {
      text: '심박수 차트 (횟수/1m)'
    },
    chart: {
      type: 'columnrange'
    },
    time: {
      timezone: 'Asia/Seoul'
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        format: '{value}',
      }
    },
    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: false
        },
        groupPadding: 0,
        pointPadding: 0,
        minPointLength: 6,
        borderRadius: 2,
        enableMouseTracking: true
      }
    },
    series: [{
      name: '심박수',
      color: Highcharts.getOptions().colors[0],
      data: []
    }]
  };


  options.chart.type = 'columnrange';
  const startMinute = Math.floor(moment(heartRateData[0].date).minute() / 15) * 15;
  let startTime = moment(heartRateData[0].date).startOf('hour').minute(startMinute).toDate().getTime();
  let endTime = moment(heartRateData[0].date).startOf('hour').minute(startMinute + 15).toDate().getTime();
  let minHeartRate = 0;
  let maxHeartRate = 0;
  const rtn = [];
  for (let i = 0; i < heartRateData.length; i++) {
    const time = new Date(heartRateData[i].date).getTime();
    if (time <= endTime) {
      if (heartRateData[i].rate !== 0) {
        minHeartRate = minHeartRate === 0 ? heartRateData[i].rate : min(minHeartRate, heartRateData[i].rate);
        maxHeartRate = maxHeartRate === 0 ? heartRateData[i].rate : max(maxHeartRate, heartRateData[i].rate);
      }
    } else {
      if (minHeartRate !== 0) {
        rtn.push([startTime, minHeartRate, maxHeartRate]);
      }

      minHeartRate = heartRateData[i].rate;
      maxHeartRate = heartRateData[i].rate;

      startTime = Math.floor(time / (15 * 60 * 1000)) * (15 * 60 * 1000);
      endTime = startTime + 15 * 60 * 1000;
    }
    if (i === heartRateData.length - 1) {
      if (minHeartRate !== 0) {
        rtn.push([startTime, minHeartRate, maxHeartRate]);
      }
    }
  }
  options.series[0].data = rtn;
  return options;
}

function min(a: number, b: number) {
  if (a >= b) {
    return b;
  }
  return a;
}

function max(a: number, b: number) {
  if (a >= b) {
    return a;
  }
  return b;
}
