import * as Highcharts from 'highcharts';
import {HbA1C} from 'autochek-base/objects/device-data-object';
import {chartCommon} from '@AutochekChart/chart.option';

chartCommon(Highcharts);

export function drawHbA1CChart(canvas: string, data: HbA1C[]) {
	const option = setHbA1COption(data);
	Highcharts.chart(canvas, option);
}


function setHbA1COption(hbA1CData: HbA1C[]) {
	const options: any = {
		title: {
			text: '당화 혈색소 차트'
		},
		credits: {
			enabled: false
		},
		tooltip: {
			shared: true,
			xDateFormat: '%m월 %d',
		},
		time: {
			timezone: 'Asia/Seoul'
		},
		xAxis: {
			type: 'datetime',
			title: {
				text: '시간',
				enabled: false
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
