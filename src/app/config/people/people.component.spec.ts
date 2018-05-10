import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleConfigComponent } from './people.component';

describe('PeopleConfigComponent', () => {
  let component: PeopleConfigComponent;
  let fixture: ComponentFixture<PeopleConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
