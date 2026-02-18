import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'owner' | 'admin' | 'user';

export interface AllowedEmailRow {
  id: string;
  orgId: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AccessService {
  private base = `${environment.apiUrl}/api/users`;
  private roleSubject = new BehaviorSubject<Role | null>(
    (localStorage.getItem('role') as Role) || null
  );
  role$ = this.roleSubject.asObservable();

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.roleSubject.next(null);
  }

  constructor(private http: HttpClient) {}

  setRole(role: Role) {
    localStorage.setItem('role', role);
    this.roleSubject.next(role);
  }
  private headers() {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  // --- Owner access admin API ---
  getAllowlist() {
    return this.http.get<AllowedEmailRow[]>(`${this.base}/allowlist`, this.headers());
  }

  addAllow(email: string, role: Role) {
    return this.http.post<AllowedEmailRow>(
      `${this.base}/allowlist`,
      { email, role },
      this.headers()
    );
  }

  deleteAllow(id: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/allowlist/${id}`, this.headers());
  }

  getUsers() {
    return this.http.get<OrgUser[]>(`${this.base}/list`, this.headers());
  }
}
