import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmDetailComponent } from './alarm-detail.component';

describe('AlarmDetailComponent', () => {
  let component: AlarmDetailComponent;
  let fixture: ComponentFixture<AlarmDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
