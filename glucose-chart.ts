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
    pointFormat: '<br>{series.name}: {point.y}mg/dl </br>',
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
  series: [{
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
  }]
};

function setGlucoseChartOption(glucoseData: GlucosemeterDaySummary[] | GlucosemeterMeasurement[], glucoseOption?: GlucoseOption) {
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
