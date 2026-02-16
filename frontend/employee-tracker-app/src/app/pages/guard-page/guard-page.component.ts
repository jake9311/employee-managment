import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GuardsService } from '../../services/guards.service';





@Component({
  selector: 'app-guard-page',
  imports: [MatTableModule, DatePipe, FormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatIconModule, MatNativeDateModule],
  templateUrl: './guard-page.component.html',
  styleUrl: './guard-page.component.css'
})
export class GuardPageComponent implements OnInit {
  originalReports: any[] = [];
  filteredReports: any[] = [];
  searchType: string='';
  startDate: string='';
  endDate: string='';
  guardName: string='';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private location: Location, private guardsService: GuardsService) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const guardId= params.get('id');
      // const ownerId= localStorage.getItem('userId');
      const token= localStorage.getItem('token');
      if(!token){
        this.router.navigate(['/login']);
      }
      // if (guardId&&ownerId){ 
      if(guardId){
      this.loadReports( guardId);
    }})};
  
  

private async loadReports(guardId: string): Promise<void> {
  try {
    const data = await this.guardsService.getReportsByGuard(guardId);
    this.originalReports = data;
    this.filteredReports = [...data];
    this.guardName = data[0].guardName;
  } catch (err) {
    console.error('error receiving reports:', err);
  }
}


applyFilters(): void {
  this.filteredReports = this.originalReports.filter(report => {
    const matchType = !this.searchType || report.type.includes(this.searchType);
    const reportDate = this.toDateOnly(new Date(report.date));
    const start=this.startDate? this.toDateOnly(new Date(this.startDate)):null;
    const end=this.endDate? this.toDateOnly(new Date(this.endDate)):null;
    const matchStart = !start || reportDate>= start;
    const matchEnd = !end || reportDate<= end;

    console.log('reportDate', reportDate);
console.log('start', start);
console.log('end', end);


    return matchType && matchStart && matchEnd;
  });
}



toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

resetFilters(): void {
  this.searchType = '';
  this.startDate = '';
  this.endDate = '';
  this.filteredReports = [...this.originalReports];
}

goBack() {
  this.location.back();
}
viewReport(report: any){
  this.router.navigateByUrl('/report-card', {state:{report}});

}


}