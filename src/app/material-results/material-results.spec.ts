import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialResults } from './material-results';

describe('MaterialResults', () => {
  let component: MaterialResults;
  let fixture: ComponentFixture<MaterialResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
