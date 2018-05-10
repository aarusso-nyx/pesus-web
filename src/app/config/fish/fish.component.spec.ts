import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FishConfigComponent } from './fish.component';

describe('FishConfigComponent', () => {
  let component: FishConfigComponent;
  let fixture: ComponentFixture<FishConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FishConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FishConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
