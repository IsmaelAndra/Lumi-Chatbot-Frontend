import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Inicio' }
    },
    {
        path: 'history',
        loadComponent: () => import('./history/history.component').then(m => m.HistoryComponent),
        data: { breadcrumb: 'Historial' }
    },
    {
        path: 'responses',
        loadComponent: () => import('./responses/responses.component').then(m => m.ResponsesComponent),
        data: { breadcrumb: 'Respuestas' }
    },
    {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
        data: { breadcrumb: 'Usuarios' }
    }
];