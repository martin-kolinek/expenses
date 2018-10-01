import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js'
import { EditableRecord } from '../models/editable';
import * as _ from 'lodash'

@Component({
  selector: 'app-category-distribution',
  templateUrl: './category-distribution.component.html',
  styleUrls: ['./category-distribution.component.css']
})
export class CategoryDistributionComponent implements OnInit {

  @ViewChild("canvas") canvas: ElementRef<HTMLCanvasElement>

  chart: Chart
  defaultCurrency: string

  constructor() { }

  ngOnInit() {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {},
      options: {
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: (x, y) => {
              if (typeof x.index == 'undefined' || typeof x.datasetIndex == 'undefined' || !y.labels || !y.datasets || !y.datasets[x.datasetIndex]) {
                return ""
              }

              const data = y.datasets[x.datasetIndex].data
              if (!data) {
                return ""
              }

              return `${y.labels[x.index]}\n${(data[x.index] as number).toLocaleString("sk-SK", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} ${this.defaultCurrency}`
            }
          }
        }
      }
    })
  }

  recordsChanged(records: EditableRecord[]) {
    const categories = _.chain(records).groupBy(p => p.category).map((v, k) => {
      return {
        category: k,
        color: v[0].categoryColor,
        sum: _.sum(v.map(p => Math.abs(p.record.cache.defaultCurrencyAmount || 0)))
      }
    }).value()

    this.chart.data = {
      labels: categories.map(p => p.category),
      datasets: [{
        label: 'Category Distribution',
        data: categories.map(p => p.sum),
        backgroundColor: categories.map(p => p.color)
      }]
    }
    this.chart.update()
  }
}
