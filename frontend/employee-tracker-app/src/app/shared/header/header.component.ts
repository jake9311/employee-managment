import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { signOut } from 'firebase/auth';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { AccessService } from '../../access-control/access.service';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule, MatIconModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(
    private auth: Auth,
    private router: Router,
    private accessService: AccessService
  ) {}
  get role$() {
    return this.accessService.role$;
  }

  homePage() {
    this.router.navigate(['/home']);
  }
  guardListPage() {
    this.router.navigate(['/guard-list']);
  }

  exportReportsPage() {
    this.router.navigate(['/export-reports']);
  }

  accessAdminPage() {
    this.router.navigate(['/access-admin']);
  }

  async logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('orgId');
      localStorage.removeItem('role');
      await signOut(this.auth);
    } finally {
      this.router.navigate(['/login']);
    }
  }
}
