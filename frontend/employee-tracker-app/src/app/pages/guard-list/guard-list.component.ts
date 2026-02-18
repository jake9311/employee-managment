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
  ],
  templateUrl: './guard-list.component.html',
  styleUrl: './guard-list.component.css',
})
export class GuardListComponent implements OnInit {
  guards: any[] = [];
  newGuardName: string = '';
  displayedColumns: string[] = ['name'];

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

  viewGuardReports(guardId: string) {
    this.router.navigate(['/guard-page', guardId]);
  }
}
