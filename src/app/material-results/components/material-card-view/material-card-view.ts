import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Variety } from '../../../core/models/variety.model';

@Component({
  selector: 'app-material-card-view',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './material-card-view.html',
  styleUrl: './material-card-view.scss',
})
export class MaterialCardViewComponent {
  @Input() varieties: Variety[] = [];
}