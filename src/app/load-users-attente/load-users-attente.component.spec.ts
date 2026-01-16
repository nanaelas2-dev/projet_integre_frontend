import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadUsersAttenteComponent } from './load-users-attente.component';

describe('LoadUsersAttenteComponent', () => {
  let component: LoadUsersAttenteComponent;
  let fixture: ComponentFixture<LoadUsersAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadUsersAttenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadUsersAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
