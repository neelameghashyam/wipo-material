import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenieAuthorityResults } from './genie-authority-results';

describe('GenieAuthorityResults', () => {
  let component: GenieAuthorityResults;
  let fixture: ComponentFixture<GenieAuthorityResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenieAuthorityResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenieAuthorityResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
