import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardData, EmotionTrend, FormattedQuestion, GeneralStats, GeneralStatsResponse, PeakHour, Question } from '../dashboard.entity';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Obtener estadísticas generales con actualización automática
  getGeneralStats(autoUpdateInterval: number = 30000): Observable<any> {
    return interval(autoUpdateInterval).pipe(
      startWith(0),
      switchMap(() => this.http.get(`${this.apiUrl}/history/stats/general`))
    );
  }

  // Obtener tendencias emocionales con actualización automática
  getEmotionalTrends(days: number = 7, autoUpdateInterval: number = 30000): Observable<any> {
    return interval(autoUpdateInterval).pipe(
      startWith(0),
      switchMap(() => this.http.get<{date: string, avgScale: number}[]>(
        `${this.apiUrl}/history/stats/emotional-trends?days=${days}`
      ))
    );
  }

  // Obtener horas pico con actualización automática
  getActivityPeaks(autoUpdateInterval: number = 30000): Observable<any> {
    return interval(autoUpdateInterval).pipe(
      startWith(0),
      switchMap(() => this.http.get<{hour: number, count: number}[]>(
        `${this.apiUrl}/history/stats/peak-hours`
      ))
    );
  }

  // Obtener distribución de respuestas con actualización automática
  getResponseDistribution(autoUpdateInterval: number = 30000): Observable<any> {
    return interval(autoUpdateInterval).pipe(
      startWith(0),
      switchMap(() => this.http.get<any>(
        `${this.apiUrl}/history/stats/response-effectiveness`
      ).pipe(
        map(data => ({
          local: data.localResponses,
          gpt: data.gptResponses
        }))
      ))
    );
  }

  // Obtener usuarios activos con actualización automática
  getActiveUsers(autoUpdateInterval: number = 30000): Observable<number> {
    return interval(autoUpdateInterval).pipe(
      startWith(0),
      switchMap(() => this.http.get<any[]>(
        `${this.apiUrl}/user/follow-ups/active`
      ).pipe(
        map(users => users.length)
      ))
    );
  }

  getFrequentQuestions(limit: number = 5): Observable<FormattedQuestion[]> {
    return this.http.get<{ topQuestions: Question[] }>(`${this.apiUrl}/history/stats/general`).pipe(
      map(data => {
        if (!data?.topQuestions) return []; 
        
        return data.topQuestions.slice(0, limit).map((q: Question) => this.formatQuestion(q));
      }),
      catchError(err => {
        console.error('Error fetching questions:', err);
        return of([]);
      })
    );
  }

  private formatQuestion(q: Question): FormattedQuestion {
    return {
      question: q.chat_message || q.message || 'Pregunta sin texto',
      count: typeof q.count === 'number' ? q.count : parseInt(q.count) || 0
    };
  }

  // Método combinado para optimizar llamadas
  // dashboard.service.ts
getDashboardData(autoUpdateInterval: number = 30000): Observable<DashboardData> {
  return interval(autoUpdateInterval).pipe(
    startWith(0),
    switchMap(() => forkJoin([
      this.http.get<GeneralStats>(`${this.apiUrl}/history/stats/general`),
      this.http.get<any[]>(`${this.apiUrl}/user/follow-ups/active`),
      this.http.get<EmotionTrend[]>(`${this.apiUrl}/history/stats/emotional-trends?days=7`),
      this.http.get<PeakHour[]>(`${this.apiUrl}/history/stats/peak-hours`)
    ])),
    map(([generalStats, activeUsers, emotionTrends, peakHours]) => {
      // Transformación segura de datos
      const response: DashboardData = {
        generalStats: {
          totalInteractions: generalStats.totalInteractions || 0,
          unansweredQuestions: generalStats.unansweredQuestions || 0,
          topQuestions: generalStats.topQuestions?.map(q => ({
            chat_message: q.chat_message,
            count: q.count
          })) || [],
          responseDistribution: {
            local: generalStats.responseDistribution?.local || 0,
            gpt: generalStats.responseDistribution?.gpt || 0
          },
          responseEffectiveness: generalStats.responseEffectiveness || 0
        },
        activeUsersCount: activeUsers?.length || 0,
        emotionTrends: emotionTrends || [],
        peakHours: peakHours || [],
        frequentQuestions: (generalStats.topQuestions || []).map(q => ({
          question: q.chat_message || 'Pregunta sin texto',
          count: Number(q.count) || 0
        }))
      };
      
      return response;
    })
  );
}
}