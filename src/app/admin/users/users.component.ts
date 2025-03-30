import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from './service/users.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { EmotionalStatistics, User, UserWithEmotionStats } from './users.entity';

@Component({
  selector: 'app-users',
  imports: [NgApexchartsModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  loading = true;
  
  // Gráficos
  scaleChartOptions: any;
  emotionChartOptions: any;
  stats: any = {
    scaleDistribution: [],
    emotionalStates: [],
    averageScale: 0,
    totalRecords: 0,
    totalUsers: 0
  };

  constructor(private userService: UsersService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.stats = this.userService.calculateStats(users);
        this.prepareCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  prepareCharts(): void {
    // Gráfico de distribución por escala
    this.scaleChartOptions = {
      series: [{
        name: 'Usuarios',
        data: this.stats.scaleDistribution
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: true }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          distributed: true,
          columnWidth: '60%'
        }
      },
      colors: [
        '#ef4444', '#ef4444', '#ef4444', // 1-3: Rojo
        '#f97316', '#f97316',            // 4-5: Naranja
        '#f59e0b',                       // 6: Amarillo
        '#84cc16', '#84cc16',            // 7-8: Verde claro
        '#10b981', '#10b981'             // 9-10: Verde
      ],
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        title: { text: 'Escala Emocional' }
      },
      yaxis: {
        title: { text: 'Número de Usuarios' }
      },
      title: {
        text: 'Distribución por Escala Emocional',
        align: 'center',
        style: { fontSize: '16px' }
      }
    };

    // Gráfico de estados emocionales
    this.emotionChartOptions = {
      series: this.stats.emotionalStates.map((e: any) => e.value),
      chart: {
        type: 'pie',
        height: 350
      },
      labels: this.stats.emotionalStates.map((e: any) => e.name),
      colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }],
      title: {
        text: 'Distribución por Estado Emocional',
        align: 'center',
        style: { fontSize: '16px' }
      }
    };
  }

  searchUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.loading = true;
    this.userService.searchUsers(this.searchTerm).subscribe({
      next: (users) => {
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.loading = false;
      }
    });
  }

  getEmotionalColor(scale: number): string {
    if (!scale) return 'bg-gray-100 text-gray-800';
    if (scale >= 9) return 'bg-green-100 text-green-800';
    if (scale >= 7) return 'bg-blue-100 text-blue-800';
    if (scale >= 6) return 'bg-yellow-100 text-yellow-800';
    if (scale >= 4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  getEmotionalState(scale: number): string {
    return this.userService.getEmotionalState(scale);
  }
}
