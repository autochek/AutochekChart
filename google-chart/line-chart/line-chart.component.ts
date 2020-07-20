import {Component, OnInit} from '@angular/core';
import {GoogleChartService} from '../service/google-chart.service';

@Component({
	selector: 'app-line-chart',
	templateUrl: './line-chart.component.html',
	styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

	private gLib: any;

	constructor(private gChartService: GoogleChartService) {
		this.gLib = this.gChartService.getGoogle();
		this.gLib.charts.load('current', {'packages': ['corechart', 'table']});
		this.gLib.charts.setOnLoadCallback(this.drawChart.bind(this));
	}

	ngOnInit() {

	}

	private drawChart() {
		let data = this.gLib.visualization.arrayToDataTable([
			['Year', 'Sales', 'Expenses'],
			['2004', 1000, 400],
			['2005', 1170, 460],
			['2006', 660, 1120],
			['2007', 1030, 540]
		]);
		let options = {
			'title': '심박수 차',
			'width': '100%',
			'height': '100%'
		};

		let chart = new this.gLib.visualization.LineChart(document.getElementById('divLineChart'));

		chart.draw(data, options);
	}

}

export function drawLineChart(data) {

}
