import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmedBookings } from './confirmed-bookings';

describe('ConfirmedBookings', () => {
  let component: ConfirmedBookings;
  let fixture: ComponentFixture<ConfirmedBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmedBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmedBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
