import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { Router} from '@angular/router';


@Component({
  selector: 'app-reprt-card',
  imports: [CommonModule,MatCardModule,MatButtonModule,MatIconModule],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.css'
})
export class ReportCardComponent {
report: any;

constructor(private location: Location, private router: Router) {
  const navigation= this.router.getCurrentNavigation();
    this.report = navigation?.extras.state?.['report'] ;
  }
  


goBack() {
  this.location.back();
}
}
