import { CandleData, ChartConfig, DisplayFormat } from '../../shared';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-chart-line',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './chart-line.component.html',
  styleUrls: ['./chart-line.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLineComponent implements OnChanges {
  @Input() candleData: CandleData[] = [];
  @Input() wsData: CandleData[] = [];

  chartOption$ = new Subject<ChartConfig>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candleData'] || changes['wsData']) {
      this.updateCandleData();
    }
  }

  formatISODate(timestamp: string): string {
    const date = new Date(timestamp);
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
  }

  updateCandleData(): void {
    this.wsData.forEach((wsCandle) => {
      const wsCandleDate = this.formatISODate(wsCandle.t);
      const lastIndex = this.candleData.length ? this.candleData.length - 1 : 0;
      const lastCandleDate = this.formatISODate(this.candleData[lastIndex].t);

      this.candleData =
        lastCandleDate === wsCandleDate
          ? this.candleData.map((el, index, array) =>
              index === array.length - 1 ? wsCandle : el,
            )
          : this.candleData.concat([wsCandle]);
      this.getChartOption();
    });
  }

  getDataPoints(): DisplayFormat[] {
    return this.candleData.map((candle) => this.mapToCandleFormat(candle));
  }

  mapToCandleFormat(candle: CandleData): DisplayFormat {
    return { label: candle.t, y: [candle.o, candle.h, candle.l, candle.c] };
  }

  getVolumeData(): DisplayFormat[] {
    return this.candleData.map((candle) => this.mapVolumeData(candle));
  }

  mapVolumeData(candle: CandleData): DisplayFormat {
    return { label: this.formatISODate(candle.t), y: candle.v };
  }

  getChartOption(): void {
    const chartConfig = {
      animationEnabled: true,
      theme: 'light2',
      title: {
        text: 'Candle Chart',
      },
      axisY2: {
        labelFormatter: '',
      },
      toolTip: {
        shared: true,
      },
      data: [
        {
          type: 'candlestick',
          showInLegend: false,
          name: 'Stock Price',
          yValueFormatString: '$0.000000',
          dataPoints: this.getDataPoints(),
        },
        {
          type: 'line',
          showInLegend: true,
          name: 'Volume',
          axisYType: 'secondary',
          dataPoints: this.getVolumeData(),
        },
      ],
    };
    this.chartOption$.next(chartConfig);
  }
}
