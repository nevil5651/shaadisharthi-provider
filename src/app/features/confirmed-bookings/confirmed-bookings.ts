
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingService } from '../bookings/booking.service';
import { Booking, BookingsResponse } from '../bookings/models/booking.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-confirmed-bookings',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './confirmed-bookings.html',
  styleUrl: './confirmed-bookings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmedBookingsComponent implements OnInit, OnDestroy, AfterViewInit {
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
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBookings(false);
  }

  ngAfterViewInit(): void {
    // Check viewport after it's initialized
    setTimeout(() => {
      if (this.viewport) {
        this.viewport.checkViewportSize();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(append = true): void {
    if (this.loading) return;
    this.loading = true;

    this.bookingService.getConfirmedBookings(this.page, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BookingsResponse) => {
          // console.log('API Response:', response);
          
          if (response && response.bookings && Array.isArray(response.bookings)) {
            this.bookings = append ? [...this.bookings, ...response.bookings] : response.bookings;
            this.total = response.total || 0;
            
            // console.log('Bookings array after update:', this.bookings);
            // console.log('Total bookings:', this.total);
            
            // Force update of virtual scroll viewport after data is loaded
            setTimeout(() => {
              if (this.viewport) {
                this.viewport.checkViewportSize();
                // Also try to force a rerender
                this.viewport.scrollToIndex(0);
              }
            }, 0);
          } else {
            // console.error('Unexpected response format:', response);
            this.toastr.error('Unexpected data format received', 'Error');
          }
          
          this.loading = false;
          this.cdr.markForCheck(); // Force change detection
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error('Error loading bookings', 'Error');
          // console.error('API error: ', err);
          this.cdr.markForCheck();
        }
      });
  }

  onScroll(): void {
    if (!this.viewport || this.loading) return;
    
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    
    // Load more when scrolled to the bottom
    if (end === total && this.bookings.length < this.total) {
      this.page++;
      this.loadBookings(true);
    }
  }

  cancelBooking(bookingId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { 
        title: 'Confirm Cancellation', 
        message: 'Are you sure you want to cancel this confirmed booking?',
        showInput: true,
        inputLabel: 'Cancellation reason'
      }
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (result?.confirm) {
        this.bookingService.cancelBooking(bookingId, result.reason)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
              this.toastr.success('Booking cancelled successfully', 'Success');
              this.cdr.markForCheck();
            },
            error: () => this.toastr.error('Error cancelling booking', 'Error')
          });
      }
    });
  }

  completeBooking(bookingId: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { 
        title: 'Mark as Completed', 
        message: 'Are you sure you want to mark this booking as completed?'
      }
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (result?.confirm) {
        this.bookingService.completeBooking(bookingId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.bookings = this.bookings.filter(b => b.bookingId !== bookingId);
              this.toastr.success('Booking marked as completed', 'Success');
              this.cdr.markForCheck();
            },
            error: () => this.toastr.error('Error completing booking', 'Error')
          });
      }
    });
  }

  // Add trackBy function for better virtual scroll performance
  trackByBookingId(index: number, booking: Booking): number {
    return booking.bookingId;
  }
}