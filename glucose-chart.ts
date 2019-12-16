import * as Highcharts from 'highcharts';
import {GlucosemeterDaySummary, GlucosemeterMeasurement} from '@AutochekCommon/vanilla/objects/device-data-object';
import {AutochekChartOption, chartCommon, GlucoseOption} from './chart.option';

chartCommon(Highcharts);

export function drawGlucoseChart(canvas: string, data: GlucosemeterMeasurement[] | GlucosemeterDaySummary[], opt?: AutochekChartOption) {
  let chartOption = {};
  if (opt && opt.glucose) { // when opt is not given, even 'opt.glucose' will raise error
    const glucoseMinMaxOption = opt.glucose;
    chartOption = setGlucoseChartOption(data, glucoseMinMaxOption);
  } else {
    chartOption = setGlucoseChartOption(data);
  }
  if (opt && opt.start) {
    chartOption.xAxis.min = opt.start.getTime()
  }
  if (opt && opt.end) {
    chartOption.xAxis.max = opt.end.getTime()
  }
  Highcharts.chart(canvas, chartOption);
}

const options: any = {
  title: {
    text: '일평균 혈당 그래프'
  },
  credits: { // 밑 Highcharts 링크
    enabled: false
  },
  tooltip: {
    pointFormat: '<br>{series.name}: {point.y}mg/gL</br>',
    xDateFormat: '%b월 %e일',
    shared: true
  },
  time: {
    timezone: 'Asia/Seoul'
  },
  xAxis: {
    type: 'datetime',
    startOnTick: false,
    endOnTick: false,
    gridLineWidth: 1,
    title: {
      text: '시간',
      enabled: false
    }
  },
  yAxis: {
    title: {
      text: ''
    },
    plotBands: [{
      color: '#eeeeee',
      from: 0,
      to: 70
    }, {
      color: '#eeeeee',
      from: 180,
      to: 300
    }],
    startOnTick: false,
    endOnTick: false,
    labels: {
      format: '{value}',
      padding: 2,
    }
  },
  plotOptions: {
    series: {
      showInLegend: true,
      marker: {
        enabled: true
      },
      connectNulls: true
    }
  },
  series: []
};

function setGlucoseChartOption(glucoseData: GlucosemeterDaySummary[] | GlucosemeterMeasurement[], glucoseOption?: GlucoseOption) {
  if (glucoseData[0] instanceof GlucosemeterDaySummary) {
    options.series = [{
      name: '식사 전 일평균',
      type: 'line',
      color: '#dddddd',
      data: [],
      lineWidth: 2.3
    }, {
      name: '식사 후 일평균',
      type: 'line',
      color: '#888888',
      data: []
    }, {
      name: '취침 전',
      type: 'line',
      color: '#111111',
      data: [],
      lineWidth: 0.5
    }];

    options.xAxis.type = 'datetime';
    options.xAxis.categories = undefined;
    options.xAxis.max = undefined
    options.xAxis.min = undefined

    const oneDayBeforeMeal = [];
    const oneDayAfterMeal = [];
    const oneDayBeforeSleep = [];

    if (!glucoseOption) { // option is optional, but require on drawing. So make default value
      glucoseOption = {
        b_meal_min: 80,
        b_meal_max: 130,
        a_meal_min: 100,
        a_meal_max: 200,
        sleep_min: 90,
        sleep_max: 140
      };
    }

    glucoseData.forEach(gData => {
      const mDate = new Date(gData.date).getTime();
      const beforeMeal = getAverageGlucose(mDate, [gData.morningBeforeMeal, gData.afternoonBeforeMeal, gData.eveningBeforeMeal],
        glucoseOption.b_meal_min, glucoseOption.b_meal_max);
      const afterMeal = getAverageGlucose(mDate, [gData.morningAfterMeal, gData.afternoonAfterMeal, gData.eveningAfterMeal],
        glucoseOption.a_meal_min, glucoseOption.a_meal_max);
      const beforeSleep = getAverageGlucose(mDate, [gData.beforeSleep], glucoseOption.sleep_min, glucoseOption.sleep_max);
      oneDayBeforeMeal.push(beforeMeal);
      oneDayAfterMeal.push(afterMeal);
      oneDayBeforeSleep.push(beforeSleep);
    });

    options.series[0].data = oneDayBeforeMeal;
    options.series[1].data = oneDayAfterMeal;
    options.series[2].data = oneDayBeforeSleep;
  } else {
    options.xAxis.type = 'category'
    options.xAxis.categories = ['아침 식전', '아침 식후', '점심 식전', '점심 식후', '저녁 식전', '저녁 식후', '취침 전'];
    options.xAxis.min = 0;
    options.xAxis.max = 6;

    options.series = [{
      type: 'column',
      name: '혈당',
      data: []
    }];

    let temp = [];

    glucoseData.forEach(data => {
      let sTemp = '';
      if (data.timeofday === 'breakfast') {
        sTemp += '아침 '
      } else if (data.timeofday === 'lunch') {
        sTemp += '점심 '
      } else if (data.timeofday === 'dinner') {
        sTemp += '저녁 '
      } else if (data.timeofday === 'sleep') {
        sTemp = '취침 전'
      }

      if (data.condition === 'b_meal') {
        sTemp += '식전'
      } else {
        if (data.timeofday !== 'sleep')
          sTemp += '식후'
      }

      temp.push([sTemp, data.measurement])
    });

    options.series[0].data = temp
    // 하루엥 여러번 측정 할 가능성 농후하지 않나? 그럴 때 각 각 포지션에 대해서 그냥 기록만 해 주면 상관없는데
  }


  return options;
}

function getAverageGlucose(time, glucoseList, min?, max?) {
  let count = 0;
  let average = 0;
  const rtn = {
    x: time,
    y: 0,
    marker: {
      enabled: false,
      fillColor: undefined
    }
  };
  glucoseList.forEach(glucoseData => {
    if (glucoseData) {
      average += glucoseData;
      count++;
    }
  });
  rtn.y = parseFloat((average / count).toFixed(2));
  if (rtn.y > max) {
    rtn.marker.fillColor = 'red'; // Highcharts.getOptions.color[]
    rtn.marker.enabled = true;
  } else if (rtn.y < min) {
    rtn.marker.fillColor = 'blue';
    rtn.marker.enabled = true;
  }
  return rtn;
}
