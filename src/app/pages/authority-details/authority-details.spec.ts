import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityDetails } from './authority-details';

describe('AuthorityDetails', () => {
  let component: AuthorityDetails;
  let fixture: ComponentFixture<AuthorityDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorityDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorityDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
