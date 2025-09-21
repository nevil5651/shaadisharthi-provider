import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

import { VerifyEmailMessageComponent } from './verify-email-message';

describe('VerifyEmailMessageComponent', () => {
  let component: VerifyEmailMessageComponent;
  let fixture: ComponentFixture<VerifyEmailMessageComponent>;
  const fakeActivatedRoute = {
    snapshot: {
      queryParamMap: convertToParamMap({ token: 'mock-token' })
    },
    queryParamMap: of(convertToParamMap({ token: 'mock-token' }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyEmailMessageComponent, HttpClientTestingModule, ToastrModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: fakeActivatedRoute as any }
      ]
    })
    .compileComponents(); // Changed from VerifyEmailMessage to VerifyEmailMessageComponent

    fixture = TestBed.createComponent(VerifyEmailMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
