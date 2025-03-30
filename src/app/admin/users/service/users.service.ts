import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { EmotionalRecord, EmotionalStatistics, User, UserWithEmotionStats } from '../users.entity';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  searchUsers(phone: string): Observable<any[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => 
        user.phoneNumber.includes(phone)
      ))
    );
  }

  calculateStats(users: any[]): any {
    const scaleDistribution = Array(10).fill(0);
    const emotionalStates = [
      { name: 'Muy negativo (1-3)', value: 0 },
      { name: 'Negativo (4-5)', value: 0 },
      { name: 'Neutral (6)', value: 0 },
      { name: 'Positivo (7-8)', value: 0 },
      { name: 'Muy positivo (9-10)', value: 0 }
    ];

    let totalScale = 0;
    let usersWithScale = 0;

    users.forEach(user => {
      // Usamos emotionalScale en lugar de lastEmotion.scale
      const scale = user.emotionalScale;
      
      if (scale >= 1 && scale <= 10) {
        scaleDistribution[Math.floor(scale) - 1]++;
        totalScale += scale;
        usersWithScale++;

        if (scale <= 3) emotionalStates[0].value++;
        else if (scale <= 5) emotionalStates[1].value++;
        else if (scale === 6) emotionalStates[2].value++;
        else if (scale <= 8) emotionalStates[3].value++;
        else emotionalStates[4].value++;
      }
    });

    return {
      scaleDistribution,
      emotionalStates: emotionalStates.filter(cat => cat.value > 0),
      averageScale: usersWithScale > 0 ? parseFloat((totalScale / usersWithScale).toFixed(2)) : 0,
      totalRecords: users.reduce((sum, user) => sum + (user.emotionalScale ? 1 : 0), 0),
      totalUsers: users.length
    };
  }

  getEmotionalState(scale: number): string {
    if (!scale) return 'No registrado';
    if (scale >= 9) return 'Muy positivo';
    if (scale >= 7) return 'Positivo';
    if (scale >= 6) return 'Neutral';
    if (scale >= 4) return 'Negativo';
    return 'Muy negativo';
  }
}
