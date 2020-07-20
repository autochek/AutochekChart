import * as Highcharts from 'highcharts';
import {GlucosemeterDaySummary, GlucosemeterMeasurement} from 'autochek-base/objects/device-data-object';
import {AutochekChartOption, chartCommon} from './chart.option';
import * as moment from 'moment';

chartCommon(Highcharts);

export function drawGlucoseChart(canvas: string, data: GlucosemeterMeasurement[] | GlucosemeterDaySummary[], opt?: AutochekChartOption) {
	let chartOption = {};
	let reforgedData: GlucosemeterDaySummary[] | GlucosemeterMeasurement[];

	if (data.length > 0) {
		// DaySummary 없다고 생각해서 만든 부분. 리팩토링 필요
		// if (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime() > 86400000) {
		//   let start: number = 0;
		//   let end: number = 1;
		//   let rtn: GlucosemeterDaySummary[] = [];
		//   for (let i = 1; i < data.length; i++) {
		//     if (new Date(data[start].date).getTime() === new Date(data[i].date).getTime()) {
		//       end++;
		//     } else {
		//       rtn.push(GlucosemeterDaySummary.packFromGlucosemeterMeasurements(data.slice(start, end)));
		//       start = i;
		//       end = i + 1;
		//     }
		//     if (i == data.length - 1) {
		//       rtn.push(GlucosemeterDaySummary.packFromGlucosemeterMeasurements(data.slice(start, end)));
		//     }
		//   }
		//   reforgedData = rtn;
		// } else {
		//   reforgedData = data;
		// }

		reforgedData = data;


		if (opt) { // when opt is not given, even 'opt.glucose' will raise error
			chartOption = setGlucoseChartOption(reforgedData, opt);
		} else {
			chartOption = setGlucoseChartOption(reforgedData);
		}
		Highcharts.chart(canvas, chartOption);
	} else {
		Highcharts.chart(canvas, {});
	}
}

const options: any = {
	title: {
		text: ''
	},
	credits: { // 밑 Highcharts 링크
		enabled: false
	},
	tooltip: {
		pointFormat: '<br>{series.name}: {point.y}mg/gL</br>',
		xDateFormat: '%b월 %e일',
		shared: true,
		crosshairs: true
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
			stickyTracking: false,
			showInLegend: true,
			marker: {
				enabled: true
			},
			connectNulls: true
		},
		scatter: {
			marker: {
				states: {
					hover: {
						enabled: true,
						lineColor: '#000000'
					}
				}
			}
		}
	},
	series: []
};

function setGlucoseChartOption(glucoseData: GlucosemeterDaySummary[] | GlucosemeterMeasurement[], opt?: AutochekChartOption) {
	// AGP 그래프
	if (opt.glucoseChart === 'agp') {
		options.series = [{
			name: '식전',
			color: '#0000ff',
			data: []
		}, {
			name: '식후',
			color: '#ff0000',
			data: []
		}, {
			name: '취침 전',
			color: '#000000',
			data: []
		}];
		options.chart = {
			type: 'scatter',
			// 일단 줌은 추 후 설정
			// zoomType: 'xy'
		};
		options.tooltip = {
			formatter() {
				return '<br>' + this.point.tData + '</br> <br>' + this.series.name + ': ' + this.y + 'mg/gL </br>';
			}
		};

		options.xAxis.type = 'datetime';
		options.xAxis.categories = undefined;
		options.xAxis.max = moment().endOf('day').valueOf();
		options.xAxis.min = moment().startOf('day').valueOf();
		options.xAxis.dateTimeLabelFormats = {
			minute: '%H:%M',
			hour: '%H:%M',
			day: '%H:%M'
		};
		const year = moment().get('year');
		const month = moment().get('month');
		const day = moment().get('date');

		glucoseData.forEach(gData => {
			const date = moment(gData.date).set({'year': year, 'month': month, 'date': day}).valueOf();
			const privDate = moment(gData.date).format('M월 D일 hh:mm a');
			if (gData.condition === 'b_meal') {
				options.series[0].data.push({x: date, y: gData.measurement, tData: privDate});
			} else {
				if (gData.timeofday !== 'sleep') {
					options.series[1].data.push({x: date, y: gData.measurement, tData: privDate});
				} else {
					options.series[2].data.push({x: date, y: gData.measurement, tData: privDate});
				}
			}
		});
	} else {
		if (glucoseData[0] instanceof GlucosemeterDaySummary) {
			options.series = [{
				name: '식사 전 일평균',
				type: 'scatter',
				data: []
			}, {
				name: '평균 선 그래프',
				type: 'line',
				color: '#444444',
				data: []
			}];
			options.xAxis.dateTimeLabelFormats = {
				minute: '%H:%M',
				hour: '%H:%M',
				day: '%b월 %e일',
				month: '%b월 %e일'
			};

			options.xAxis.type = 'datetime';
			options.xAxis.categories = undefined;

			if (opt && opt.min) {
				options.xAxis.min = opt.start.getTime();
			}
			if (opt && opt.max) {
				options.xAxis.max = opt.end.getTime();
			}

			options.tooltip = {
				formatter() {
					return '<br>' + Highcharts.dateFormat('%b월 %e일', this.point.x) + '</br> <br>' + this.series.name + ': ' + this.y + 'mg/gL </br>';
				}
			};


			const oneDayBeforeMeal = [];
			const oneDayAfterMeal = [];
			const oneDayBeforeSleep = [];

			const beforeMealArray = [];
			const afterMealArray = [];
			const beforeSleepArray = [];

			glucoseData.forEach(gData => {
				// const mDate = new Date(gData.date).getTime();
				const mDate = moment(gData.date).startOf('day').valueOf();
				if (gData.morningBeforeMeal) {
					beforeMealArray.push([mDate, gData.morningBeforeMeal]);
				}
				if (gData.afternoonBeforeMeal) {
					beforeMealArray.push([mDate, gData.afternoonBeforeMeal]);
				}
				if (gData.eveningBeforeMeal) {
					beforeMealArray.push([mDate, gData.eveningBeforeMeal]);
				}
				if (gData.morningAfterMeal) {
					afterMealArray.push(([mDate, gData.morningAfterMeal]));
				}
				if (gData.afternoonAfterMeal) {
					afterMealArray.push([mDate, gData.afternoonAfterMeal]);
				}
				if (gData.eveningAfterMeal) {
					afterMealArray.push([mDate, gData.eveningAfterMeal]);
				}
				if (gData.beforeSleep) {
					beforeSleepArray.push([mDate, gData.beforeSleep]);
				}

				const beforeMeal = getAverageGlucose(mDate, [gData.morningBeforeMeal, gData.afternoonBeforeMeal, gData.eveningBeforeMeal],
					opt.glucose.b_meal_min, opt.glucose.b_meal_max);
				const afterMeal = getAverageGlucose(mDate, [gData.morningAfterMeal, gData.afternoonAfterMeal, gData.eveningAfterMeal],
					opt.glucose.a_meal_min, opt.glucose.a_meal_max);
				const beforeSleep = getAverageGlucose(mDate, [gData.beforeSleep], opt.glucose.sleep_min, opt.glucose.sleep_max);
				oneDayBeforeMeal.push(beforeMeal);
				oneDayAfterMeal.push(afterMeal);
				oneDayBeforeSleep.push(beforeSleep);
			});

			// options.series[0].data = oneDayBeforeMeal;
			// options.series[1].data = oneDayAfterMeal;
			// options.series[2].data = oneDayBeforeSleep;
			if (opt && opt.glucoseChart) {
				if (opt.glucoseChart === 'beforeMeal') {
					options.title.text = '식전 혈당 차트';
					options.series[0].data = beforeMealArray;
					options.series[1].data = oneDayBeforeMeal;
				} else if (opt.glucoseChart === 'afterMeal') {
					options.title.text = '식후 혈당 차트';
					options.series[0].data = afterMealArray;
					options.series[1].data = oneDayAfterMeal;
				} else if (opt.glucoseChart === 'beforeSleep') {
					options.title.text = '취침 전 혈당 차트';
					options.series[0].data = beforeSleepArray;
					options.series[1].data = oneDayBeforeSleep;
				}
			}
		}
		// } else {
		//   // 하루 조회 일 때
		//   options.xAxis.type = 'category';
		//   options.xAxis.categories = ['아침 식전', '아침 식후', '점심 식전', '점심 식후', '저녁 식전', '저녁 식후', '취침 전'];
		//   options.xAxis.min = 0;
		//   options.xAxis.max = 6;
		//
		//   options.series = [{
		//     type: 'column',
		//     name: '혈당',
		//     data: [],
		//     opacity: 0.8,
		//     borderWidth: 3
		//   }];
		//   glucoseData.forEach(data => {
		//     let sTemp = '';
		//     if (data.timeofday === 'breakfast') {
		//       sTemp += '아침 ';
		//     } else if (data.timeofday === 'lunch') {
		//       sTemp += '점심 ';
		//     } else if (data.timeofday === 'dinner') {
		//       sTemp += '저녁 ';
		//     } else if (data.timeofday === 'sleep') {
		//       sTemp = '취침 전';
		//     }
		//
		//     if (data.condition === 'b_meal') {
		//       sTemp += '식전';
		//     } else {
		//       if (data.timeofday !== 'sleep') {
		//         sTemp += '식후';
		//       }
		//     }
		//     const pushData = [sTemp, data.measurement];
		//     pushToOptionSeries(pushData, options, 0);
		//   });
		// }

		if (opt && opt.start) {
			options.xAxis.min = opt.start.getTime();
		}
		if (opt && opt.end) {
			options.xAxis.max = opt.end.getTime();
		}
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
			enabled: true,
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

function pushToOptionSeries(data, list, i) {
	let hasSameCategory = false;
	list.series[i].data.forEach(el => {
		if (el[0] === data[0]) {
			hasSameCategory = true;
		}
	});
	if (!hasSameCategory) {
		list.series[i].data.push(data);
	} else {
		list.series.push({
			type: 'column',
			name: '혈당',
			data: [],
			opacity: 0.8,
			borderWidth: 3
		});
		pushToOptionSeries(data, list, i + 1);
	}
}
