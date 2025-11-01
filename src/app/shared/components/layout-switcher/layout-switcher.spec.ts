import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSwitcher } from './layout-switcher';

describe('LayoutSwitcher', () => {
  let component: LayoutSwitcher;
  let fixture: ComponentFixture<LayoutSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSwitcher]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
