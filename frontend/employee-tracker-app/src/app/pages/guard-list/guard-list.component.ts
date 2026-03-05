import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuardsService } from '../../services/guards.service';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-guard-list',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './guard-list.component.html',
  styleUrl: './guard-list.component.css',
})
export class GuardListComponent implements OnInit {
  guards: any[] = [];
  newGuardName: string = '';
  displayedColumns: string[] = ['name', 'actions'];

  constructor(
    private guardsService: GuardsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGuards();
  }

  async addGuard(guardName: string): Promise<void> {
    await this.guardsService.addGuard(guardName);
    alert('מאבטח נוסף בהצלחה');
    this.newGuardName = '';
    this.loadGuards();
  }

  async loadGuards(): Promise<void> {
    try {
      this.guards = await this.guardsService.getGuards();
    } catch (err) {
      console.error('User not logged in or API error', err);
      this.router.navigate(['/login']);
    }
  }

  async deleteGuard(guard: any) {
  const ok = confirm(`למחוק את המאבטח ${guard.name}?`);
  if (!ok) return;

  try {
    await this.guardsService.deleteGuard(guard._id);

    this.guards = this.guards.filter(g => g._id !== guard._id);

  } catch (err:any) {
    alert(err?.error?.error || err?.message || "שגיאה במחיקה");
  }
}

  viewGuardReports(guardId: string) {
    this.router.navigate(['/guard-page', guardId]);
  }
}
