import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ReportCardComponent } from './shared/report-card/report-card.component';
import { GuardListComponent } from './pages/guard-list/guard-list.component';
import { GuardPageComponent } from './pages/guard-page/guard-page.component';
import { ExportReportsComponent } from './pages/export-reports/export-reports.component';
import { OwnerOnlyGuard } from './access-control/owner-only.guard';
import { AccessAdminComponent } from './pages/access-admin/access-admin.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'report-card', component: ReportCardComponent },
  { path: 'guard-list', component: GuardListComponent },
  { path: 'guard-page/:id', component: GuardPageComponent },
  { path: 'export-reports', component: ExportReportsComponent },
  { path: 'access-admin', component: AccessAdminComponent, canActivate: [OwnerOnlyGuard] },
  {
    path: 'access-admin',
    canActivate: [OwnerOnlyGuard],
    loadComponent: () =>
      import('./pages/access-admin/access-admin.component').then((m) => m.AccessAdminComponent),
  },

  { path: '**', redirectTo: 'home' },
];
