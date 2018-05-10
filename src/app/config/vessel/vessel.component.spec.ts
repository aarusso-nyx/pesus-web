import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselConfigComponent } from './vessel.component';

describe('VesselConfigComponent', () => {
  let component: VesselConfigComponent;
  let fixture: ComponentFixture<VesselConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
