
import { Routes } from '@angular/router';
import { BookingsComponent } from './bookings';
import { ConfirmedBookingsComponent } from '../confirmed-bookings/confirmed-bookings';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: 'pending',
    component: BookingsComponent,
    title: 'Pending Bookings'
  },
  {
    path: 'confirmed',
    component: ConfirmedBookingsComponent,
    title: 'Confirmed Bookings'
  },
  {
    path: '',
    redirectTo: 'pending',
    pathMatch: 'full'
  }
];