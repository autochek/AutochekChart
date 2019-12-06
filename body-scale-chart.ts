import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import {AutochekChartOption} from './chart.option';
import {BodyscaleMeasurement} from '@AutochekCommon/vanilla/objects/device-data-object';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

export function drawBodyScaleChart(canvas: string, data: BodyscaleMeasurement[], opt?: AutochekChartOption) {
  const option = setBodyScaleOption(data, opt);
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

const options: any = {
  title: {
    text: '체성분 차트'
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
    },
    dateTimeLabelFormats: {
      minute: '%H:%M',
      hour: '%H:%M',
      day: '%b월 %e일',
      week: '%b월 %e일',
      month: '%y년 %b월'
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
        enabled: true
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

        const tempMuscle = parseFloat((data.weight * data.muscle).toFixed(2));
        const tempFat = parseFloat((data.weight * data.fat).toFixed(2));
        const tempWater = parseFloat((data.weight - tempMuscle - tempFat).toFixed(2));

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
      } else if (opt.bodyScale === 'visceral') {
        options.chart.type = 'line';
        options.series[0].name = '복부지방량';
        multiplier = 0.1;
      } else if (opt.bodyScale === 'bone') {
        options.series[0].name = '뼈/무기질';
        multiplier = 0.1;
      } else if (opt.bodyScale === 'bmi') {
        options.chart.type = 'line';
        options.series[0].name = '체질량 지수';
      }
      bodyScaleData.forEach(data => {
        const dateAndTime = data.date.getTime();
        tempArray.push([dateAndTime, data[`${opt.bodyScale}`] * multiplier]);
      });
      // bmr: number,  //1487 -> 1487kcal 기초 대사량
      //   visceral: number, // 47 -> 4.7% 복부지방
      // bone: number, // 28 -> 2.8kg 뼈/무기질
      // bmi: number 체질량 지수
      options.series[0].data = tempArray;
      break;
  }


  return options;
}
