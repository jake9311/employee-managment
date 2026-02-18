import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-export-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatTableModule,
    MatSortModule,
  ],
  templateUrl: './export-reports.component.html',
  styleUrl: './export-reports.component.css',
})
export class ExportReportsComponent implements OnInit {
  guards: any[] = [];
  filteredGuards: any[] = [];

  originalReports: any[] = [];
  filteredReports: any[] = [];

  selectedGuardId: string = '';
  selectedGuardName: string = '';
  selectedType: string = '';
  types: string[] = ['איחור', 'מחלה', 'ביטול'];

  startDate: Date | null = null;
  endDate: Date | null = null;

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatSort) sort!: MatSort;

  private allColumns: string[] = [
    'guardName',
    'type',
    'date',
    'scheduledHour',
    'actualHour',
    'startDate',
    'endDate',
    'hasApproval',
    'reason',
  ];

  displayedColumns: string[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.error('User not logged in');
      this.router.navigate(['/login']);
      return;
    }

    this.http
      .get<any[]>(`${environment.apiUrl}/api/guards`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (data) => {
          this.guards = data;
          this.filteredGuards = data;
        },
        error: (err) => console.error('שגיאה בטעינת מאבטחים', err),
      });

    this.http
      .get<any[]>(`${environment.apiUrl}/api/guards/lastReports`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (data) => {
          this.originalReports = data || [];
          this.filteredReports = [...this.originalReports];
          this.refreshTable(this.filteredReports);
        },
        error: (err) => console.error('שגיאה בטעינת דוחות', err),
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      if (property === 'date') {
        const d = this.getDisplayDate(item);
        return d ? d.getTime() : 0;
      }
      const v = item?.[property];
      return typeof v === 'string' ? v.toLowerCase() : (v ?? '');
    };
  }

  getDisplayDate(r: any): Date | null {
    const raw = r?.date ?? r?.startDate ?? r?.endDate;
    return raw ? new Date(raw) : null;
  }

  filterGuards() {
    const value = (this.selectedGuardName || '').toLowerCase();
    this.filteredGuards = this.guards.filter((g) => (g.name || '').toLowerCase().includes(value));
  }

  onGuardSelected(name: string) {
    const guard = this.guards.find((g) => g.name === name);
    this.selectedGuardId = guard ? guard._id : '';
  }

  applyFilters() {
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    this.filteredReports = this.originalReports.filter((report) => {
      const matchType = !this.selectedType || report.type === this.selectedType;
      const matchGuard = !this.selectedGuardName || report.guardName === this.selectedGuardName;

      const reportDate = this.getDisplayDate(report);
      const matchStart = !start || (reportDate && reportDate >= start);
      const matchEnd = !end || (reportDate && reportDate <= end);

      return matchType && matchGuard && matchStart && matchEnd;
    });

    this.refreshTable(this.filteredReports);
  }

  private refreshTable(reports: any[]) {
    this.buildDisplayedColumns(reports);
    this.dataSource.data = reports;

    if (this.sort) this.dataSource.sort = this.sort;
  }

  private buildDisplayedColumns(reports: any[]) {
    const has = (field: string) =>
      reports?.some((r) => r && r[field] !== undefined && r[field] !== null && r[field] !== '');

    this.displayedColumns = this.allColumns.filter((col) => {
      if (['guardName', 'type', 'date', 'reason'].includes(col)) return true;
      return has(col);
    });
  }

  exportToExcel(): void {
    const headers = [
      'שם עובד',
      'סוג',
      'תאריך',
      'שעת מקור',
      'שעת הגעה',
      'תאריך התחלה',
      'תאריך סיום',
      'אישור מחלה',
      'סיבה',
    ];

    const rows = this.filteredReports.map((r: any) => {
      const displayDate = this.getDisplayDate(r);

      return {
        'שם עובד': r.guardName ?? '',
        סוג: r.type ?? '',
        תאריך: displayDate ? displayDate.toLocaleDateString() : '',

        'שעת מקור': r.type === 'איחור' ? (r.scheduledHour ?? '') : '',
        'שעת הגעה': r.type === 'איחור' ? (r.actualHour ?? '') : '',

        'תאריך התחלה':
          r.type === 'מחלה' && r.startDate ? new Date(r.startDate).toLocaleDateString() : '',
        'תאריך סיום':
          r.type === 'מחלה' && r.endDate ? new Date(r.endDate).toLocaleDateString() : '',

        'אישור מחלה': r.type === 'מחלה' ? (r.hasApproval ? 'הובא' : 'לא הובא') : '',

        סיבה: r.reason ?? r.description ?? '',
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows, { header: headers });

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 70 },
    ];

    const reasonColLetter = 'I';
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    for (let row = 2; row <= range.e.r + 1; row++) {
      const cellAddress = `${reasonColLetter}${row}`;
      const cell = worksheet[cellAddress];
      if (cell) {
        cell.s = cell.s || {};
        cell.s.alignment = { wrapText: true, vertical: 'top' };
      }
    }

    const workbook: XLSX.WorkBook = { Sheets: { דיווחים: worksheet }, SheetNames: ['דיווחים'] };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    FileSaver.saveAs(blob, 'דיווחים.xlsx');
  }

  reportHasField(field: string): boolean {
    return this.filteredReports?.some(
      (report) =>
        report &&
        typeof report === 'object' &&
        field in report &&
        report[field] !== undefined &&
        report[field] !== null &&
        report[field] !== ''
    );
  }
}
