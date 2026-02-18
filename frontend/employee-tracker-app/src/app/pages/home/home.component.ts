import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GuardsService } from '../../services/guards.service';
import { FormsModule } from '@angular/forms';
import { first, firstValueFrom } from 'rxjs';
import { user } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  guards: any[] = [];
  lastReports: any[] = [];

  guardName: string = '';
  selectedGuardId: string = '';
  reportType: string = '';
  reportData: any = {
    late: { date: '', reason: '', scheduledHour: '', actualHour: '' },
    sick: { startDate: '', endDate: '', reason: '' },
    cancellation: { date: '', reason: '' },
  };

  constructor(
    private guardsService: GuardsService,
    private auth: Auth,
    private router: Router
  ) {}
  async ngOnInit(): Promise<void> {
    try {
      this.guards = await this.guardsService.getGuards();
      await this.loadReports();
    } catch (err) {
      console.error('User not logged in or API error', err);
      this.router.navigate(['/login']);
    }
  }

  async submitReport() {
    if (!this.selectedGuardId || !this.reportType) {
      alert('אנא בחר מאבטח וסוג דוח');
      return;
    }
    let endpoint = '';
    let body = {};

    switch (this.reportType) {
      case 'late':
        endpoint = 'lateEntry';
        body = this.reportData.late;
        break;
      case 'sick':
        endpoint = 'sickDay';
        body = this.reportData.sick;
        break;
      case 'cancellation':
        endpoint = 'cancellation';
        body = this.reportData.cancellation;
        break;
    }
    try {
      const token = localStorage.getItem('token');
      await firstValueFrom(
        this.http.put(
          `${environment.apiUrl}/api/guards/${this.selectedGuardId}/${endpoint}`,
          body,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        )
      );
      alert('דוח נשלח בהצלחה');
      this.selectedGuardId = '';
      this.reportType = '';
      await this.loadReports();
    } catch (error: any) {
      const message = error?.error?.error || 'תקלה בשליחת הדיווח';
      alert(message);
      console.error('תקלה בשליחת הדיווח', error);
    }
  }

  async loadReports() {
    try {
      const allReports = await this.guardsService.getReports(); // בלי uid
      const sorted = allReports.sort((a, b) => {
        const dateA = new Date(a.date || a.startDate).getTime();
        const dateB = new Date(b.date || b.startDate).getTime();
        return dateB - dateA;
      });
      this.lastReports = sorted.slice(0, 15);
    } catch (err) {
      console.error('failed to load reports', err);
    }
  }

  viewReport(report: any) {
    this.router.navigateByUrl('/report-card', { state: { report } });
  }
  viewGuardReports(guardId: string) {
    this.router.navigate(['/guard-page', guardId]);
  }
}
