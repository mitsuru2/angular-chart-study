import { Component, OnInit, computed, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';

interface DataItemData {
  name: string;
  value: [string, number];
}

@Component({
  imports: [NgxEchartsDirective],
  selector: 'app-streaming-chart',
  styleUrl: './streaming-chart.scss',
  templateUrl: './streaming-chart.html',
})
export class StreamingChart implements OnInit {
  private now = new Date(1997, 9, 3);
  private oneDay = 24 * 3600 * 1000;
  private value = Math.random() * 1000;

  private data = signal<DataItemData[]>([]);

  ngOnInit() {
    const initialData: DataItemData[] = [];
    for (var i = 0; i < 200; i++) {
      initialData.push(this.randomData());
    }
    this.data.set(initialData);

    setInterval(() => {
      this.data.update((current) => [
        ...current.slice(1),
        ...Array.from({ length: 1 }, () => this.randomData()),
      ]);
    }, 200);
  }

  private randomData(): DataItemData {
    this.now = new Date(+this.now + this.oneDay);
    this.value = this.value + Math.random() * 21 - 10;
    return {
      name: this.now.toString(),
      value: [
        [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
        Math.round(this.value),
      ],
    };
  }

  protected option = {
    title: {
      text: 'Dynamic Data & Time Axis',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: DataItemData[]) {
        const param = params[0];
        var date = new Date(param.name);
        return (
          date.getDate() +
          '/' +
          (date.getMonth() + 1) +
          '/' +
          date.getFullYear() +
          ' : ' +
          param.value[1]
        );
      },
      axisPointer: {
        animation: false,
      },
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: 'Fake Data',
        type: 'line',
        showSymbol: false,
        data: [] as DataItemData[],
      },
    ],
    animationDurationUpdate: 200,
    animationEasingUpdate: 'linear' as const,
  };

  protected mergeOption = computed(() => ({
    series: [
      {
        data: this.data(),
      },
    ],
  }));
}
