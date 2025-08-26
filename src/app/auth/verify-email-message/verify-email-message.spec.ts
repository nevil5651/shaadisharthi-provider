import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEmailMessage } from './verify-email-message';

describe('VerifyEmailMessage', () => {
  let component: VerifyEmailMessage;
  let fixture: ComponentFixture<VerifyEmailMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyEmailMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
