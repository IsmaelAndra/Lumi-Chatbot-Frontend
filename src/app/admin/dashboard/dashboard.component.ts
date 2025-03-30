import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { interval, Subscription } from 'rxjs';
import { DashboardService } from './service/dashboard.service';
import { CommonModule } from '@angular/common';
import { EmotionTrend, FormattedQuestion, PeakHour } from './dashboard.entity';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [CommonModule, NgApexchartsModule ],
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Estadísticas principales
  stats = {
    totalInteractions: 0,
    unansweredQuestions: 0,
    activeUsers: 0,
    responseEffectiveness: 0
  };

  // Datos para gráficos
  messageTrendChart: any = {};
  emotionTrendChart: any = {};
  responseTypeChart: any = {};
  activityHeatmap: any = {};
  frequentQuestions: FormattedQuestion[] = [];

  now = new Date();
  loading = true;
  private dataSub!: Subscription;
  private timeSub!: Subscription;
  private freqQuestionsSub!: Subscription;
  private updateInterval = 30000; // 30 segundos

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.updateCurrentTime();
    this.loadFrequentQuestions();
  }

  ngOnDestroy(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    if (this.timeSub) {
      this.timeSub.unsubscribe();
    }
    if (this.freqQuestionsSub) {
      this.freqQuestionsSub.unsubscribe();
    }
  }

  loadFrequentQuestions(): void {
    this.dashboardService.getFrequentQuestions().subscribe({
      next: (questions) => {
        this.frequentQuestions = questions;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
      }
    });
  }

  trackByQuestion(index: number, question: FormattedQuestion): string {
    return `${question.question}-${question.count}`;
  }

  private updateCurrentTime(): void {
    this.timeSub = interval(1000).subscribe(() => {
      this.now = new Date();
    });
  }

  openAddResponseDialog(): void {
    // Implementa aquí la lógica para abrir un diálogo/modal
    console.log('Diálogo para agregar respuesta abierto');
    // Puedes usar MatDialog o similar para implementar esto
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.dataSub = this.dashboardService.getDashboardData(this.updateInterval)
      .subscribe({
        next: (data) => {
          // Debug: Verifica los datos recibidos
          console.log('Datos completos del dashboard:', data);
          
          this.stats = {
            totalInteractions: data.generalStats.totalInteractions,
            unansweredQuestions: data.generalStats.unansweredQuestions,
            activeUsers: data.activeUsersCount,
            responseEffectiveness: data.generalStats.responseEffectiveness
          };
  
          // Debug: Verifica preguntas frecuentes
          console.log('Preguntas frecuentes recibidas:', data.frequentQuestions);
          
          this.frequentQuestions = data.frequentQuestions;
          
          this.initCharts(
            data.generalStats,
            data.emotionTrends,
            data.peakHours
          );
  
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard:', err);
          this.loading = false;
        }
      });
  }

  private initCharts(
    generalStats: any,
    emotionTrends: EmotionTrend[],
    peakHours: PeakHour[]
  ): void {
    this.initMessageTrendChart();
    this.initEmotionTrendChart(emotionTrends);
    this.initResponseTypeChart({
      local: generalStats.responseDistribution.local,
      gpt: generalStats.responseDistribution.gpt
    });
    this.initActivityHeatmap(peakHours);
  }

  initMessageTrendChart(): void {
    this.messageTrendChart = {
      series: [{
        name: 'Mensajes',
        data: [30, 40, 35, 50, 49, 60, 70] // Datos de ejemplo
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        animations: { enabled: true }
      },
      colors: ['#4F46E5'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: {
        categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        title: { text: 'Últimos 7 días' }
      },
      yaxis: {
        title: { text: 'Número de mensajes' }
      },
      tooltip: {
        y: { formatter: (val: number) => `${val} mensajes` }
      }
    };
  }

  initEmotionTrendChart(data: any[]): void {
    this.emotionTrendChart = {
      series: [{
        name: 'Promedio Emocional',
        data: data.map(item => item.avgScale)
      }],
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
        animations: { enabled: true }
      },
      colors: ['#10B981'],
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: data.map(item => item.date),
        title: { text: 'Fecha' }
      },
      yaxis: {
        min: 1,
        max: 10,
        title: { text: 'Escala Emocional (1-10)' }
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}/10` }
      }
    };
  }

  initResponseTypeChart(distribution: any): void {
    this.responseTypeChart = {
      series: [distribution.local, distribution.gpt],
      chart: {
        type: 'donut',
        width: '100%',
        height: 350,
        animations: { enabled: true }
      },
      labels: ['Respuestas Locales', 'GPT'],
      colors: ['#3B82F6', '#8B5CF6'],
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => `${distribution.local + distribution.gpt} respuestas`
              }
            }
          }
        }
      }
    };
  }

  initActivityHeatmap(data: any[]): void {
    // Preparar datos para el heatmap (24 horas)
    const heatmapData = Array(24).fill(0).map((_, hour) => {
      const hourData = data.find(d => d.hour === hour);
      return hourData ? hourData.count : 0;
    });

    this.activityHeatmap = {
      series: [{
        name: 'Interacciones',
        data: heatmapData
      }],
      chart: {
        type: 'heatmap',
        height: 350,
        toolbar: { show: false },
        animations: { enabled: true }
      },
      dataLabels: { enabled: false },
      colors: ['#3B82F6'],
      xaxis: {
        categories: Array(24).fill(0).map((_, i) => `${i}:00`),
        title: { text: 'Hora del día' }
      },
      yaxis: { show: false },
      tooltip: {
        y: { formatter: (val: number) => `${val} interacciones` }
      }
    };
  }

  // Método para formatear números grandes
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}