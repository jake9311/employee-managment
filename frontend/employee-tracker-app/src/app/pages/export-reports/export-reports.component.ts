import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-export-reports',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatCardModule, MatDatepickerModule,MatSelectModule, MatNativeDateModule, MatAutocompleteModule],
  templateUrl: './export-reports.component.html',
  styleUrl: './export-reports.component.css'
})
export class ExportReportsComponent implements OnInit {
guards: any[] = [];
originalReports: any[] = [];
filteredReports: any[] = [];
selectedGuardId: string = '';
filteredGuards: any[] = [];
selectedGuardName: string = '';
selectedType: any = null;
types: string[] = ['איחור', 'מחלה', 'ביטול'];
startDate: Date | null = null;
endDate: Date | null = null;



constructor(private http: HttpClient, private router: Router) {}

ngOnInit(): void {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
   if (!token || !userId) {
        console.error('User not logged in');
        this.router.navigate(['/login']);
        return;
      }
  this.http.get<any[]>(`http://localhost:3000/api/guards`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: data => {
      this.guards = data;
      this.filteredGuards= data;
    },
    error: err => console.error('שגיאה בטעינת מאבטחים', err)
  });

  this.http.get<any>(`http://localhost:3000/api/guards/lastReports`, {
    headers: { Authorization: `Bearer ${token}` }
  }).subscribe({
    next: data => {
      this.originalReports = data;
      this.filteredReports = [...data];
    },
    error:err => console.error('שגיאה בטעינת דוחות', err)
});
  
}



filterGuards(){
  const value= this.selectedGuardName.toLowerCase();
  this.filteredGuards= this.guards.filter(guard=> guard.name.toLowerCase().includes(value));
}

onGuardSelected(name: string){
  const guard= this.guards.find(guard=> guard.name === name);
  if (guard) {
    this.selectedGuardId= guard._id;
}else{
  this.selectedGuardId='';
}
}




applyFilters(){
  this.filteredReports = this.originalReports.filter(report => {
    const matchType = !this.selectedType || report.type === this.selectedType;
    const matchGuard = !this.selectedGuardName || report.guardName === this.selectedGuardName;
    const reportDate = report.date ? new Date(report.date) : new Date(report.startDate);
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    const matchStart = !start || reportDate >= start;
    const matchEnd = !end || reportDate <= end;
    return matchType && matchGuard && matchStart && matchEnd;
  });
}






// exportToExcel(): void {
//   const dataToExport = this.filteredReports.map(report => ({
//     'שם עובד': report.guardName,
//     'תאריך': report.date,
//     'סוג': report.type,
//     'תיאור': report.description
//   }));

//   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
//   const workbook: XLSX.WorkBook = { Sheets: { 'דיווחים': worksheet }, SheetNames: ['דיווחים'] };
//   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//   const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   FileSaver.saveAs(blob, 'דיווחים.xlsx');


// }

exportToExcel(): void {
    const dataToExport = this.filteredReports.map(report => {
      const exportRow: any = {
        'שם עובד': report.guardName,
        'סוג': report.type,
        'תאריך': report.date ? new Date(report.date).toLocaleDateString() : ''
      };

      if (report.type === 'איחור') {
        exportRow['שעת מקור'] = report.scheduledHour || '';
        exportRow['שעת הגעה'] = report.actualHour || '';
      } else if (report.type === 'מחלה') {
        exportRow['מתאריך'] = report.startDate ? new Date(report.startDate).toLocaleDateString() : '';
        exportRow['עד תאריך'] = report.endDate ? new Date(report.endDate).toLocaleDateString() : '';
        exportRow['אישור מחלה'] = report.sickNote ? 'כן' : 'לא';
      }

      exportRow['סיבה'] = report.reason || report.description || '';
      return exportRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'דיווחים': worksheet }, SheetNames: ['דיווחים'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, 'דיווחים.xlsx');
  }






// applyFilters(): void {
//   this.filteredReports = this.originalReports.filter(report => {
//     const matchType = !this.reportType || report.type === this.reportType;
//     const matchName = !this.searchName || report.guardName.includes(this.searchName);
    
//     const reportDate = report.date ? new Date(report.date) : new Date(report.startDate);
//     const start = this.startDate ? new Date(this.startDate) : null;
//     const end = this.endDate ? new Date(this.endDate) : null;
    
//     const matchStart = !start || reportDate >= start;
//     const matchEnd = !end || reportDate <= end;

//     return matchType && matchName && matchStart && matchEnd;
//   });
// }



// reportHasField(field: string): boolean {
//   return this.filteredReports.some(r => r[field] !== undefined&& r[field] !== null);
// }
reportHasField(field: string): boolean {
  return this.filteredReports?.some(report =>
    report && typeof report === 'object' && field in report && report[field] !== undefined && report[field] !== null && report[field] !== ''
  );
}




}