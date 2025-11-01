import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Variety } from '../../../core/models/variety.model';

interface ColumnConfig {
  key: keyof Variety;
  label: string;
  visible: boolean;
}

@Component({
  selector: 'app-material-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    DragDropModule
  ],
  templateUrl: './material-table.html',
  styleUrl: './material-table.scss',
})
export class MaterialTableComponent implements OnChanges {
  @Input() varieties: Variety[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Variety>();

  columns: ColumnConfig[] = [
    { key: 'application_number', label: 'Application Number', visible: true },
    { key: 'countryCode', label: 'Country', visible: true },
    { key: 'fileId', label: 'File ID', visible: true },
    { key: 'grantPublicationDate', label: 'Grant Publication Date', visible: true },
    { key: 'grantStartDate', label: 'Grant Start Date', visible: true },
    { key: 'recType', label: 'Record Type', visible: true },
    { key: 'remarks', label: 'Remarks', visible: true },
    { key: 'speciesLatinName', label: 'Species Latin Name', visible: true },
    { key: 'speciesUpovCode', label: 'UPOV Code', visible: true },
    { key: 'latest_denomination', label: 'Denomination', visible: true },
    { key: 'variety_denomination_class', label: 'Variety Class', visible: false },
    { key: 'variety_identifier', label: 'Variety ID', visible: false },
    { key: 'submission_date', label: 'Submission Date', visible: false }
  ];

  get displayedColumns(): string[] {
    return this.columns.filter(c => c.visible).map(c => c.key);
  }

  ngOnChanges(): void {
    this.dataSource.data = this.varieties;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.sortChange.subscribe(() => {
        console.log('🔄 Sort changed:', this.sort.active, this.sort.direction);
      });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.page.subscribe(event => {
      console.log('📄 Page changed:', event);
    });
  }

  toggleColumn(column: ColumnConfig): void {
    column.visible = !column.visible;
    console.log('👁 Column visibility toggled:', column.key, column.visible);
  }

  dropColumn(event: CdkDragDrop<any>): void {
    const visibleIndices: number[] = [];
    this.columns.forEach((col, idx) => {
      if (col.visible) {
        visibleIndices.push(idx);
      }
    });
    const prevIdx = visibleIndices[event.previousIndex];
    const currIdx = visibleIndices[event.currentIndex];
    moveItemInArray(this.columns, prevIdx, currIdx);
    console.log('🔄 Column reordered');
  }
}