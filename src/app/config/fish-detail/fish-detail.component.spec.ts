import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FishDetailComponent } from './fish-detail.component';

describe('FishDetailComponent', () => {
  let component: FishDetailComponent;
  let fixture: ComponentFixture<FishDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FishDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FishDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
