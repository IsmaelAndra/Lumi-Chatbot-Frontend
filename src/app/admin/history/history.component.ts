import { Component, OnInit } from '@angular/core';
import { HistoryService } from './service/history.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
  providers: [DatePipe]
})
export class HistoryComponent implements OnInit {
  // Datos
  history: any[] = [];
  stats: any = {};
  loading = true;

  // Configuración de gráficos
  trendsChartOptions: any = {};
  peakHoursChartOptions: any = {};
  chartsInitialized = false;

  constructor(private historyService: HistoryService) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  async loadData() {
    try {
      const [history, stats, trends, peakHours] = await Promise.all([
        this.historyService.getHistory().toPromise(),
        this.historyService.getGeneralStats().toPromise(),
        this.historyService.getEmotionalTrends().toPromise(),
        this.historyService.getPeakHours().toPromise()
      ]);

      this.history = history || [];
      this.filteredHistory = [...this.history]; // Inicializa filteredHistory
      this.stats = stats || {};
      this.initCharts(trends || [], peakHours || []);
      this.loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.loading = false;
    }
  }

  searchControl = new FormControl('');
  filteredHistory: any[] = [];

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(phone => {
        this.filterHistory(phone || '');
      });
  }

  filterHistory(phone: string) {
    if (!phone) {
      this.filteredHistory = [...this.history];
      return;
    }
    this.filteredHistory = this.history.filter(item => 
      item.phoneNumber.includes(phone)
    );
  }

  initCharts(trends: any[], peakHours: any[]) {
    // Gráfico de tendencias emocionales
    this.trendsChartOptions = {
      series: [{
        name: 'Tendencia Emocional',
        data: trends.map(t => t.avgScale)
      }],
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false }
      },
      colors: ['#6366F1'],
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      xaxis: {
        categories: trends.map(t => t.date.split('T')[0]),
        labels: { style: { colors: '#6B7280' } }
      },
      yaxis: {
        min: 0,
        max: 10,
        labels: { style: { colors: '#6B7280' } }
      },
      tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => `${val.toFixed(1)}/10` }
      }
    };

    // Gráfico de horas pico
    this.peakHoursChartOptions = {
      series: [{
        name: 'Mensajes',
        data: peakHours.map(p => p.count)
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false }
      },
      colors: ['#10B981'],
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: '45%' }
      },
      xaxis: {
        categories: peakHours.map(p => `${p.hour}:00`),
        labels: { style: { colors: '#6B7280' } }
      },
      yaxis: {
        labels: { style: { colors: '#6B7280' } }
      },
      tooltip: {
        theme: 'light'
      }
    };

    this.chartsInitialized = true;
  }
}
