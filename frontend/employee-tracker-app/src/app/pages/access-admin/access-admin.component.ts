import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AccessService, AllowedEmailRow, OrgUser, Role } from '../../access-control/access.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule }       from '@angular/material/paginator';
import { MatSortModule, MatSort }            from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';



@Component({
  selector: 'app-access-admin',
  imports: [ MatCardModule, MatTableModule, MatButtonModule, MatDividerModule , MatInputModule, MatSelectModule, MatIconModule, FormsModule, CommonModule,  MatProgressSpinnerModule, MatPaginatorModule, MatSortModule],
  templateUrl: './access-admin.component.html',
  styleUrl: './access-admin.component.css'
})
export class AccessAdminComponent implements OnInit 
{
newEmail: string = '';  
newRole: Role = 'user';
adding=false;
allowlistDS = new MatTableDataSource<AllowedEmailRow>([]);
usersDS     = new MatTableDataSource<OrgUser>([]);

allowlistDisplayed = ['email', 'role', 'createdAt', 'actions'];
usersDisplayed     = ['name', 'email', 'role'];

loadingAllowlist = false;
loadingUsers = false;

allowlistFilter = '';
usersFilter = '';

private normalizeEmail(email: string): string {
  return (email || '' ).trim().toLowerCase();
}
private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;



@ViewChild(MatPaginator) allowlistPaginator!: MatPaginator;
@ViewChild(MatSort)      allowlistSort!: MatSort;
@ViewChild('usersPaginator') usersPaginator!: MatPaginator;
@ViewChild("userSort") usersSort!: MatSort;


constructor(private accessService: AccessService) {}

ngOnInit() {
  this.loadAllowlist();
  this.loadUsers();
}

ngAfterViewInit() {
  queueMicrotask(() => {
    if (this.allowlistDS) {
      this.allowlistDS.paginator = this.allowlistPaginator;
      this.allowlistDS.sort = this.allowlistSort;
    }
    if (this.usersDS) {
      this.usersDS.paginator = this.usersPaginator;
      this.usersDS.sort = this.usersSort;
    }
  });
}

loadAllowlist() {
  this.loadingAllowlist = true;
  this.accessService.getAllowlist().subscribe({
    next: rows => {
      this.allowlistDS.data = rows || [];
      this.loadingAllowlist = false;
    },
    error: _ => this.loadingAllowlist = false
  });
}

loadUsers() {
  this.loadingUsers = true;
  this.accessService.getUsers().subscribe({
    next: rows => {
      this.usersDS.data = rows || [];
      this.loadingUsers = false;
    },
    error: _ => this.loadingUsers = false
  });
}

applyAllowlistFilter(ev: Event) {
  const val = (ev.target as HTMLInputElement).value?.trim().toLowerCase() || '';
  this.allowlistFilter = val;
  this.allowlistDS.filter = val;
  this.allowlistDS.filterPredicate = (row, filter) =>
    (row.email + ' ' + row.role).toLowerCase().includes(filter);
}

clearAllowlistFilter() {
  this.allowlistFilter = '';
  this.allowlistDS.filter = '';
}

applyUsersFilter(ev: Event) {
  const val = (ev.target as HTMLInputElement).value?.trim().toLowerCase() || '';
  this.usersFilter = val;
  this.usersDS.filter = val;
  this.usersDS.filterPredicate = (row, filter) =>
    (row.name + ' ' + row.email + ' ' + row.role).toLowerCase().includes(filter);
}

clearUsersFilter() {
  this.usersFilter = '';
  this.usersDS.filter = '';
}

public onEmailChange(email: string) {
  this.newEmail = this.normalizeEmail(email);
}

public isDuplicateEmail(email: string): boolean {
  return this.allowlistDS.data.some(row => this.normalizeEmail(row.email) === this.normalizeEmail(email));
}

addEmail(emailCtrl: any) {
  const email = this.normalizeEmail(this.newEmail);
  if (!email || !this.emailPattern.test(email)) return; 

  if (this.isDuplicateEmail(email)) {
    alert('האימייל כבר קיים ברשימת המורשים');
    return;
  }


  const roleForServer = this.newRole === 'admin' ? ('admin' as Role) : this.newRole;

  this.adding = true;
  this.accessService.addAllow(email, roleForServer).subscribe({
    next: _ => {
      this.loadAllowlist();
      emailCtrl.reset();
      this.newEmail = '';
      this.adding = false;
      
    },
    error: _ => {
      this.adding = false;
      alert('נכשל בהוספה. ודא שהאימייל לא קיים ושסוג התפקיד תואם לשרת.');
    }
  });
}

deleteEmail(id: string) {
  this.accessService.deleteAllow(id).subscribe({
    next: _ => this.loadAllowlist()
  });
}





}
