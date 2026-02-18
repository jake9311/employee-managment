import { Component, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccessService } from '../../access-control/access.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private injector = inject(EnvironmentInjector);

  constructor(
    private auth: Auth,
    private router: Router,
    private http: HttpClient,
    private accessService: AccessService
  ) {}

  async login() {
    try {
      await runInInjectionContext(this.injector, async () => {
        await setPersistence(this.auth, browserLocalPersistence);

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await signInWithPopup(this.auth, provider);
        const user = result.user;
        const token = await user.getIdToken();

        localStorage.setItem('token', token);

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        const resp: any = await this.http
          .post(`${environment.apiUrl}/api/users/login`, {}, { headers })
          .toPromise();

        if (resp?.orgId) localStorage.setItem('orgId', resp.orgId);
        if (resp?.role) {
          localStorage.setItem('role', resp.role);
          this.accessService.setRole(resp.role);
        }

        this.router.navigate(['/home']);
      });
    } catch (err: any) {
      console.error('error logging in', err);
      if (err?.status === 403) {
        alert('אין לך הרשאה להכנס, פנה למנהל לקבלת גישה');
      } else {
        alert('שגיאה בהתחברות,נסה שוב.');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('orgId');
      localStorage.removeItem('role');
      this.accessService.clearAuth();
    }
  }
}
