import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecieDetails } from './specie-details';

describe('SpecieDetails', () => {
  let component: SpecieDetails;
  let fixture: ComponentFixture<SpecieDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecieDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecieDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
