// src/app/shared/components/layout-switcher/layout-switcher.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ViewMode = 'table' | 'card';

@Component({
  selector: 'app-layout-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="layout-switcher">
      <button 
        [class.active]="viewMode === 'table'"
        (click)="switchView('table')"
        class="btn">
        📊 Table View
      </button>
      <button 
        [class.active]="viewMode === 'card'"
        (click)="switchView('card')"
        class="btn">
        🗂️ Card View
      </button>
    </div>
  `,
  styles: [`
    .layout-switcher {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f5f5f5;
    }

    .btn.active {
      background: #1976d2;
      color: white;
      border-color: #1976d2;
    }
  `]
})
export class LayoutSwitcherComponent {
  @Input() viewMode: ViewMode = 'table';
  @Output() viewModeChange = new EventEmitter<ViewMode>();

  switchView(mode: ViewMode): void {
    console.log('🔄 Layout switched to:', mode);
    this.viewMode = mode;
    this.viewModeChange.emit(mode);
  }
}