import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialTable } from './material-table';

describe('MaterialTable', () => {
  let component: MaterialTable;
  let fixture: ComponentFixture<MaterialTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
