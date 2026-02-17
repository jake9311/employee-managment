import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { Router} from '@angular/router';
import { GuardsService } from '../../services/guards.service';


@Component({
  selector: 'app-reprt-card',
  imports: [CommonModule,MatCardModule,MatButtonModule,MatIconModule],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.css'
})
export class ReportCardComponent {
report: any;
guardsService: GuardsService;

constructor(private location: Location, private router: Router, private guardsServiceInstance: GuardsService) {
  this.guardsService = this.guardsServiceInstance;
  const navigation= this.router.getCurrentNavigation();
    this.report = navigation?.extras.state?.['report'] ;
  }

  saving = false;

async toggleApproval() {
  if (!this.report?.guardId || !this.report?.sickDayId) return;

  this.saving = true;
  try {
    const newValue = !this.report.hasApproval;
    await this.guardsService.updateSickApproval(this.report.guardId, this.report.sickDayId, newValue);
    this.report.hasApproval = newValue; 
  } finally {
    this.saving = false;
  }
}

  
onReportClick(id: string) {
  console.log('clicked', id);
}



goBack() {
  this.location.back();
}
}
