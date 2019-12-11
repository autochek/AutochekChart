import * as Highcharts from 'highcharts';

export interface AutochekChartOption {
  start?: Date;
  end?: Date;
  min?: number;
  max?: number;

  bodyScale?: string;
  glucose?: GlucoseOption;
}

export interface GlucoseOption {
  b_meal_min?: number;
  b_meal_max?: number;
  a_meal_min?: number;
  a_meal_max?: number;
  sleep_min?: number;
  sleep_max?: number;
}

export function chartCommon() {
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
      shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      thousandsSep: ','
    },
    xAxis: {
      dateTimeLabelFormats: {
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%b월 %e일',
        week: '%b월 %e일',
        month: '%y년 %b월'
      }
    }
  });
}
