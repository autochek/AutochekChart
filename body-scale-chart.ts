import * as Highcharts from 'highcharts';
import {AutochekChartOption, chartCommon} from './chart.option';
import {BodyscaleMeasurement} from '@AutochekCommon/vanilla/objects/device-data-object';

chartCommon(Highcharts);

export function drawBodyScaleChart(canvas: string, data: BodyscaleMeasurement[], opt?: AutochekChartOption) {
  const option = setBodyScaleOption(data, opt);
  Highcharts.chart(canvas, option);
}

const options: any = {
  title: {
    text: '체성분 차트'
  },
  chart: {
    type: 'column'
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
      text: '날짜',
      enabled: false
    }
  },
  yAxis: [{
    title: {
      enabled: false
    },
    labels: {
      format: '{value}',
      padding: 2
    }
  }],
  plotOptions: {
    series: {
      marker: {
        enabled: true,
        animation: false
      },
    },
    column: {
      grouping: false,
      stacking: 'normal'
    }
  },
  series: []
};

function setBodyScaleOption(bodyScaleData: BodyscaleMeasurement[], opt?: AutochekChartOption) {
  const tempArray = [];
  options.chart.type = 'column';
  const weight = [];
  const water = [];
  const muscle = [];
  const fat = [];

  const selection = opt.bodyScale;
  if (opt && opt.start) {
    options.xAxis.min = opt.start.getTime();
  }
  if (opt && opt.end) {
    options.xAxis.max = opt.end.getTime();
  }

  switch (selection) {
    case 'weight':
      options.series = [{
        name: '몸무게',
        opacity: 0.8,
        groupPadding: 0,
        stack: 'total',
        data: []
      }, {
        name: '수분',
        data: [],
        stack: 'portion'
      }, {
        name: '근육량',
        data: [],
        stack: 'portion'
      }, {
        name: '지방',
        data: [],
        stack: 'portion'
      }];

      bodyScaleData.forEach(data => {
        const dateAndTime = data.date.getTime();

        const tempFat = parseFloat((data.weight * data.fat / 100).toFixed(2));
        const tempWater = parseFloat((data.weight * data.water / 100).toFixed(2));
        const tempMuscle = parseFloat((data.weight - tempFat - tempWater).toFixed(2));

        weight.push([dateAndTime, data.weight]);
        water.push([dateAndTime, tempWater]);
        muscle.push([dateAndTime, tempMuscle]);
        fat.push([dateAndTime, tempFat]);
      });

      options.series[0].data = weight;
      options.series[1].data = water;
      options.series[2].data = muscle;
      options.series[3].data = fat;
      break;

    default:
      options.series = [{
        name: '',
        data: []
      }];
      let multiplier = 1;
      if (opt.bodyScale === 'bmr') {
        options.series[0].name = '기초대사량';
        options.title.text = '기초대사량';
      } else if (opt.bodyScale === 'visceral') {
        options.chart.type = 'line';
        options.series[0].name = '복부지방량';
        options.title.text = '복부지방량';
        multiplier = 0.1;
      } else if (opt.bodyScale === 'bone') {
        options.series[0].name = '뼈/무기질';
        options.title.text = '뼈/무기질';
      } else if (opt.bodyScale === 'bmi') {
        options.chart.type = 'line';
        options.series[0].name = '체질량 지수';
        options.title.text = '체질량 지수';
      }
      bodyScaleData.forEach(data => {
        const dateAndTime = data.date.getTime();
        tempArray.push([dateAndTime, data[`${opt.bodyScale}`] * multiplier]);
      });
      options.series[0].data = tempArray;
      break;
  }
  return options;
}
