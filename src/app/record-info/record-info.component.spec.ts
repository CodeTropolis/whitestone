import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordInfoComponent } from './record-info.component';

describe('RecordInfoComponent', () => {
  let component: RecordInfoComponent;
  let fixture: ComponentFixture<RecordInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
