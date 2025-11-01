import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialTableComponent } from './components/material-table/material-table';
import { MaterialCardViewComponent } from './components/material-card-view/material-card-view';
import { MaterialAutocompleteComponent } from './components/material-autocomplete/material-autocomplete';
import { LayoutSwitcherComponent, ViewMode } from '../shared/components/layout-switcher/layout-switcher';
import { MockDataService } from '../core/services/mock-data.service';
import { Variety } from '../core/models/variety.model';

@Component({
  selector: 'app-material-results',
  imports: [
    CommonModule,
    MaterialTableComponent,
    MaterialCardViewComponent,
    MaterialAutocompleteComponent,
    LayoutSwitcherComponent
  ],
  templateUrl: './material-results.html',
  styleUrl: './material-results.scss'
})
export class MaterialResultsComponent implements OnInit {
  varieties: Variety[] = [];
  viewMode: ViewMode = 'table';

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.varieties = this.mockDataService.getVarieties();
    console.log('📦 Loaded varieties:', this.varieties.length);
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode = mode;
    console.log('🔄 View mode changed to:', mode);
  }
}
