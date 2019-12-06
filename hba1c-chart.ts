import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import {HbA1C} from '@AutochekCommon/vanilla/objects/device-data-object';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

export function drawHbA1CChart(canvas: string, data: HbA1C[]) {
  const option = setHbA1COption(data);
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

function setHbA1COption(hbA1CData: HbA1C[]) {
  const options: any = {
    title: {
      text: '당화 혈색소 차트'
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
        enabled: false
      },
      labels: {
        format: '{value}',
      }
    },
    plotOptions: {
      series: {
        marker: {
          enabled: true
        },
      }
    },
    series: [{
      name: '당화 혈색소',
      type: 'line',
      color: Highcharts.getOptions().colors[3],
      data: []
    }]
  };
  hbA1CData.forEach(data => {
    const time = data.date.getTime();
    options.series[0].data.push([time, data.measurement]);
  });

  return options;
}
