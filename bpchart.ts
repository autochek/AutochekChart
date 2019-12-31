import * as Highcharts from 'highcharts';
import {BloodpressureMeasurement} from 'autochek-base/objects/device-data-object';
import {AutochekChartOption, chartCommon} from './chart.option';

chartCommon(Highcharts);

export function drawBloodpressurePeriodChart(canvas: string, data: BloodpressureMeasurement[], opt?: AutochekChartOption) {
  const option = setBloodPressureOption(data, opt);
  Highcharts.chart(canvas, option);
}

function setBloodPressureOption(bpData: BloodpressureMeasurement[], opt?: AutochekChartOption) {
  const options: any = {
    title: {
      text: '혈압 차트'
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
      }
    },
    yAxis: [{
      title: {
        text: '혈압',
        enabled: false
      },
      min: 60,
      max: 220,
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
        text: '맥박',
        enabled: false
      },
      labels: {
        format: '{value}회/분',
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
      name: '최대/최소 혈압',
      type: 'arearange',
      lineWidth: 1,
      fillOpacity: 0.3,
      zIndex: 0,
      color: Highcharts.getOptions().colors[3],
      data: []
    }, {
      name: '평균 혈압',
      zIndex: 1,
      data: [],
    }, {
      name: '심박수',
      type: 'column',
      yAxis: 1,
      zIndex: 0,
      opacity: 0.6,
      data: []
    }]
  };

  const updatedSystolic = [];
  const updatedAverage = [];
  const updatedRate = [];

  bpData.forEach(data => {
    const thisTime = new Date(data.date).getTime();
    const tempSystolic = [
      thisTime, data.diastolic, data.systolic
    ];
    const tempAverage = [
      thisTime, data.mean
    ];
    const tempRate = [
      thisTime, data.rate
    ];
    updatedSystolic.push(tempSystolic);
    updatedAverage.push(tempAverage);
    updatedRate.push(tempRate);
  });

  options.series[0].data = updatedSystolic;
  options.series[1].data = updatedAverage;
  options.series[2].data = updatedRate;

  if (opt.start) {
    options.xAxis.min = opt.start.getTime();
  }
  if (opt.end) {
    options.xAxis.max = opt.end.getTime();
  }
  if (opt.max) {
    options.yAxis.max = opt.max;
  }

  return options;
}
