import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialsMainComponent } from './financials-main.component';

describe('FinancialsMainComponent', () => {
  let component: FinancialsMainComponent;
  let fixture: ComponentFixture<FinancialsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinancialsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
