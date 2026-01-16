import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadUsersComponent } from './load-users.component';

describe('LoadUsersComponent', () => {
  let component: LoadUsersComponent;
  let fixture: ComponentFixture<LoadUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
