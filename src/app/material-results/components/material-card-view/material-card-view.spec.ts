import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCardView } from './material-card-view';

describe('MaterialCardView', () => {
  let component: MaterialCardView;
  let fixture: ComponentFixture<MaterialCardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialCardView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialCardView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
