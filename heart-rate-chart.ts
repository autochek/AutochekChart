import * as moment from 'moment';
import {PedometerHeartrateSegment} from 'autochek-base/objects/device-data-object';
import * as Highcharts from 'highcharts';
import {chartCommon} from '@AutochekChart/chart.option';

chartCommon(Highcharts);

export async function drawHeartRateChart(canvas: string, data: PedometerHeartrateSegment[]) {
  const option = await setHeartRateChartOption(data);
  await Highcharts.chart(canvas, option);
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
