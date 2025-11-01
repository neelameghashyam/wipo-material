import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialAutocomplete } from './material-autocomplete';

describe('MaterialAutocomplete', () => {
  let component: MaterialAutocomplete;
  let fixture: ComponentFixture<MaterialAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialAutocomplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
