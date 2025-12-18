import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenieSpeciesResults } from './genie-species-results';

describe('GenieSpeciesResults', () => {
  let component: GenieSpeciesResults;
  let fixture: ComponentFixture<GenieSpeciesResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenieSpeciesResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenieSpeciesResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
