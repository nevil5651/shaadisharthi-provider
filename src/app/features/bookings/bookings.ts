import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingService } from './booking.service';
import { Booking } from './models/booking.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';
// Assuming AuthService exists for getting provider context
// import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  page = 1;
  limit = 20;
  total = 0;
  loading = false;
  displayedColumns: string[] = ['bookingId', 'customerName', 'serviceName', 'eventStartDate', 'totalAmount', 'actions'];

  private readonly destroy$ = new Subject<void>();
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  constructor(
    private bookingService: BookingService,
    // private authService: AuthService, // Uncomment when AuthService is ready
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookings(false); // Initial load
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(append = true): void {
    if (this.loading) return;
    this.loading = true;

    this.bookingService.getPendingBookings(this.page, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.bookings = append ? [...this.bookings, ...data.bookings] : data.bookings;
          this.total = data.total;
          this.loading = false;
          this.cdr.markForCheck(); // Tell Angular to update the view
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error loading bookings', 'OK', { duration: 3000 });
          console.error('API error: ', err);
          this.cdr.markForCheck(); // Also update view on error (e.g., to hide spinner)
        }
      });
  }

  onScroll(): void {
    if (!this.viewport || this.loading) return; 
    const end = this.viewport.getRenderedRange().end;
    const totalDataLength = this.viewport.getDataLength();

    if (end === totalDataLength && this.bookings.length < this.total) {
      this.page++;
      this.loadBookings();
    }
  }

  acceptBooking(bookingId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Confirm Acceptance', message: 'Are you sure you want to accept this booking?' }
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (result?.confirm) {
        this.bookingService.acceptBooking(bookingId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
              this.snackBar.open('Booking accepted successfully', 'OK', { duration: 3000 });
              this.cdr.markForCheck(); // Update the view after removing an item
            },
            error: () => this.snackBar.open('Error accepting booking', 'OK', { duration: 3000 })
          });
      }
    });
  }

  rejectBooking(bookingId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { title: 'Confirm Rejection', message: 'Are you sure you want to reject this booking?', showInput: true }
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (result?.confirm) {
        this.bookingService.rejectBooking(bookingId, result.reason)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
              this.snackBar.open('Booking rejected successfully', 'OK', { duration: 3000 });
              this.cdr.markForCheck(); // Update the view after removing an item
            },
            error: () => this.snackBar.open('Error rejecting booking', 'OK', { duration: 3000 })
          });
      }
    });
  }
}
