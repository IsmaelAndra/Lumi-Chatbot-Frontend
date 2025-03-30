import { Routes } from '@angular/router';
import { adminRoutes } from './admin/admin.routes';
import { LayoutComponent } from './admin/shared/layout/layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'admin',
                children: adminRoutes,
                data: { breadcrumb: 'Admin' }
            }
        ]
    },
    { path: '**', redirectTo: 'admin/dashboard' }
];
