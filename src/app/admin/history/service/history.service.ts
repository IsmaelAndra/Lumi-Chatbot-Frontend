import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private apiUrl = 'http://localhost:3000/history';

  constructor(private http: HttpClient) { }

  getHistory(phoneNumber?: string, startDate?: string, endDate?: string): Observable<any[]> {
    let url = `${this.apiUrl}/conversations`;
    const params: any = {};
    
    if (phoneNumber) params.phoneNumber = phoneNumber;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http.get<any[]>(url, { params });
  }

  getGeneralStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/general`);
  }

  getEmotionalTrends(days: number = 7): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/emotional-trends?days=${days}`);
  }

  getPeakHours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/peak-hours`);
  }
}
