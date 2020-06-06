import * as moment from 'moment';
import { PedometerHeartrateSegment, PedometerTimeSegment } from 'autochek-base/objects/device-data-object';
import * as Highcharts from 'highcharts';
import { chartCommon } from '@AutochekChart/chart.option';

chartCommon(Highcharts);

export async function nonactiveChart(canvas: string, data: any[]) {
  const option = await nonactiveChartOption(data);
  await Highcharts.chart(canvas, option);
}

async function nonactiveChartOption(rdata: any[]) {
  const options: any = {
    title: {
      text: '비활동시간'
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
        enableMouseTracking: false,
        stickyTracking: false,
        shadow: false,
        dataLabels: {
          style: {
            textShadow: false
          }
        }
      }
    },
    series: [{
      name: '비활동',
      type: 'bar',
      color: Highcharts.getOptions().colors[0],
      data: []
    }]
  };

  rdata.forEach(data => {
    const time = new Date(data.date).getTime();
    options.series[0].data.push([time, data.value]);
  });
  // set xAxis min: first input data start of day  max: last input data end of day
  const startOfDay = moment(rdata[0].date).startOf('day').toDate();
  const endOfDay = moment(rdata[rdata.length - 1].date).endOf('day').toDate();
  options.xAxis.min = startOfDay.getTime();
  options.xAxis.max = endOfDay.getTime();

  return options;
}
